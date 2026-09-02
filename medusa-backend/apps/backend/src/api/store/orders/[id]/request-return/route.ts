import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

/**
 * POST /store/orders/:id/request-return
 * Allows a customer to request a return/refund for a delivered order.
 * Body: { reason: string, refund_info?: string, refund_destination?: 'wallet' | 'bank_transfer' }
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params;
    const { reason, refund_info, refund_destination } = req.body as {
      reason?: string;
      refund_info?: string;
      refund_destination?: 'wallet' | 'bank_transfer';
    };

    if (!reason) {
      return res.status(400).json({ error: "Lý do trả hàng là bắt buộc" });
    }

    const orderService = req.scope.resolve(Modules.ORDER);
    const order = await orderService.retrieveOrder(id, { relations: ["metadata"] });

    if (!order) {
      return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
    }

    const updatedMetadata: Record<string, any> = {
      ...order.metadata,
      return_requested: true,
      return_reason: reason,
      return_requested_at: new Date().toISOString(),
    };

    if (refund_info) {
      updatedMetadata.refund_info = refund_info;
    }

    // Store refund destination preference (wallet or bank_transfer)
    if (refund_destination) {
      updatedMetadata.refund_destination = refund_destination;
    }

    // Update the order metadata to indicate a return request
    await orderService.updateOrders(id, {
      metadata: updatedMetadata,
    });

    return res.status(200).json({
      message: "Yêu cầu trả hàng đã được gửi thành công",
      orderId: id,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Request return failed";
    console.error("[Request Return API] Error:", error);
    return res.status(500).json({ error: message });
  }
}

