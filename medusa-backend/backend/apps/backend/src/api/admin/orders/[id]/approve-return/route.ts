import sgMail from "@sendgrid/mail"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import WalletModuleService from "../../../../../modules/wallet/service"
import { WALLET_MODULE } from "../../../../../modules/wallet"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { id } = req.params
    const orderService = req.scope.resolve(Modules.ORDER)
    const order = await orderService.retrieveOrder(id)
    const metadata = (order.metadata || {}) as Record<string, any>

    if (!metadata.return_requested) {
      return res.status(400).json({ message: "Đơn hàng chưa có yêu cầu trả hàng cần duyệt." })
    }

    if (metadata.refund_id) {
      return res.status(400).json({ message: "Yêu cầu này đã được xử lý hoàn tiền." })
    }

    const refundAmount = Number(metadata.paid_total || order.total || 0)
    if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
      return res.status(400).json({ message: "Không xác định được số tiền cần hoàn." })
    }

    const refundMethod = metadata.refund_method === "wallet" || metadata.refund_info === "Ví điện tử Sprylo"
      ? "wallet"
      : "bank_transfer"
    const refundedAt = new Date().toISOString()
    const refundId = `${refundMethod}_refund_${Date.now()}`
    const refundStatus = refundMethod === "wallet" ? "completed" : "bank_transfer_pending"

    if (refundMethod === "wallet") {
      if (!order.customer_id) {
        return res.status(400).json({ message: "Không tìm thấy khách hàng để hoàn tiền vào ví Sprylo." })
      }

      const walletService: WalletModuleService = req.scope.resolve(WALLET_MODULE)
      await walletService.addBalance(
        order.customer_id,
        refundAmount,
        "refund",
        `Hoàn tiền đơn hàng #${order.display_id || order.id}`,
        order.id,
      )
    }

    await orderService.updateOrders(id, {
      metadata: {
        ...metadata,
        return_requested: false,
        return_approved_at: refundedAt,
        refund_id: refundId,
        refund_amount: refundAmount,
        refund_at: refundedAt,
        refund_method: refundMethod,
        refund_status: refundStatus,
        custom_status: "refunded",
      },
    })

    const recipient = order.email
    const sendgridApiKey = process.env.SENDGRID_API_KEY
    const from = process.env.SENDGRID_FROM_EMAIL
    const templateId = process.env.SENDGRID_RETURN_APPROVED_TEMPLATE_ID
    let emailSent = false

    if (recipient && sendgridApiKey && from && templateId) {
      try {
        sgMail.setApiKey(sendgridApiKey)
        await sgMail.send({
          to: recipient,
          from,
          templateId,
          dynamicTemplateData: {
            customer_name: metadata.customer_name || "Quý khách",
            order_display_id: order.display_id || order.id,
            refund_amount_formatted: `${refundAmount.toLocaleString("vi-VN")} đ`,
            refund_info: metadata.refund_info || "Chưa có thông tin tài khoản",
            return_reason: metadata.return_reason || "Không cung cấp",
            support_email: from,
            is_wallet: refundMethod === "wallet",
            is_bank_transfer: refundMethod === "bank_transfer",
          },
        })
        emailSent = true
      } catch (emailError) {
        console.error("[Approve Return] SendGrid notification failed:", emailError)
      }
    } else {
      console.warn("[Approve Return] SendGrid API key, sender email, or return-approved template ID is missing; notification email was skipped.")
    }

    return res.status(200).json({
      success: true,
      refundId,
      refundAmount,
      refundMethod,
      refundStatus,
      emailSent,
    })
  } catch (error: any) {
    console.error("[Approve Return API] Error:", error)
    return res.status(500).json({ message: error.message || "Không thể duyệt yêu cầu trả hàng." })
  }
}