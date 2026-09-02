import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import crypto from "crypto";

export const AUTHENTICATE = false;

/**
 * ZaloPay gọi POST đến đây để xác nhận giao dịch (server-to-server callback).
 * Sau đó redirect user về storefront /checkout/zalopay_return.
 * 
 * ZaloPay cũng redirect user về embed_data.redirecturl sau khi thanh toán,
 * kèm theo query params: apptransid, status, amount, checksum.
 */
async function handleCallback(req: MedusaRequest, res: MedusaResponse) {
  try {
    const FRONTEND_URL = process.env.STORE_FRONTEND_URL || "http://localhost:5174";

    // ZaloPay gửi POST khi callback server-to-server
    // ZaloPay redirect GET về embed_data.redirecturl (đây là FE, không phải route này)
    // Route này chỉ nhận POST callback từ ZaloPay server
    const body = req.method === "POST" ? (req.body as any) : (req.query as any);
    console.log("[ZaloPay Callback] Method:", req.method, "| Body/Query:", body);

    const KEY2 = process.env.ZALOPAY_KEY2 || "trMrHcgtiO6HQY6pNUIZpiNV2rupjZXu";

    // ─── Xác thực MAC (chỉ áp dụng cho POST server-to-server) ──────────────
    if (req.method === "POST" && body.mac) {
      const dataStr = body.data;
      const receivedMac = body.mac;
      const expectedMac = crypto.createHmac("sha256", KEY2).update(dataStr).digest("hex");
      if (receivedMac !== expectedMac) {
        console.warn("[ZaloPay Callback] ❌ MAC mismatch! Possible tampered request.");
        return res.status(200).json({ return_code: -1, return_message: "mac not equal" });
      }

      // Parse data JSON từ ZaloPay server callback
      let callbackData: any;
      try { callbackData = JSON.parse(dataStr); } catch { callbackData = {}; }
      console.log("[ZaloPay Callback] Server callback data:", callbackData);

      const appTransId: string = callbackData.app_trans_id || "";
      const embedDataStr: string = callbackData.embed_data || "{}";
      let medusaOrderId: string = "";
      try {
        const embedData = JSON.parse(embedDataStr);
        medusaOrderId = embedData.medusa_order_id || "";
      } catch { /* ignore */ }

      // Fallback: tra trong __zalopayOrders map
      if (!medusaOrderId && appTransId) {
        const zalopayMap = (global as any).__zalopayOrders as Map<string, any> | undefined;
        const mapEntry = zalopayMap?.get(appTransId);
        medusaOrderId = mapEntry?.medusaOrderId || "";
      }

      if (!medusaOrderId) {
        console.error("[ZaloPay Callback] Cannot find medusaOrderId for app_trans_id:", appTransId);
        return res.status(200).json({ return_code: 1, return_message: "ok (order not found in cache)" });
      }

      // ─── Mark Medusa order payment as PAID ───────────────────────────────
      await markOrderPaid(req, medusaOrderId, callbackData.amount || 0);

      return res.status(200).json({ return_code: 1, return_message: "success" });
    }

    // ─── GET redirect từ ZaloPay về (hoặc fallback) ───────────────────────
    const query = req.query as Record<string, string>;
    const appTransId = query.apptransid || query.app_trans_id || "";
    const statusParam = query.status;
    const amount = query.amount || "0";

    const isSuccess = statusParam === "1";

    if (isSuccess && appTransId) {
      console.log(`[ZaloPay Callback] ✅ User redirected back — payment success: ${appTransId}`);

      // Tìm medusaOrderId qua __zalopayOrders
      const zalopayMap = (global as any).__zalopayOrders as Map<string, any> | undefined;
      const mapEntry = zalopayMap?.get(appTransId);
      const medusaOrderId: string = mapEntry?.medusaOrderId || appTransId;

      await markOrderPaid(req, medusaOrderId, parseInt(amount) || 0);

      const params = new URLSearchParams({ ...query, medusa_order_id: medusaOrderId }).toString();
      return res.redirect(302, `${FRONTEND_URL}/checkout/zalopay_return?${params}`);
    } else {
      console.log(`[ZaloPay Callback] ❌ Payment failed/cancelled: ${appTransId}, status: ${statusParam}`);
      
      const zalopayMap = (global as any).__zalopayOrders as Map<string, any> | undefined;
      const mapEntry = zalopayMap?.get(appTransId);
      const medusaOrderId: string = mapEntry?.medusaOrderId || appTransId;

      if (mapEntry && !mapEntry.restored) {
        try {
          const productModuleService = req.scope.resolve(Modules.PRODUCT);
          for (const item of mapEntry.items || []) {
            if (item.id && item.qty) {
              const variant = (await productModuleService.retrieveProductVariant(item.id)) as any;
              if (variant && typeof variant.inventory_quantity === "number") {
                const newQuantity = variant.inventory_quantity + item.qty;
                await productModuleService.updateProductVariants(item.id, {
                  inventory_quantity: newQuantity,
                } as any);
              }
            }
          }
          mapEntry.restored = true;
          console.log(`[ZaloPay Callback] Restored inventory for failed/canceled order ${appTransId}`);

          const db = (req.scope as any).resolve("__pg_connection__");
          await db.raw(
            `UPDATE "order"
             SET status = 'canceled', metadata = COALESCE(metadata, '{}'::jsonb) || '{"payment_status":"failed"}'::jsonb, updated_at = NOW()
             WHERE id = ?`,
            [medusaOrderId]
          );
        } catch (err) {
          console.error(`[ZaloPay Callback] Failed to restore inventory/update DB for ${appTransId}:`, err);
        }
      }

      const params = new URLSearchParams(query).toString();
      return res.redirect(302, `${FRONTEND_URL}/checkout/zalopay_return?${params}`);
    }
  } catch (error) {
    console.error("[ZaloPay Callback] Unhandled error:", error);
    const FRONTEND_URL = process.env.STORE_FRONTEND_URL || "http://localhost:5174";
    if (req.method === "POST") {
      return res.status(200).json({ return_code: -1, return_message: "internal error" });
    }
    return res.redirect(302, `${FRONTEND_URL}/checkout`);
  }
}

