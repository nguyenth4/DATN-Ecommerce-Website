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

    // Capture COD payment if the order has metadata.payment_method === 'cod'
    const paymentMethod = order.metadata?.payment_method;
    if (paymentMethod === "cod") {
      const paycolRes = await db.raw(`
        SELECT pc.id, pc.amount, pc.status FROM payment_collection pc
        JOIN order_payment_collection opc ON pc.id = opc.payment_collection_id
        WHERE opc.order_id = ?
      `, [id]);

      const paycol = paycolRes.rows[0];
      if (paycol && paycol.status !== 'completed') {
        const existingPaymentRes = await db.raw(`
          SELECT id FROM payment WHERE payment_collection_id = ? LIMIT 1
        `, [paycol.id]);

        if (existingPaymentRes.rows.length === 0) {
          const generateMedusaId = (prefix: string) => {
            const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            let result = "";
            for (let i = 0; i < 18; i++) {
              result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return `${prefix}_01${result}`;
          };

          const paymentSessionId = generateMedusaId('payses');
          const paymentId = generateMedusaId('pay');
          const trxId = generateMedusaId('ordtrx');
          const rawAmountStr = JSON.stringify({ value: paycol.amount.toString(), precision: 20 });

          // 1. Insert into payment_session
          await db.raw(`
            INSERT INTO payment_session (
              id, currency_code, amount, raw_amount, provider_id, 
              data, context, status, authorized_at, payment_collection_id, metadata, created_at, updated_at
            ) VALUES (?, 'vnd', ?, ?, 'pp_system_default', '{}', '{}', 'authorized', NOW(), ?, '{}', NOW(), NOW())
          `, [paymentSessionId, paycol.amount, rawAmountStr, paycol.id]);

          // 2. Insert into payment
          await db.raw(`
            INSERT INTO payment (
              id, amount, raw_amount, currency_code, provider_id, 
              created_at, updated_at, captured_at, payment_collection_id, payment_session_id, data, metadata
            ) VALUES (?, ?, ?, 'vnd', 'pp_system_default', NOW(), NOW(), NOW(), ?, ?, '{}', '{}')
          `, [paymentId, paycol.amount, rawAmountStr, paycol.id, paymentSessionId]);

          // 3. Insert into order_transaction
          await db.raw(`
            INSERT INTO order_transaction (
              id, order_id, version, amount, raw_amount, currency_code, 
              reference, reference_id, created_at, updated_at
            ) VALUES (?, ?, 1, ?, ?, 'vnd', 'capture', ?, NOW(), NOW())
          `, [trxId, id, paycol.amount, rawAmountStr, paymentId]);

          // 4. Update order_summary totals
          const summaryRes = await db.raw(`
            SELECT id, totals FROM order_summary WHERE order_id = ?
          `, [id]);
          
          if (summaryRes.rows.length > 0) {
            const summary = summaryRes.rows[0];
            const newTotals = {
              ...summary.totals,
              paid_total: Number(paycol.amount),
              raw_paid_total: { value: paycol.amount.toString(), precision: 20 },
              transaction_total: Number(paycol.amount),
              raw_transaction_total: { value: paycol.amount.toString(), precision: 20 },
              pending_difference: 0,
              raw_pending_difference: { value: '0', precision: 20 }
            };

            await db.raw(`
              UPDATE order_summary 
              SET totals = ?, updated_at = NOW() 
              WHERE id = ?
            `, [JSON.stringify(newTotals), summary.id]);
          }
        }

        const rawAmountStr = JSON.stringify({ value: paycol.amount.toString(), precision: 20 });
        
        await db.raw(`
          UPDATE payment_collection 
          SET status = 'completed',
              captured_amount = ?,
              raw_captured_amount = ?,
              authorized_amount = ?,
              raw_authorized_amount = ?,
              updated_at = NOW()
          WHERE id = ?
        `, [paycol.amount, rawAmountStr, paycol.amount, rawAmountStr, paycol.id]);

        console.log(`[Confirm Receipt API] COD Payment captured and status updated to completed for order: ${id}`);
      }
    }

    // Cập nhật trạng thái thông qua controller của admin để chạy đầy đủ logic nghiệp vụ
    await updateOrderStatus(req.scope, id, "completed", undefined, "Khách hàng (Xác nhận nhận hàng)");

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
