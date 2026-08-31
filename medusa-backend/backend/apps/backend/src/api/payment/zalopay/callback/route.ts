import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import crypto from "crypto";

export const AUTHENTICATE = false;

/**
 * ZaloPay gọi POST đến đây để xác nhận giao dịch (server-to-server).
 * ZaloPay cũng redirect user về embed_data.redirecturl (FE) trực tiếp.
 * Route này xử lý cả GET (redirect từ embed_data.redirecturl nếu trỏ về đây)
 * và POST (server callback).
 */
async function handleCallback(req: MedusaRequest, res: MedusaResponse) {
  try {
    const FRONTEND_URL = process.env.STORE_FRONTEND_URL || "http://localhost:5174";
    const KEY2 = process.env.ZALOPAY_KEY2 || "trMrHcgtiO6HQY6pNUIZpiNV2rupjZXu";

    let appTransId = "";
    let statusCode = "";
    let amount = "0";
    let medusaOrderId = ""; // Medusa order ID thật

    // ─── POST: Server-to-server callback từ ZaloPay ────────────────────────
    if (req.method === "POST") {
      const body = req.body as any;
      console.log("[ZaloPay Callback POST] body:", body);

      // Xác thực MAC
      if (body.mac && body.data) {
        const expectedMac = crypto
          .createHmac("sha256", KEY2)
          .update(body.data)
          .digest("hex");
        if (body.mac !== expectedMac) {
          console.warn("[ZaloPay Callback POST] ❌ MAC mismatch");
          return res.status(200).json({ return_code: -1, return_message: "mac not equal" });
        }
      }

      let callbackData: any = {};
      try {
        callbackData = body.data ? JSON.parse(body.data) : body;
      } catch {
        callbackData = body;
      }

      appTransId = callbackData.app_trans_id || "";
      statusCode = callbackData.status?.toString() || "1"; // ZaloPay POST callback: thành công không có status field, mặc định 1
      amount = callbackData.amount?.toString() || "0";

      // Lấy medusa_order_id từ embed_data
      try {
        const embedData = JSON.parse(callbackData.embed_data || "{}");
        medusaOrderId = embedData.medusa_order_id || "";
      } catch { /* ignore */ }

      // Fallback: tra trong global map
      if (!medusaOrderId && appTransId) {
        const zalopayMap = (global as any).__zalopayOrders as Map<string, any> | undefined;
        medusaOrderId = zalopayMap?.get(appTransId)?.medusaOrderId || "";
      }

      if (!medusaOrderId) {
        console.warn("[ZaloPay Callback POST] Cannot find medusaOrderId for:", appTransId);
        return res.status(200).json({ return_code: 1, return_message: "ok" });
      }

      await markOrderPaid(req, medusaOrderId, parseInt(amount) || 0, appTransId);
      return res.status(200).json({ return_code: 1, return_message: "success" });
    }

    // ─── GET: Redirect về từ ZaloPay (qua embed_data.redirecturl) ──────────
    const query = req.query as Record<string, string>;
    console.log("[ZaloPay Callback GET] query:", query);

    appTransId = query.apptransid || query.app_trans_id || "";
    statusCode = query.status || "";
    amount = query.amount || "0";

    // Lấy medusa_order_id từ query (ta gắn vào khi redirect)
    medusaOrderId = query.medusa_order_id || "";

    // Fallback: lấy từ global map
    if (!medusaOrderId && appTransId) {
      const zalopayMap = (global as any).__zalopayOrders as Map<string, any> | undefined;
      medusaOrderId = zalopayMap?.get(appTransId)?.medusaOrderId || "";
    }

    // ZaloPay: status=1 là thành công
    const isSuccess = statusCode === "1";

    if (isSuccess) {
      console.log(`[ZaloPay Callback GET] ✅ Payment success: appTransId=${appTransId}, orderId=${medusaOrderId}`);
      if (medusaOrderId) {
        await markOrderPaid(req, medusaOrderId, parseInt(amount) || 0, appTransId);
      }

      // Gắn medusa_order_id vào redirect URL để FE có thể hiển thị và cập nhật localStorage
      const redirectParams = new URLSearchParams({
        ...query,
        ...(medusaOrderId ? { medusa_order_id: medusaOrderId } : {}),
      }).toString();
      return res.redirect(302, `${FRONTEND_URL}/checkout/zalopay_return?${redirectParams}`);
    } else {
      console.log(`[ZaloPay Callback GET] ❌ Payment failed: status=${statusCode}, appTransId=${appTransId}`);
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
 * Cập nhật Medusa order thành paid:
 * - Insert payment_session, payment, order_transaction (giống VNPay callback)
 * - Update payment_collection.status = 'completed'
 * - Update order metadata.payment_status = 'paid'
 */
async function markOrderPaid(req: MedusaRequest, orderId: string, amount: number, appTransId: string) {
  try {
    const db = (req.scope as any).resolve("__pg_connection__");

    // Kiểm tra đã paid chưa (idempotent)
    const checkRes = await db.raw(
      `SELECT metadata FROM "order" WHERE id = ? LIMIT 1`,
      [orderId]
    );
    if (!checkRes.rows.length) {
      console.warn(`[ZaloPay markOrderPaid] Order not found in DB: ${orderId}`);
      return;
    }
    if (checkRes.rows[0]?.metadata?.payment_status === "paid") {
      console.log(`[ZaloPay markOrderPaid] Already paid, skip: ${orderId}`);
      return;
    }

    // 1. Lấy payment_collection của order
    const paycolRes = await db.raw(
      `SELECT pc.id, pc.amount, pc.status
       FROM payment_collection pc
       JOIN order_payment_collection opc ON pc.id = opc.payment_collection_id
       WHERE opc.order_id = ?
       LIMIT 1`,
      [orderId]
    );

    if (!paycolRes.rows.length) {
      console.warn(`[ZaloPay markOrderPaid] No payment_collection for order: ${orderId}`);
      // Cập nhật metadata tối thiểu vẫn cần thiết
      const curMeta = checkRes.rows[0]?.metadata || {};
      await db.raw(
        `UPDATE "order" SET metadata = ?, updated_at = NOW() WHERE id = ?`,
        [JSON.stringify({ ...curMeta, payment_status: "paid", payment_method: "zalopay" }), orderId]
      );
      return;
    }

    const paycol = paycolRes.rows[0];
    const payAmount = paycol.amount || amount;
    const rawAmountStr = JSON.stringify({ value: payAmount.toString(), precision: 20 });

    // 2. Insert payment_session + payment + order_transaction nếu chưa có
    const existingPayRes = await db.raw(
      `SELECT id FROM payment WHERE payment_collection_id = ? LIMIT 1`,
      [paycol.id]
    );

    if (existingPayRes.rows.length === 0) {
      const generateId = (prefix: string) => {
        const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let r = "";
        for (let i = 0; i < 18; i++) r += chars[Math.floor(Math.random() * chars.length)];
        return `${prefix}_01${r}`;
      };

      const paySessionId = generateId("payses");
      const paymentId   = generateId("pay");
      const trxId       = generateId("ordtrx");

      await db.raw(
        `INSERT INTO payment_session (
           id, currency_code, amount, raw_amount, provider_id,
           data, context, status, authorized_at, payment_collection_id, metadata, created_at, updated_at
         ) VALUES (?, 'vnd', ?, ?, 'zalopay', '{}', '{}', 'authorized', NOW(), ?, '{}', NOW(), NOW())`,
        [paySessionId, payAmount, rawAmountStr, paycol.id]
      );

      await db.raw(
        `INSERT INTO payment (
           id, amount, raw_amount, currency_code, provider_id,
           created_at, updated_at, captured_at, payment_collection_id, payment_session_id, data, metadata
         ) VALUES (?, ?, ?, 'vnd', 'zalopay', NOW(), NOW(), NOW(), ?, ?, '{}', '{}')`,
        [paymentId, payAmount, rawAmountStr, paycol.id, paySessionId]
      );

      await db.raw(
        `INSERT INTO order_transaction (
           id, order_id, version, amount, raw_amount, currency_code,
           reference, reference_id, created_at, updated_at
         ) VALUES (?, ?, 1, ?, ?, 'vnd', 'capture', ?, NOW(), NOW())`,
        [trxId, orderId, payAmount, rawAmountStr, paymentId]
      );

      // Cập nhật order_summary totals
      const summaryRes = await db.raw(
        `SELECT id, totals FROM order_summary WHERE order_id = ?`,
        [orderId]
      );
      if (summaryRes.rows.length > 0) {
        const summary = summaryRes.rows[0];
        const newTotals = {
          ...summary.totals,
          paid_total: Number(payAmount),
          raw_paid_total: { value: payAmount.toString(), precision: 20 },
          transaction_total: Number(payAmount),
          raw_transaction_total: { value: payAmount.toString(), precision: 20 },
          pending_difference: 0,
          raw_pending_difference: { value: "0", precision: 20 },
        };
        await db.raw(
          `UPDATE order_summary SET totals = ?, updated_at = NOW() WHERE id = ?`,
          [JSON.stringify(newTotals), summary.id]
        );
      }
      console.log(`[ZaloPay markOrderPaid] Payment records inserted for order: ${orderId}`);
    }

    // 3. Update payment_collection.status = completed
    await db.raw(
      `UPDATE payment_collection
       SET status = 'completed',
           captured_amount = ?,
           raw_captured_amount = ?,
           authorized_amount = ?,
           raw_authorized_amount = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [payAmount, rawAmountStr, payAmount, rawAmountStr, paycol.id]
    );

    // 4. Update order metadata: payment_status = 'paid'
    const currentMeta = checkRes.rows[0]?.metadata || {};
    await db.raw(
      `UPDATE "order" SET metadata = ?, updated_at = NOW() WHERE id = ?`,
      [JSON.stringify({ ...currentMeta, payment_status: "paid", payment_method: "zalopay", zalopay_trans_id: appTransId }), orderId]
    );

    console.log(`[ZaloPay markOrderPaid] ✅ Order ${orderId} marked as PAID. app_trans_id: ${appTransId}`);

    // 5. Emit event
    try {
      const eventBus = req.scope.resolve(Modules.EVENT_BUS);
      await eventBus.emit({
        name: "order.placed",
        data: { id: orderId, payment_status: "paid", method: "zalopay" },
      });
    } catch (eventErr: any) {
      console.warn("[ZaloPay markOrderPaid] Event emit skipped:", eventErr.message);
    }
  } catch (err: any) {
    console.error("[ZaloPay markOrderPaid] Error:", err.message);
  }
}

export const GET  = handleCallback;
export const POST = handleCallback;
