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
        // Check if there is already a payment for this payment collection to prevent duplicates
        const existingPaymentRes = await db.raw(`
          SELECT id FROM payment WHERE payment_collection_id = ? LIMIT 1
        `, [paycol.id])

        if (existingPaymentRes.rows.length === 0) {
          const generateMedusaId = (prefix: string) => {
            const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            let result = ""
            for (let i = 0; i < 18; i++) {
              result += chars.charAt(Math.floor(Math.random() * chars.length))
            }
            return `${prefix}_01${result}`
          }

          const paymentSessionId = generateMedusaId('payses')
          const paymentId = generateMedusaId('pay')
          const trxId = generateMedusaId('ordtrx')
          const rawAmountStr = JSON.stringify({ value: paycol.amount.toString(), precision: 20 })

          // 1. Insert into payment_session
          await db.raw(`
            INSERT INTO payment_session (
              id, currency_code, amount, raw_amount, provider_id, 
              data, context, status, authorized_at, payment_collection_id, metadata, created_at, updated_at
            ) VALUES (?, 'vnd', ?, ?, 'vnpay', '{}', '{}', 'authorized', NOW(), ?, '{}', NOW(), NOW())
          `, [paymentSessionId, paycol.amount, rawAmountStr, paycol.id])

          // 2. Insert into payment
          await db.raw(`
            INSERT INTO payment (
              id, amount, raw_amount, currency_code, provider_id, 
              created_at, updated_at, captured_at, payment_collection_id, payment_session_id, data, metadata
            ) VALUES (?, ?, ?, 'vnd', 'vnpay', NOW(), NOW(), NOW(), ?, ?, '{}', '{}')
          `, [paymentId, paycol.amount, rawAmountStr, paycol.id, paymentSessionId])

          // 3. Insert into order_transaction
          await db.raw(`
            INSERT INTO order_transaction (
              id, order_id, version, amount, raw_amount, currency_code, 
              reference, reference_id, created_at, updated_at
            ) VALUES (?, ?, 1, ?, ?, 'vnd', 'capture', ?, NOW(), NOW())
          `, [trxId, vnp_TxnRef, paycol.amount, rawAmountStr, paymentId])

          // 4. Update order_summary totals
          const summaryRes = await db.raw(`
            SELECT id, totals FROM order_summary WHERE order_id = ?
          `, [vnp_TxnRef])
          
          if (summaryRes.rows.length > 0) {
            const summary = summaryRes.rows[0]
            const newTotals = {
              ...summary.totals,
              paid_total: Number(paycol.amount),
              raw_paid_total: { value: paycol.amount.toString(), precision: 20 },
              transaction_total: Number(paycol.amount),
              raw_transaction_total: { value: paycol.amount.toString(), precision: 20 },
              pending_difference: 0,
              raw_pending_difference: { value: '0', precision: 20 }
            }

            await db.raw(`
              UPDATE order_summary 
              SET totals = ?, updated_at = NOW() 
              WHERE id = ?
            `, [JSON.stringify(newTotals), summary.id])
          }
        }

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
