import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

type ReturnRequest = {
  reason?: string
  refund_info?: string
  refund_method?: "wallet" | "bank_transfer"
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { id } = req.params
    const { reason, refund_info, refund_method } = req.body as ReturnRequest

    if (!reason?.trim()) {
      return res.status(400).json({ error: "Lý do trả hàng là bắt buộc." })
    }

    if (refund_method && !["wallet", "bank_transfer"].includes(refund_method)) {
      return res.status(400).json({ error: "Phương thức hoàn tiền không hợp lệ." })
    }

    const orderService = req.scope.resolve(Modules.ORDER)
    const order = await orderService.retrieveOrder(id)

    const actorId = (req as any).auth_context?.actor_id
    if (order.customer_id && actorId !== order.customer_id) {
      return res.status(403).json({ error: "Bạn không có quyền yêu cầu trả hàng cho đơn này." })
    }

    const metadata = (order.metadata || {}) as Record<string, unknown>
    if (metadata.return_requested || metadata.refund_id) {
      return res.status(400).json({ error: "Đơn hàng đã có yêu cầu trả hàng hoặc đã được hoàn tiền." })
    }

    await orderService.updateOrders(id, {
      metadata: {
        ...metadata,
        return_requested: true,
        return_reason: reason.trim(),
        return_requested_at: new Date().toISOString(),
        refund_info: refund_info?.trim() || "",
        refund_method: refund_method || "bank_transfer",
      },
    })

    return res.status(200).json({ message: "Yêu cầu trả hàng đã được gửi thành công.", orderId: id })
  } catch (error: any) {
    console.error("[Request Return API] Error:", error)
    return res.status(500).json({ error: error.message || "Không thể gửi yêu cầu trả hàng." })
  }
}