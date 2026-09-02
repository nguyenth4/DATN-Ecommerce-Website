import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";

export const AUTHENTICATE = false;

// VNPay IPN/Return callback handler cho Topup
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const query = req.query as Record<string, string>;
    console.log("[VNPay Topup Callback] Received query params:", query);

    const FRONTEND_URL = process.env.STORE_FRONTEND_URL || "http://localhost:5174";

    const orderId = query.vnp_TxnRef || ""; // Format: topup-{customer_id}-{timestamp}
    const responseCode = query.vnp_ResponseCode;
    const transactionNo = query.vnp_TransactionNo || "";
    // VNPAY amount is x100
    const amountStr = query.vnp_Amount || "0";
    const amount = parseInt(amountStr) / 100;

    if (responseCode === "00" && orderId.startsWith("topup-")) {
      console.log(
        `[VNPay Topup Callback] ✅ Topup SUCCESS for order: ${orderId}`,
        { transactionNo, amount }
      );

      // Parse customerId from txnRef
      const parts = orderId.split('-');
      // format is topup-cus_12345-timestamp
      // so parts[0] = topup
      // parts.slice(1, -1).join('-') is customer_id
      const customerId = parts.slice(1, -1).join('-');

      if (!customerId) {
        console.error("[VNPay Topup Callback] Cannot parse customerId from txnRef:", orderId);
        return res.redirect(302, `${FRONTEND_URL}/account?tab=wallet&error=invalid_txn`);
      }

      const db = req.scope.resolve("__pg_connection__");

      // 1. Check if this transaction was already processed
      const existingTx = await db.raw(
        `SELECT id FROM wallet_transaction WHERE transaction_id = ? AND type = 'topup'`,
        [transactionNo]
      );

      if (existingTx.rows.length === 0) {
        // 2. Get wallet
        const walletRes = await db.raw(`SELECT id, balance FROM wallet WHERE customer_id = ?`, [customerId]);
        if (walletRes.rows.length > 0) {
          const wallet = walletRes.rows[0];

          // 3. Update wallet balance
          await db.raw(
            `UPDATE wallet SET balance = balance + ?, updated_at = NOW() WHERE id = ?`,
            [amount, wallet.id]
          );

          // 4. Insert wallet_transaction
          await db.raw(
            `INSERT INTO wallet_transaction (
              id, wallet_id, type, amount, status, description, transaction_id, created_at, updated_at
            ) VALUES (
              ?, ?, 'topup', ?, 'completed', ?, ?, NOW(), NOW()
            )`,
            [
              `wtx_${Date.now()}_${Math.floor(Math.random()*1000)}`,
              wallet.id,
              amount,
              `Nạp tiền qua VNPAY (MGD: ${transactionNo})`,
              transactionNo
            ]
          );
          console.log(`[VNPay Topup Callback] ✅ Successfully topped up ${amount} for customer ${customerId}`);
        } else {
          console.error(`[VNPay Topup Callback] Wallet not found for customer ${customerId}`);
        }
      } else {
        console.log(`[VNPay Topup Callback] Transaction ${transactionNo} already processed. Skipping.`);
      }

      return res.redirect(302, `${FRONTEND_URL}/account?tab=wallet`);
    } else {
      console.log(
        `[VNPay Topup Callback] ❌ Topup FAILED/CANCELED for order: ${orderId}, code: ${responseCode}`
      );
      return res.redirect(302, `${FRONTEND_URL}/account?tab=wallet&error=topup_failed`);
    }
  } catch (error) {
    console.error("[VNPay Topup Callback] Error:", error);
    const FRONTEND_URL = process.env.STORE_FRONTEND_URL || "http://localhost:5174";
    return res.redirect(302, `${FRONTEND_URL}/account?tab=wallet`);
  }
}
