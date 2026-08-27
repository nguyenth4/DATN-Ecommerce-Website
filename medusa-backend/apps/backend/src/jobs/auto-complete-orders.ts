import { MedusaContainer } from "@medusajs/framework/types";

export default async function autoCompleteOrdersJob(
  container: MedusaContainer,
  options: any
) {
  try {
    const db = container.resolve("__pg_connection__") as any;
    
    // Tìm các đơn hàng đã shipped/delivered cách đây hơn 3 ngày (tính từ thời điểm cập nhật mới nhất)
    // Thực tế nếu có 'shipped_at' thì tốt, không thì dùng updated_at
    const res = await db.raw(`
      UPDATE "order"
      SET status = 'completed', updated_at = NOW()
      WHERE (fulfillment_status = 'shipped' OR fulfillment_status = 'delivered')
        AND status != 'completed'
        AND status != 'canceled'
        AND updated_at < NOW() - INTERVAL '3 days'
      RETURNING id
    `);

    if (res.rows && res.rows.length > 0) {
      console.log(`[Auto-Complete Job] Auto-completed ${res.rows.length} orders.`);
    }
  } catch (error) {
    console.error(`[Auto-Complete Job] Failed to execute`, error);
  }
}

export const config = {
  name: "auto-complete-orders",
  schedule: "0 0 * * *", // Chạy vào nửa đêm mỗi ngày
};
