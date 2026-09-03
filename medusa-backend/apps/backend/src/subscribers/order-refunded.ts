import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import { Resend } from "resend";

export default async function orderRefundedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string; refundAmount: number; method: string; refundDestination?: string }>) {
  const { id, refundAmount, method, refundDestination } = data;
  
  const orderService = container.resolve(Modules.ORDER);
  const logger = container.resolve("logger") as any;

  try {
    const order = await orderService.retrieveOrder(id, { relations: ["items"] });
    if (!order) {
      return;
    }

    // --- Restock Inventory for Returned Order ---
    const db = container.resolve("__pg_connection__") as any;
    const productModuleService = container.resolve(Modules.PRODUCT);
    try {
      if (order.items && order.items.length > 0) {
        for (const item of (order as any).items) {
          if (item.variant_id) {
            // Update inventory_level (Medusa 2.0 module)
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
            `, [Number(item.quantity || 1), Number(item.quantity || 1), item.variant_id]);
            
            // Update inventory_quantity on variant
            if (productModuleService) {
              try {
                const variant = (await productModuleService.retrieveProductVariant(item.variant_id)) as any;
                if (variant && typeof variant.inventory_quantity === 'number') {
                  const newQuantity = variant.inventory_quantity + item.quantity;
                  await productModuleService.updateProductVariants(
                    item.variant_id,
                    { inventory_quantity: newQuantity } as any
                  );
                }
              } catch (variantErr) {
                logger.warn(`[order.refund.success] Could not update variant inventory_quantity: ${variantErr}`);
              }
            }

            logger.info(`[order.refund.success] Restored ${item.quantity} to inventory_level for returned variant ${item.variant_id}`);
          }
        }
      }
    } catch (invErr: any) {
      logger.error(`[order.refund.success] Failed to restock inventory: ${invErr.message}`);
    }

    if (!order.email) {
      return;
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      logger.warn(`[order.refund.success] RESEND_API_KEY is missing. Could not send email.`);
      return;
    }

    const resend = new Resend(apiKey);
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Sprylo <onboarding@resend.dev>';
    const displayId = order.display_id || order.id;

    // Use metadata if refund MethodLabel wasn't passed, though we can construct it
    let refundMethodLabel = method;
    if (method === 'zalopay') refundMethodLabel = 'ZaloPay';
    if (method === 'vnpay') refundMethodLabel = 'VNPay';
    if (order.metadata?.refund_method) {
      refundMethodLabel = order.metadata.refund_method as string;
    }

    const walletNote = refundDestination === 'wallet'
      ? '<p style="color:#059669;font-weight:600;">💰 Tiền đã được hoàn vào Ví Sprylo của bạn. Bạn có thể kiểm tra trong mục "Ví điện tử Sprylo".</p>'
      : '<p>Thời gian giao dịch từ ngân hàng có thể mất từ 1-3 ngày làm việc. Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ CSKH.</p>';

    const { data: resData, error } = await resend.emails.send({
      from: fromEmail,
      to: order.email,
      subject: `[Sprylo] Thông báo hoàn tiền đơn hàng #${displayId}`,
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #d97706;">Hoàn tiền thành công</h2>
          <p>Xin chào,</p>
          <p>Chúng tôi xin thông báo yêu cầu hoàn tiền cho đơn hàng <strong>#${displayId}</strong> của bạn đã được xử lý thành công qua hệ thống cổng thanh toán.</p>
          <p>Số tiền hoàn lại: <strong>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(refundAmount)}</strong></p>
          <p>Hình thức hoàn: <strong>${refundMethodLabel}</strong></p>
          ${walletNote}
          <br/>
          <p>Trân trọng,</p>
          <p><strong>Đội ngũ Sprylo</strong></p>
        </div>
      `
    });
    
    if (error) {
      logger.error(`[order.refund.success] Resend API Error for ${order.email}: ${error.message || JSON.stringify(error)}`);
    } else {
      logger.info(`[order.refund.success] Successfully sent refund email to ${order.email} (ID: ${resData?.id})`);
    }

  } catch (err: any) {
    logger.error(`[order.refund.success] Error sending refund email: ${err.message}`);
  }
}

export const config: SubscriberConfig = {
  event: "order.refund.success",
};
