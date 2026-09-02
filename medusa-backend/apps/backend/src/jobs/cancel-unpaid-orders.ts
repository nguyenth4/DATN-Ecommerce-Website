import { MedusaContainer } from "@medusajs/framework/types";

export default async function cancelUnpaidOrdersJob(
  container: MedusaContainer,
  options: any
) {
  try {
    const db = container.resolve("__pg_connection__") as any;
    
    // Hủy các đơn hàng đang ở trạng thái pending, chưa được thanh toán và đã quá 24h
    const res = await db.raw(`
      UPDATE "order"
      SET status = 'canceled', updated_at = NOW()
      WHERE status = 'pending'
        AND (
          metadata->>'payment_status' = 'awaiting' 
          OR metadata->>'payment_status' = 'pending'
          OR metadata->>'payment_status' IS NULL
        )
        AND created_at < NOW() - INTERVAL '24 hours'
      RETURNING id
    `);

    if (res.rows && res.rows.length > 0) {
      console.log(`[Cancel Unpaid Orders Job] Auto-canceled ${res.rows.length} unpaid orders.`);
    }
  } catch (error) {
    console.error(`[Cancel Unpaid Orders Job] Failed to execute`, error);
  }
}

export const config = {
  name: "cancel-unpaid-orders",
  schedule: "0 * * * *", // Chạy mỗi giờ một lần
};
