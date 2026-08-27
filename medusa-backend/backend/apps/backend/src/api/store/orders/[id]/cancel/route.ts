import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
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

    // Update order status to canceled
    await db.raw(`
      UPDATE "order" 
      SET status = 'canceled', canceled_at = NOW(), updated_at = NOW() 
      WHERE id = ?
    `, [id])

    // Refund wallet balance if wallet was used
    const metadata = order.metadata || {}
    const useWallet = metadata.use_wallet === 'true'
    const walletDeducted = Number(metadata.wallet_deducted || 0)

    if (useWallet && walletDeducted > 0 && order.customer_id) {
      try {
        const walletService: WalletModuleService = req.scope.resolve(WALLET_MODULE)
        await walletService.addBalance(order.customer_id, walletDeducted, "refund", `Hoàn tiền hủy đơn hàng ${order.id}`, order.id)
      } catch (err: any) {
        console.error("[Wallet Refund Error during Cancel]:", err.message)
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
