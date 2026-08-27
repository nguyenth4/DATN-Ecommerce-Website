import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

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
    const orderRes = await db.raw(`
      SELECT id, status, fulfillment_status, metadata 
      FROM "order" 
      WHERE id = ?
    `, [id]);

    if (!orderRes.rows.length) {
      // Nếu là order lưu tạm (pending order) trong cache thì chưa xử lý confirm receipt
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    const order = orderRes.rows[0];

    if (order.status === 'canceled') {
      return res.status(400).json({ message: "Không thể xác nhận đơn hàng đã hủy" });
    }

    if (order.status === 'completed') {
      return res.status(200).json({ message: "Đơn hàng đã được xác nhận hoàn thành", orderId: id });
    }

    const customStatus = order.metadata?.custom_status;
    const fulfillmentStatus = order.fulfillment_status;
    if (
      customStatus !== 'shipping' && 
      customStatus !== 'delivered' &&
      fulfillmentStatus !== 'shipped' && 
      fulfillmentStatus !== 'delivered'
    ) {
      // Cho phép linh hoạt nếu cần
      console.warn(`[Confirm Receipt API] Order ${id} is confirmed but status is custom_status: '${customStatus}', fulfillment_status: '${fulfillmentStatus}'`);
    }

    // Cập nhật trạng thái
    await db.raw(`
      UPDATE "order"
      SET status = 'completed', updated_at = NOW()
      WHERE id = ?
    `, [id]);

    return res.status(200).json({
      message: "Xác nhận nhận hàng thành công.",
      orderId: id,
      status: 'completed'
    });
  } catch (error: any) {
    console.error("[Confirm Receipt API] Error:", error);
    return res.status(500).json({ error: error.message || "Lỗi khi xác nhận đơn hàng" });
  }
}