/**
 * Đánh dấu đơn hàng Medusa là đã thanh toán.
 * - Tạo payment_collection + payment + order_transaction nếu chưa có
 * - Cập nhật order metadata.payment_status = 'paid'
 */
async function markOrderPaid(req: MedusaRequest, medusaOrderId: string, amount: number) {
  try {
    const db = (req.scope as any).resolve("__pg_connection__");

    // Kiểm tra đã paid chưa
    const orderRes = await db.raw(
      `SELECT id, metadata FROM "order" WHERE id = ? LIMIT 1`,
      [medusaOrderId]
    );
    if (!orderRes.rows.length) {
      console.warn(`[ZaloPay markOrderPaid] Order not found: ${medusaOrderId}`);
      return;
    }
    const order = orderRes.rows[0];
    if (order.metadata?.payment_status === "paid") {
      console.log(`[ZaloPay markOrderPaid] Order ${medusaOrderId} already marked paid, skip.`);
      return;
    }

    // ─── Tạo payment_collection nếu chưa có ──────────────────────────────
    const existingPC = await db.raw(
      `SELECT pc.id, pc.amount FROM payment_collection pc
       JOIN order_payment_collection opc ON pc.id = opc.payment_collection_id
       WHERE opc.order_id = ? LIMIT 1`,
      [medusaOrderId]
    );

    let paycolId: string;
    let paycolAmount: number;

    if (existingPC.rows.length === 0) {
      // Tạo mới payment_collection
      const { createOrderPaymentCollectionWorkflow } = require("@medusajs/core-flows");
      try {
        const { result: paymentCollections } = await createOrderPaymentCollectionWorkflow(req.scope).run({
          input: { order_id: medusaOrderId, amount }
        });
        paycolId = paymentCollections?.[0]?.id;
        paycolAmount = amount;
        console.log(`[ZaloPay markOrderPaid] Payment collection created: ${paycolId}`);
      } catch (err: any) {
        console.warn("[ZaloPay markOrderPaid] createOrderPaymentCollectionWorkflow failed:", err.message);
        // Fallback: insert thủ công
        const generateId = (prefix: string) => {
          const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
          let r = "";
          for (let i = 0; i < 18; i++) r += chars[Math.floor(Math.random() * chars.length)];
          return `${prefix}_01${r}`;
        };
        paycolId = generateId("paycol");
        paycolAmount = amount;
        const rawAmt = JSON.stringify({ value: amount.toString(), precision: 20 });
        await db.raw(
          `INSERT INTO payment_collection (id, currency_code, amount, raw_amount, status, created_at, updated_at)
           VALUES (?, 'vnd', ?, ?, 'not_paid', NOW(), NOW())`,
          [paycolId, amount, rawAmt]
        );
        await db.raw(
          `INSERT INTO order_payment_collection (order_id, payment_collection_id)
           VALUES (?, ?)`,
          [medusaOrderId, paycolId]
        );
      }
    } else {
      paycolId = existingPC.rows[0].id;
      paycolAmount = existingPC.rows[0].amount || amount;
    }

    // ─── Tạo payment session + payment + transaction (nếu chưa có) ────────
    const existingPay = await db.raw(
      `SELECT id FROM payment WHERE payment_collection_id = ? LIMIT 1`,
      [paycolId]
    );

    if (existingPay.rows.length === 0) {
      const generateId = (prefix: string) => {
        const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let r = "";
        for (let i = 0; i < 18; i++) r += chars[Math.floor(Math.random() * chars.length)];
        return `${prefix}_01${r}`;
      };
      const paySessionId = generateId("payses");
      const paymentId = generateId("pay");
      const trxId = generateId("ordtrx");
      const rawAmt = JSON.stringify({ value: paycolAmount.toString(), precision: 20 });

      await db.raw(
        `INSERT INTO payment_session (id, currency_code, amount, raw_amount, provider_id, data, context, status, authorized_at, payment_collection_id, metadata, created_at, updated_at)
         VALUES (?, 'vnd', ?, ?, 'zalopay', '{}', '{}', 'authorized', NOW(), ?, '{"provider":"zalopay"}', NOW(), NOW())`,
        [paySessionId, paycolAmount, rawAmt, paycolId]
      );
      await db.raw(
        `INSERT INTO payment (id, amount, raw_amount, currency_code, provider_id, created_at, updated_at, captured_at, payment_collection_id, payment_session_id, data, metadata)
         VALUES (?, ?, ?, 'vnd', 'zalopay', NOW(), NOW(), NOW(), ?, ?, '{}', '{"provider":"zalopay"}')`,
        [paymentId, paycolAmount, rawAmt, paycolId, paySessionId]
      );
      await db.raw(
        `INSERT INTO order_transaction (id, order_id, version, amount, raw_amount, currency_code, reference, reference_id, created_at, updated_at)
         VALUES (?, ?, 1, ?, ?, 'vnd', 'capture', ?, NOW(), NOW())`,
        [trxId, medusaOrderId, paycolAmount, rawAmt, paymentId]
      );

      // Cập nhật order_summary
      const summaryRes = await db.raw(
        `SELECT id, totals FROM order_summary WHERE order_id = ?`,
        [medusaOrderId]
      );
      if (summaryRes.rows.length > 0) {
        const summary = summaryRes.rows[0];
        const newTotals = {
          ...summary.totals,
          paid_total: paycolAmount,
          raw_paid_total: { value: paycolAmount.toString(), precision: 20 },
          transaction_total: paycolAmount,
          raw_transaction_total: { value: paycolAmount.toString(), precision: 20 },
          pending_difference: 0,
          raw_pending_difference: { value: "0", precision: 20 },
        };
        await db.raw(
          `UPDATE order_summary SET totals = ?, updated_at = NOW() WHERE id = ?`,
          [JSON.stringify(newTotals), summary.id]
        );
      }
    }

    // ─── Cập nhật payment_collection.status = authorized ──────────────────
    const rawAmt = JSON.stringify({ value: paycolAmount.toString(), precision: 20 });
    await db.raw(
      `UPDATE payment_collection
       SET status = 'authorized', captured_amount = ?, raw_captured_amount = ?,
           authorized_amount = ?, raw_authorized_amount = ?, updated_at = NOW()
       WHERE id = ?`,
      [paycolAmount, rawAmt, paycolAmount, rawAmt, paycolId]
    );

    // ─── Cập nhật order metadata payment_status = paid ───────────────────
    const currentMeta = order.metadata || {};
    const newMeta = { ...currentMeta, payment_status: "paid", payment_method: "zalopay" };
    await db.raw(
      `UPDATE "order" SET metadata = ?, updated_at = NOW() WHERE id = ?`,
      [JSON.stringify(newMeta), medusaOrderId]
    );

    console.log(`[ZaloPay markOrderPaid] ✅ Order ${medusaOrderId} marked as paid!`);

    // ─── Emit event ───────────────────────────────────────────────────────
    try {
      const eventBus = req.scope.resolve(Modules.EVENT_BUS);
      await eventBus.emit({
        name: "order.placed",
        data: { id: medusaOrderId, payment_status: "paid", method: "zalopay" },
      });
    } catch (eventErr: any) {
      console.warn("[ZaloPay markOrderPaid] Event emit skipped:", eventErr.message);
    }
  } catch (err: any) {
    console.error("[ZaloPay markOrderPaid] Error:", err.message);
  }
}

export const GET = handleCallback;
export const POST = handleCallback;
