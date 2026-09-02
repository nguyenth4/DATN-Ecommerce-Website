import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

// VNPay IPN/Return callback handler
// VNPay sẽ redirect người dùng về URL này sau khi thanh toán
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const query = req.query as Record<string, string>;
    console.log("[VNPay Callback] Received query params:", query);

    const FRONTEND_URL = process.env.STORE_FRONTEND_URL || "http://localhost:5174";

    const orderId = query.vnp_TxnRef;
    const responseCode = query.vnp_ResponseCode;
    const transactionNo = query.vnp_TransactionNo || "";
    const bankCode = query.vnp_BankCode || "";
    const amount = query.vnp_Amount || "0";

    if (responseCode === "00" && orderId) {
      console.log(
        `[VNPay Callback] ✅ Payment SUCCESS for order: ${orderId}`,
        { transactionNo, bankCode, amount }
      );

      // Cập nhật payment_status trong bảng sprylo_order (nếu tồn tại)
      try {
        const db = (req.scope as any).resolve("__pg_connection__");
        await db.raw(
          `UPDATE sprylo_order
             SET payment_status = 'paid',
                 vnpay_transaction_no = ?,
                 updated_at = NOW()
           WHERE id = ? OR vnpay_txn_ref = ?`,
          [transactionNo, orderId, orderId]
        );
        console.log(`[VNPay Callback] DB updated payment_status=paid for order ${orderId}`);
      } catch (dbErr: any) {
        // Bảng chưa có hoặc order_id không tồn tại — không crash, chỉ log
        // Bảng chưa có hoặc order_id không tồn tại — không crash, chỉ log
        console.warn("[VNPay Callback] DB update skipped:", dbErr.message);
      }

      // ─── INSERT INTO MEDUSA DB ───────────────────────────
      const pendingData = (global as any).__pendingOrders?.get(orderId);
      if (pendingData && !pendingData.medusa_created) {
        try {
          const orderService = req.scope.resolve(Modules.ORDER);
          const createdOrders = await orderService.createOrders([{
            currency_code: "VND",
            email: pendingData.customer?.email || "guest@example.com",
            customer_id: pendingData.customer_id || undefined,
            metadata: { 
              external_id: orderId,
              payment_method: 'vnpay',
              shipping_method: pendingData.shippingMethod,
              customer_name: pendingData.customer?.fullName,
              customer_phone: pendingData.customer?.phoneNumber
            },
            items: (pendingData.items || []).map((i: any) => ({
              title: i.name || "Unknown item",
              unit_price: i.price || 0,
              quantity: i.qty || 1,
              variant_title: i.variant || "",
              thumbnail: i.img || "",
              variant_id: i.id || "",
            })),
          }]);
          
          if (createdOrders && createdOrders.length > 0) {
            const medusaOrderId = createdOrders[0].id;
            try {
              const { createOrderPaymentCollectionWorkflow, markPaymentCollectionAsPaid } = require("@medusajs/core-flows");
              
              const { result: paymentCollections } = await createOrderPaymentCollectionWorkflow(req.scope).run({
                input: {
                  order_id: medusaOrderId,
                  amount: pendingData.totalAmount || parseInt(amount) || 0,
                }
              });
              
              if (paymentCollections && paymentCollections.length > 0) {
                await markPaymentCollectionAsPaid(req.scope).run({
                  input: {
                    order_id: medusaOrderId,
                    payment_collection_id: paymentCollections[0].id,
                  }
                });
                console.log(`[VNPay Callback] Marked Medusa order ${medusaOrderId} as Paid!`);
              }
            } catch (updateErr: any) {
              console.warn(`[VNPay Callback] Could not mark order as paid:`, updateErr.message);
            }

            // Force update the order status via raw query just in case workflow fails
            try {
              const db = req.scope.resolve("__pg_connection__");
              // Removed forced status=completed update
              const pcRes = await db.raw(`SELECT payment_collection_id FROM order_payment_collection WHERE order_id = ?`, [medusaOrderId]);
              if (pcRes.rows.length > 0) {
                const pcId = pcRes.rows[0].payment_collection_id;
                await db.raw(`UPDATE payment_collection SET status = 'authorized', captured_amount = amount, raw_captured_amount = raw_amount WHERE id = ?`, [pcId]);
                await db.raw(`UPDATE payment SET captured_at = NOW() WHERE payment_collection_id = ?`, [pcId]);
              }
              console.log(`[VNPay Callback] Forced update payment_collection to 'authorized' for VNPay order ${medusaOrderId}`);
            } catch (e: any) {
              console.warn(`[VNPay Callback] Failed to force update payment_status:`, e.message);
            }

            console.log(`[VNPay Callback] Successfully created Medusa order for ${orderId}`);
            pendingData.medusa_created = true; // prevent duplicate creation

            const eventBus = req.scope.resolve(Modules.EVENT_BUS);
            await eventBus.emit({
              name: "order.placed",
              data: { id: medusaOrderId, payment_status: "paid", method: "vnpay" },
            });
          }
        } catch (err) {
          console.error(`[VNPay Callback] Failed to create Medusa order for ${orderId}:`, err);
        }
      }

      // Chuyển hướng về frontend với tất cả params của VNPay để frontend hiển thị kết quả
      const params = new URLSearchParams(query).toString();
      return res.redirect(302, `${FRONTEND_URL}/checkout/vnpay_return?${params}`);
    } else {
      console.log(
        `[VNPay Callback] ❌ Payment FAILED/CANCELED for order: ${orderId}, code: ${responseCode}`
      );

      // Restore inventory
      const pendingData = (global as any).__pendingOrders?.get(orderId);
      if (pendingData && !pendingData.restored) {
        try {
          const productModuleService = req.scope.resolve(Modules.PRODUCT);
          for (const item of pendingData.items || []) {
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
          pendingData.restored = true;
          console.log(`[VNPay Callback] Restored inventory for failed/canceled order ${orderId}`);
          
          const db = (req.scope as any).resolve("__pg_connection__");
          await db.raw(
            `UPDATE sprylo_order
               SET payment_status = 'failed',
                   updated_at = NOW()
             WHERE id = ? OR vnpay_txn_ref = ?`,
            [orderId, orderId]
          );
        } catch (err) {
          console.error(`[VNPay Callback] Failed to restore inventory/update DB for ${orderId}:`, err);
        }
      }

      const params = new URLSearchParams(query).toString();
      return res.redirect(302, `${FRONTEND_URL}/checkout/vnpay_return?${params}`);
    }
  } catch (error) {
    console.error("[VNPay Callback] Error:", error);
    const FRONTEND_URL = process.env.STORE_FRONTEND_URL || "http://localhost:5174";
    return res.redirect(302, `${FRONTEND_URL}/checkout`);
  }
}
