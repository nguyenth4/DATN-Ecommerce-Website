import { MedusaContainer } from "@medusajs/framework/types";

export default async function autoCompleteOrdersJob(
  container: MedusaContainer,
  options: any
) {
  try {
    const db = container.resolve("__pg_connection__") as any;
    
    // Tìm các đơn hàng đã shipped/delivered cách đây hơn 3 ngày (tính từ thời điểm cập nhật mới nhất)
    // Thực tế nếu có 'shipped_at' thì tốt, không thì dùng updated_at
    const ordersToComplete = await db.raw(`
      SELECT id, metadata FROM "order"
      WHERE (
        metadata->>'custom_status' = 'shipping' 
        OR metadata->>'custom_status' = 'delivered'
      )
        AND status != 'completed'
        AND status != 'canceled'
        AND updated_at < NOW() - INTERVAL '3 days'
    `);

    if (ordersToComplete.rows && ordersToComplete.rows.length > 0) {
      for (const order of ordersToComplete.rows) {
        const metadata = {
          ...(order.metadata || {}),
          custom_status: 'completed',
          ...(order.metadata?.payment_method === 'cod' ? { payment_status: 'paid' } : {})
        };
        await db.raw(`
          UPDATE "order"
          SET status = 'completed', metadata = ?, updated_at = NOW()
          WHERE id = ?
        `, [JSON.stringify(metadata), order.id]);
      }
      console.log(`[Auto-Complete Job] Auto-completed ${ordersToComplete.rows.length} orders.`);
    }
  } catch (error) {
    console.error(`[Auto-Complete Job] Failed to execute`, error);
  }
}

export const config = {
  name: "auto-complete-orders",
  schedule: "0 0 * * *", // Chạy vào nửa đêm mỗi ngày
};
