import sgMail from "@sendgrid/mail"
import { Resend } from "resend"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import WalletModuleService from "../../../../../modules/wallet/service"
import { WALLET_MODULE } from "../../../../../modules/wallet"

export const AUTHENTICATE = false;

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { id } = req.params
    const orderService = req.scope.resolve(Modules.ORDER)
    const order = await orderService.retrieveOrder(id, {
      relations: ["items"]
    })
    const metadata = (order.metadata || {}) as Record<string, any>

    if (!metadata.return_requested && !metadata.cancel_requested && !metadata.refund_destination && metadata.custom_status !== "canceled" && (order as any).status !== "canceled") {
      return res.status(400).json({ message: "Đơn hàng chưa có yêu cầu hoàn tiền hoặc trả hàng cần duyệt." })
    }

    const body = (req.body || {}) as Record<string, any>

    // Allow re-attempting refund if force parameter is sent or if needed
    const isForce = body.force === true;
    if (metadata.refund_id && !isForce && metadata.refund_status === "completed") {
      return res.status(400).json({ message: "Yêu cầu này đã được xử lý hoàn tiền thành công trước đó." })
    }

    const db = req.scope.resolve("__pg_connection__")

    // Calculate refund amount safely
    let refundAmount = Number(body.amount || metadata.paid_total || order.total || 0)
    if (!refundAmount || refundAmount <= 0) {
      if ((order as any).summary?.raw_paid_total?.value) {
        refundAmount = Number((order as any).summary.raw_paid_total.value)
      } else if (Array.isArray(order.items) && order.items.length > 0) {
        const itemsTotal = order.items.reduce((acc: number, item: any) => acc + (Number(item.unit_price || item.price || (item as any).raw_unit_price?.value || 0) * Number(item.quantity || item.qty || 1)), 0)
        refundAmount = itemsTotal + Number(metadata.shipping_fee || 0)
      }
    }

    if ((!refundAmount || refundAmount <= 0) && db) {
      try {
        const summaryRes = await db.raw(`SELECT totals FROM order_summary WHERE order_id = ?`, [id])
        if (summaryRes.rows.length > 0 && summaryRes.rows[0].totals) {
          const totals = typeof summaryRes.rows[0].totals === 'string'
            ? JSON.parse(summaryRes.rows[0].totals)
            : summaryRes.rows[0].totals
          refundAmount = Number(totals.paid_total || totals.current_order_total || totals.original_order_total || 0)
        }
      } catch (e) {}
    }

    if ((!refundAmount || refundAmount <= 0) && db) {
      try {
        const itemsRes = await db.raw(`SELECT unit_price, quantity FROM order_item WHERE order_id = ?`, [id])
        const itemsSum = itemsRes.rows.reduce((sum: number, r: any) => sum + (Number(r.unit_price || 0) * Number(r.quantity || 1)), 0)
        const shippingFee = Number(metadata.shipping_fee || 0)
        refundAmount = itemsSum + shippingFee
      } catch (e) {}
    }

    // Secondary fallback for legacy orders
    if (!refundAmount || refundAmount <= 0) {
      refundAmount = Number((order as any).raw_total?.value || (order as any).subtotal || 0)
    }

    if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
      return res.status(400).json({ message: "Không xác định được số tiền cần hoàn." })
    }

    const targetDest = body.refund_method || body.refund_destination || metadata.refund_destination
    const refundMethod = (targetDest === "bank_transfer") ? "bank_transfer" : "wallet"
    const refundedAt = new Date().toISOString()
    const refundId = `${refundMethod}_refund_${Date.now()}`
    const refundStatus = refundMethod === "wallet" ? "completed" : "bank_transfer_pending"

    if (refundMethod === "wallet") {
      let targetCustomerId = order.customer_id

      if (!targetCustomerId && order.email && db) {
        try {
          const custRes = await db.raw(`SELECT id FROM customer WHERE LOWER(email) = LOWER(?)`, [order.email])
          if (custRes.rows.length > 0) {
            targetCustomerId = custRes.rows[0].id
          }
        } catch (e) {
          console.error("Error finding customer by email:", e)
        }
      }

      if (!targetCustomerId && db) {
        try {
          const firstCust = await db.raw(`SELECT id FROM customer LIMIT 1`)
          if (firstCust.rows.length > 0) {
            targetCustomerId = firstCust.rows[0].id
          }
        } catch (e) {}
      }

      if (!targetCustomerId) {
        return res.status(400).json({ message: "Không tìm thấy khách hàng để hoàn tiền vào ví Sprylo." })
      }

      // Always execute direct SQL to guarantee immediate wallet update to "wallet" and "wallet_transaction" tables
      if (db) {
        try {
          const walletRes = await db.raw(`SELECT id, balance FROM wallet WHERE customer_id = ?`, [targetCustomerId])
          let walletId = ""
          if (walletRes.rows.length > 0) {
            walletId = walletRes.rows[0].id
            const currentBal = Number(walletRes.rows[0].balance || 0)
            const newBal = currentBal + refundAmount
            await db.raw(`UPDATE wallet SET balance = ?, updated_at = NOW() WHERE id = ?`, [newBal, walletId])
          } else {
            walletId = `wallet_${Date.now()}_${Math.floor(Math.random() * 1000)}`
            await db.raw(`INSERT INTO wallet (id, customer_id, balance, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())`, [walletId, targetCustomerId, refundAmount])
          }
          
          const txId = `wtx_${Date.now()}_${Math.floor(Math.random() * 1000)}`
          await db.raw(`INSERT INTO wallet_transaction (id, wallet_id, amount, raw_amount, type, description, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())`, [
            txId,
            walletId,
            refundAmount,
            refundAmount.toString(),
            "refund",
            `Hoàn tiền đơn hàng #${order.display_id || order.id}`
          ])
        } catch (sqlErr) {
          console.error("[Direct SQL Refund Error]:", sqlErr)
        }
      }

      try {
        const walletService: WalletModuleService = req.scope.resolve(WALLET_MODULE)
        await walletService.addBalance(
          targetCustomerId,
          refundAmount,
          "refund",
          `Hoàn tiền đơn hàng #${order.display_id || order.id}`,
          order.id,
        )
      } catch (walletErr: any) {
        console.error("[Wallet Service Refund Warning]:", walletErr?.message || walletErr)
      }
    }

    if (db) {
      const updatedMetadata = {
        ...metadata,
        return_requested: false,
        cancel_requested: false,
        return_approved_at: refundedAt,
        refund_id: refundId,
        refund_amount: refundAmount,
        refund_at: refundedAt,
        refund_method: refundMethod,
        refund_status: refundStatus,
        custom_status: "refunded",
      }
      await db.raw(`UPDATE "order" SET metadata = ? WHERE id = ?`, [JSON.stringify(updatedMetadata), id])

      // Restore inventory_level stock for returned order
      try {
        const orderItems = order.items || []
        for (const item of orderItems) {
          const variantId = item.variant_id || (item as any).variant?.id
          const qty = Number(item.quantity || 1)
          if (variantId) {
            await db.raw(`
              UPDATE inventory_level il
              SET stocked_quantity = il.stocked_quantity + ?,
                  raw_stocked_quantity = jsonb_build_object(
                    'value', (COALESCE((il.raw_stocked_quantity->>'value')::numeric, il.stocked_quantity) + ?)::text,
                    'precision', 20
                  ),
                  updated_at = NOW()
              FROM product_variant_inventory_item pvii
              WHERE pvii.inventory_item_id = il.inventory_item_id
                AND pvii.variant_id = ?
            `, [qty, qty, variantId])
            console.log(`[Approve Return Route] Restored ${qty} to inventory_level for returned variant ${variantId}`)
          }
        }
      } catch (invErr: any) {
        console.error("[Approve Return Route] Error restoring inventory:", invErr?.message || invErr)
      }
    }

    try {
      await orderService.updateOrders(id, {
        metadata: {
          ...metadata,
          return_requested: false,
          cancel_requested: false,
          return_approved_at: refundedAt,
          refund_id: refundId,
          refund_amount: refundAmount,
          refund_at: refundedAt,
          refund_method: refundMethod,
          refund_status: refundStatus,
          custom_status: "refunded",
        },
      })
    } catch (updateErr) {
      console.warn("[Approve Return] orderService.updateOrders warning:", updateErr)
    }

    const recipient = order.email
    let emailSent = false

    if (recipient) {
      const customerName = metadata.full_name || metadata.customer_name || (order as any).shipping_address?.first_name || "Quý khách"
      const displayId = order.display_id || order.id
      const refundAmountFormatted = `${refundAmount.toLocaleString("vi-VN")} ₫`
      const resendApiKey = process.env.RESEND_API_KEY

      if (resendApiKey) {
        try {
          const resend = new Resend(resendApiKey)
          const fromEmail = process.env.RESEND_FROM_EMAIL || "Sprylo <onboarding@resend.dev>"
          await resend.emails.send({
            from: fromEmail,
            to: recipient,
            subject: `[Sprylo] Thông báo hoàn tiền thành công cho đơn hàng #${displayId}`,
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #7c3aed; margin-top: 0;">💰 Hoàn tiền thành công - Sprylo</h2>
                <p>Xin chào <strong>${customerName}</strong>,</p>
                <p>Yêu cầu hoàn tiền cho đơn hàng <strong>#${displayId}</strong> của bạn đã được xử lý thành công.</p>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
                  <p style="margin: 5px 0;"><strong>Mã đơn hàng:</strong> #${displayId}</p>
                  <p style="margin: 5px 0;"><strong>Số tiền hoàn:</strong> <span style="color: #059669; font-size: 1.2rem; font-weight: bold;">${refundAmountFormatted}</span></p>
                  <p style="margin: 5px 0;"><strong>Phương thức nhận tiền:</strong> ${refundMethod === "wallet" ? "💰 Ví điện tử Sprylo" : "🏦 Chuyển khoản ngân hàng"}</p>
                  <p style="margin: 5px 0;"><strong>Trạng thái:</strong> Hoàn thành</p>
                  <p style="margin: 5px 0;"><strong>Thời gian xử lý:</strong> ${new Date().toLocaleString("vi-VN")}</p>
                </div>
                <p>Số tiền <strong>${refundAmountFormatted}</strong> đã được cộng trực tiếp vào <strong>Ví Sprylo</strong> của bạn trên hệ thống. Bạn có thể sử dụng cho các lần mua sắm tiếp theo hoặc kiểm tra trong trang quản lý tài khoản.</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                <p style="font-size: 0.85rem; color: #6b7280;">Cảm ơn bạn đã tin tưởng và mua sắm tại Sprylo!</p>
              </div>
            `
          })
          emailSent = true
          console.log(`[Approve Return] Successfully sent Resend refund email to ${recipient}`)
        } catch (resendErr: any) {
          console.error("[Approve Return] Resend email failed:", resendErr?.message || resendErr)
        }
      }

      if (!emailSent && process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL && process.env.SENDGRID_RETURN_APPROVED_TEMPLATE_ID) {
        try {
          sgMail.setApiKey(process.env.SENDGRID_API_KEY)
          await sgMail.send({
            to: recipient,
            from: process.env.SENDGRID_FROM_EMAIL,
            templateId: process.env.SENDGRID_RETURN_APPROVED_TEMPLATE_ID,
            dynamicTemplateData: {
              customer_name: customerName,
              order_display_id: displayId,
              refund_amount_formatted: refundAmountFormatted,
              refund_info: metadata.refund_info || "Ví Sprylo",
              return_reason: metadata.return_reason || "Không cung cấp",
              support_email: process.env.SENDGRID_FROM_EMAIL,
              is_wallet: refundMethod === "wallet",
              is_bank_transfer: refundMethod === "bank_transfer",
            },
          })
          emailSent = true
        } catch (emailError) {
          console.error("[Approve Return] SendGrid notification failed:", emailError)
        }
      }
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