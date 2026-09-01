import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { updateOrderStatus } from "../../../../admin/orders/controller";

/**
 * POST /store/orders/:id/confirm-receipt
 * Cập nhật trạng thái đơn hàng sang completed (Đã nhận hàng)
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params;
    console.log(`[Confirm Receipt API] Processing order: ${id}`);

    const db = req.scope.resolve("__pg_connection__");

    // Lấy thông tin đơn hàng hiện tại
    const orderRes = await db.raw(
      `
      SELECT id, status, metadata 
      FROM "order" 
      WHERE id = ? OR display_id::text = ?
    `,
      [id, id],
    );

    if (!orderRes.rows.length) {
      // Nếu là order lưu tạm (pending order) trong cache thì chưa xử lý confirm receipt
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    const order = orderRes.rows[0];
    const realOrderId = order.id;

    if (order.status === "canceled") {
      return res
        .status(400)
        .json({ message: "Không thể xác nhận đơn hàng đã hủy" });
    }

    if (order.status === "completed") {
      return res.status(200).json({
        message: "Đơn hàng đã được xác nhận hoàn thành",
        orderId: realOrderId,
      });
    }

    const customStatus =
      order.metadata?.custom_status || order.status || "pending";
    const adminName = "Khách hàng (Xác nhận nhận hàng)";

    // Preserve allowed state transitions and keep all payment logic in one place.
    if (customStatus === "pending") {
      await updateOrderStatus(
        req.scope,
        realOrderId,
        "confirmed",
        undefined,
        adminName,
      );
    }

    if (["pending", "confirmed", "preparing"].includes(customStatus)) {
      await updateOrderStatus(
        req.scope,
        realOrderId,
        "shipping",
        undefined,
        adminName,
      );
    }

    await updateOrderStatus(
      req.scope,
      realOrderId,
      "completed",
      undefined,
      "Khách hàng (Xác nhận nhận hàng)",
    );

    return res.status(200).json({
      message: "Xác nhận nhận hàng thành công.",
      orderId: realOrderId,
      status: "completed",
    });
  } catch (error: any) {
    console.error("[Confirm Receipt API] Error:", error);
    return res
      .status(400)
      .json({ message: error.message || "Lỗi khi xác nhận đơn hàng" });
  }
}
