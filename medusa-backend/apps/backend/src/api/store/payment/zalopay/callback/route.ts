import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

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

      try {
        const eventBus = req.scope.resolve(Modules.EVENT_BUS);
        await eventBus.emit({
          name: "order.placed",
          data: { id: appTransId, payment_status: "paid", method: "zalopay" },
        });
      } catch (eventErr: any) {
        console.warn("[ZaloPay Callback] Event emit skipped:", eventErr.message);
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
