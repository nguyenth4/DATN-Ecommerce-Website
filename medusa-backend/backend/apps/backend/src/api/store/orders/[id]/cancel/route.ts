import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { Resend } from "resend"
import WalletModuleService from "../../../../../modules/wallet/service"
import { WALLET_MODULE } from "../../../../../modules/wallet"

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const { id } = req.params
    const db = req.scope.resolve("__pg_connection__")

    // Fetch the order from the database
    const orderRes = await db.raw(`
      SELECT * FROM "order" WHERE id = ?
    `, [id])

    if (orderRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng."
      })
    }

    const order = orderRes.rows[0]

    if (order.status === 'canceled') {
      return res.status(400).json({
        success: false,
        message: "Đơn hàng đã được hủy trước đó."
      })
    }

    // Cancellation only allowed before "shipping" starts (pending/confirmed/preparing)
    const CANCELABLE_STATUSES = ["pending", "confirmed", "preparing"]
    const customStatus = (order.metadata || {}).custom_status
    if (customStatus && !CANCELABLE_STATUSES.includes(customStatus)) {
      return res.status(400).json({
        success: false,
        message: "Đơn hàng đang được vận chuyển hoặc đã hoàn tất, không thể hủy."
      })
    }

    // Update order status to canceled & save metadata (cancel reason, refund info, etc.)
    const { cancelReason, refundDestination, refundInfo } = (req.body || {}) as {
      cancelReason?: string
      refundDestination?: string
      refundInfo?: string
    }

    const metadata = order.metadata || {}
    const updatedMetadata = {
      ...metadata,
      custom_status: 'canceled',
      cancel_requested: true,
      cancel_reason: cancelReason || metadata.cancel_reason || "Khách hàng hủy đơn",
      refund_destination: refundDestination || metadata.refund_destination || "",
      refund_info: refundInfo || metadata.refund_info || "",
    }

    await db.raw(`
      UPDATE "order" 
      SET status = 'canceled', canceled_at = NOW(), metadata = ?, updated_at = NOW() 
      WHERE id = ?
    `, [JSON.stringify(updatedMetadata), id])

    // Calculate paidTotal accurately using multiple fallbacks
    let paidTotal = Number(metadata.paid_total || order.total || 0)
    if (!paidTotal || paidTotal <= 0) {
      try {
        const summaryRes = await db.raw(`SELECT totals FROM order_summary WHERE order_id = ?`, [id])
        if (summaryRes.rows.length > 0 && summaryRes.rows[0].totals) {
          const totals = typeof summaryRes.rows[0].totals === 'string'
            ? JSON.parse(summaryRes.rows[0].totals)
            : summaryRes.rows[0].totals
          paidTotal = Number(totals.paid_total || totals.current_order_total || totals.original_order_total || 0)
        }
      } catch (e) {}
    }
    if (!paidTotal || paidTotal <= 0) {
      try {
        const itemsRes = await db.raw(`SELECT unit_price, quantity FROM order_item WHERE order_id = ?`, [id])
        const itemsSum = itemsRes.rows.reduce((sum: number, r: any) => sum + (Number(r.unit_price || 0) * Number(r.quantity || 1)), 0)
        const shippingFee = Number(metadata.shipping_fee || 0)
        paidTotal = itemsSum + shippingFee
      } catch (e) {}
    }

    // Refund wallet balance if wallet was used OR if refundDestination is wallet
    const useWallet = metadata.use_wallet === 'true'
    const walletDeducted = Number(metadata.wallet_deducted || 0)

    let targetCustomerId = order.customer_id
    if (!targetCustomerId && order.email && db) {
      try {
        const custRes = await db.raw(`SELECT id FROM customer WHERE LOWER(email) = LOWER(?)`, [order.email])
        if (custRes.rows.length > 0) {
          targetCustomerId = custRes.rows[0].id
        }
      } catch (e) {
        console.error("Error finding customer by email during cancel:", e)
      }
    }

    const targetRefundDest = refundDestination || metadata.refund_destination || "wallet"

    if (targetCustomerId && db) {
      // Always execute direct SQL update on wallet and wallet_transaction
      const addWalletAmount = async (amount: number, desc: string) => {
        try {
          const walletRes = await db.raw(`SELECT id, balance FROM wallet WHERE customer_id = ?`, [targetCustomerId])
          let walletId = ""
          if (walletRes.rows.length > 0) {
            walletId = walletRes.rows[0].id
            const currentBal = Number(walletRes.rows[0].balance || 0)
            await db.raw(`UPDATE wallet SET balance = ?, updated_at = NOW() WHERE id = ?`, [currentBal + amount, walletId])
          } else {
            walletId = `wallet_${Date.now()}_${Math.floor(Math.random() * 1000)}`
            await db.raw(`INSERT INTO wallet (id, customer_id, balance, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())`, [walletId, targetCustomerId, amount])
          }
          const txId = `wtx_${Date.now()}_${Math.floor(Math.random() * 1000)}`
          await db.raw(`INSERT INTO wallet_transaction (id, wallet_id, amount, raw_amount, type, description, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())`, [
            txId, walletId, amount, amount.toString(), "refund", desc
          ])
        } catch (e) {
          console.error("Direct wallet SQL error:", e)
        }
      }

      // Case 1: Refund partially/fully deducted wallet portion if order used wallet
      if (useWallet && walletDeducted > 0) {
        await addWalletAmount(walletDeducted, `Hoàn tiền ví từ đơn hàng #${order.display_id || order.id}`)
      }

      // Case 2: If customer requested refund to wallet (or default wallet for paid online order)
      if ((targetRefundDest === 'wallet' || targetRefundDest !== 'bank_transfer') && paidTotal > 0) {
        await addWalletAmount(paidTotal, `Hoàn tiền hủy đơn hàng #${order.display_id || order.id} về Ví Sprylo`)
        updatedMetadata.refund_status = "completed"
        updatedMetadata.refund_id = `wallet_refund_${Date.now()}`
        updatedMetadata.custom_status = "refunded"
        await db.raw(`UPDATE "order" SET metadata = ? WHERE id = ?`, [JSON.stringify(updatedMetadata), id])

        // Send Email notification
        const recipient = order.email
        if (recipient) {
          const displayId = order.display_id || order.id
          const refundAmountFormatted = `${paidTotal.toLocaleString("vi-VN")} ₫`
          const resendApiKey = process.env.RESEND_API_KEY
          if (resendApiKey) {
            try {
              const resend = new Resend(resendApiKey)
              const fromEmail = process.env.RESEND_FROM_EMAIL || "Sprylo <onboarding@resend.dev>"
              await resend.emails.send({
                from: fromEmail,
                to: recipient,
                subject: `[Sprylo] Thông báo hoàn tiền hủy đơn hàng #${displayId}`,
                html: `
                  <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <h2 style="color: #7c3aed; margin-top: 0;">💰 Hoàn tiền hủy đơn thành công - Sprylo</h2>
                    <p>Xin chào <strong>${order.shipping_address?.first_name || "Quý khách"}</strong>,</p>
                    <p>Đơn hàng <strong>#${displayId}</strong> của bạn đã được hủy thành công và số tiền thanh toán đã được hoàn vào ví.</p>
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
                      <p style="margin: 5px 0;"><strong>Mã đơn hàng:</strong> #${displayId}</p>
                      <p style="margin: 5px 0;"><strong>Số tiền hoàn:</strong> <span style="color: #059669; font-size: 1.2rem; font-weight: bold;">${refundAmountFormatted}</span></p>
                      <p style="margin: 5px 0;"><strong>Phương thức nhận:</strong> 💰 Ví điện tử Sprylo</p>
                      <p style="margin: 5px 0;"><strong>Thời gian:</strong> ${new Date().toLocaleString("vi-VN")}</p>
                    </div>
                    <p>Số tiền đã được cộng trực tiếp vào <strong>Ví Sprylo</strong> của bạn. Vui lòng kiểm tra mục Ví điện tử trên website.</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <p style="font-size: 0.85rem; color: #6b7280;">Cảm ơn bạn đã đồng hành cùng Sprylo!</p>
                  </div>
                `
              })
              console.log(`[Cancel Order] Refund email sent successfully to ${recipient}`)
            } catch (emailErr) {
              console.error("[Cancel Order] Email notification failed:", emailErr)
            }
          }
        }
      }
    }

    return res.json({
      success: true,
      message: "Hủy đơn hàng thành công và đã hoàn tiền vào ví (nếu có)."
    })
  } catch (error: any) {
    console.error("[Cancel Order API Error]:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "Đã xảy ra lỗi trong quá trình hủy đơn hàng."
    })
  }
}
