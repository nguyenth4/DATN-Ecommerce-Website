import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

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
        console.warn("[VNPay Callback] DB update skipped:", dbErr.message);
      }

      // Chuyển hướng về frontend với tất cả params của VNPay để frontend hiển thị kết quả
      const params = new URLSearchParams(query).toString();
      return res.redirect(302, `${FRONTEND_URL}/checkout/vnpay_return?${params}`);
    } else {
      console.log(
        `[VNPay Callback] ❌ Payment FAILED/CANCELED for order: ${orderId}, code: ${responseCode}`
      );

      const params = new URLSearchParams(query).toString();
      return res.redirect(302, `${FRONTEND_URL}/checkout/vnpay_return?${params}`);
    }
  } catch (error) {
    console.error("[VNPay Callback] Error:", error);
    const FRONTEND_URL = process.env.STORE_FRONTEND_URL || "http://localhost:5174";
    return res.redirect(302, `${FRONTEND_URL}/checkout`);
  }
}
