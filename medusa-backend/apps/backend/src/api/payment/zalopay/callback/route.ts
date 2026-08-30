import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

export const AUTHENTICATE = false;

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const query = req.query as Record<string, string>;
    console.log("[ZaloPay Callback] Received query params:", query);

    const FRONTEND_URL = process.env.STORE_FRONTEND_URL || "http://localhost:5173";

    const appTransId = query.apptransid || query.app_trans_id || query.vnp_TxnRef || "";
    const status = query.status;
    const amount = query.amount || "0";
    const checksum = query.checksum || "";

    // In ZaloPay return/callback, status 1 means success
    const isSuccess = status === "1" || status === "00" || status === "success" || !status;

    if (isSuccess && appTransId) {
      console.log(`[ZaloPay Callback] ✅ Payment SUCCESS for order: ${appTransId}`);

      try {
        const db = (req.scope as any).resolve("__pg_connection__");
        await db.raw(
          `UPDATE sprylo_order
             SET payment_status = 'paid',
                 vnpay_transaction_no = ?,
                 updated_at = NOW()
           WHERE id = ? OR vnpay_txn_ref = ?`,
          [checksum || appTransId, appTransId, appTransId]
        );
        console.log(`[ZaloPay Callback] DB updated payment_status=paid for order ${appTransId}`);
      } catch (dbErr: any) {
        console.warn("[ZaloPay Callback] DB update skipped:", dbErr.message);
      }

      // ─── INSERT INTO MEDUSA DB ───────────────────────────
      const orderId = appTransId;
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
              payment_method: 'zalopay',
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
                console.log(`[ZaloPay Callback] Marked Medusa order ${medusaOrderId} as Paid!`);
              }
            } catch (updateErr: any) {
              console.warn(`[ZaloPay Callback] Could not mark order as paid:`, updateErr.message);
            }

            console.log(`[ZaloPay Callback] Successfully created Medusa order for ${orderId}`);
            pendingData.medusa_created = true; // prevent duplicate creation

            try {
              const eventBus = req.scope.resolve(Modules.EVENT_BUS);
              await eventBus.emit({
                name: "order.placed",
                data: { id: medusaOrderId, payment_status: "paid", method: "zalopay" },
              });
            } catch (eventErr: any) {
              console.warn("[ZaloPay Callback] Event emit skipped:", eventErr.message);
            }
          }
        } catch (err) {
          console.error(`[ZaloPay Callback] Failed to create Medusa order for ${orderId}:`, err);
        }
      }

      const params = new URLSearchParams(query).toString();
      return res.redirect(302, `${FRONTEND_URL}/checkout/zalopay_return?${params}`);
    } else {
      console.log(`[ZaloPay Callback] ❌ Payment FAILED for order: ${appTransId}`);
      const params = new URLSearchParams(query).toString();
      return res.redirect(302, `${FRONTEND_URL}/checkout/zalopay_return?${params}`);
    }
  } catch (error) {
    console.error("[ZaloPay Callback] Error:", error);
    const FRONTEND_URL = process.env.STORE_FRONTEND_URL || "http://localhost:5173";
    return res.redirect(302, `${FRONTEND_URL}/checkout`);
  }
}

export const POST = GET;
