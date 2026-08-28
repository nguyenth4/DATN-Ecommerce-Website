import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const paymentModuleService = req.scope.resolve(Modules.PAYMENT)
  
  const query = req.query || {}

  try {
    const { VNPay, verifyIpnCall } = require('vnpay')
    const vnpayHost = process.env.VNPAY_HOST || 'https://sandbox.vnpayment.vn'
    const tmnCode = process.env.VNPAY_TMN_CODE || 'VNPAY_TMN_CODE_PLACEHOLDER'
    const secureSecret = process.env.VNPAY_SECURE_SECRET || 'VNPAY_SECURE_SECRET_PLACEHOLDER'

    const vnpay = new VNPay({
      vnpayHost,
      tmnCode,
      secureSecret,
      testMode: true
    })

    const verify = vnpay.verifyIpnCall(query as any)
    const vnp_TxnRef = (query as any).vnp_TxnRef

    if (verify.isSuccess) {
      // Find the payment collection associated with the order ID in vnp_TxnRef
      // and update its status to 'completed' or 'captured'
      const db = req.scope.resolve("__pg_connection__")
      
      const orderRes = await db.raw(`
        SELECT p.id, p.amount FROM payment_collection p
        JOIN order_payment_collection op ON p.id = op.payment_collection_id
        WHERE op.order_id = ?
      `, [vnp_TxnRef])

      const paycol = orderRes.rows[0]
      if (paycol) {
        const rawAmountStr = JSON.stringify({ value: paycol.amount.toString(), precision: 20 })
        
        await db.raw(`
          UPDATE payment_collection 
          SET status = 'completed',
              captured_amount = ?,
              raw_captured_amount = ?,
              authorized_amount = ?,
              raw_authorized_amount = ?,
              updated_at = NOW()
          WHERE id = ?
        `, [paycol.amount, rawAmountStr, paycol.amount, rawAmountStr, paycol.id])

        console.log("VNPAY IPN Success & Updated for order:", vnp_TxnRef)
      }

      return res.status(200).json({ RspCode: "00", Message: "Confirm Success" })
    } else {
      console.log("VNPAY IPN Verification Failed for txn:", vnp_TxnRef, verify.message)
      // VNPAY expects { RspCode: "00", Message: "Confirm Success" } or specific error codes
      // In reality, if verify fails due to invalid signature, return 97.
      return res.status(200).json({ RspCode: "97", Message: "Invalid signature" })
    }
  } catch (error) {
    console.error("VNPAY IPN Error", error)
    return res.status(200).json({ RspCode: "99", Message: "Unknown error" })
  }
}

export const GET = POST
