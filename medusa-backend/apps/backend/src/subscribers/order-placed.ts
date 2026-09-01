import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { IOrderModuleService, IInventoryService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { Resend } from 'resend';

// ─── Resend client (lazy init) ────────────────────────────────────────────────
const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[order-placed] RESEND_API_KEY chưa được cấu hình — bỏ qua gửi email.');
    return null;
  }
  return new Resend(apiKey);
}

// ─── HTML Template ─────────────────────────────────────────────────────────────
const buildOrderHtml = (order: any) => {
  const itemsHtml = order.items?.map((item: any) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
        <div style="font-weight: 600; color: #1e293b;">${item.title || item.product_title}</div>
        <div style="font-size: 0.85rem; color: #64748b;">Số lượng: ${item.quantity}</div>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600;">
        ${(item.unit_price || 0).toLocaleString('vi-VN')}đ
      </td>
    </tr>
  `).join('') || '';

  const customerName = order.shipping_address?.first_name 
    ? `${order.shipping_address.first_name} ${order.shipping_address.last_name || ''}`.trim()
    : 'Quý khách';

  const address = order.shipping_address?.address_1 || '';

  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8" />
      <title>Xác nhận đơn hàng</title>
    </head>
    <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.10);">
              <tr>
                <td style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:36px 40px;text-align:center;">
                  <div style="font-size:2rem;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">Sprylo</div>
                  <div style="color:rgba(255,255,255,0.7);font-size:0.9rem;margin-top:4px;">Cảm ơn bạn đã đặt hàng!</div>
                </td>
              </tr>
              <tr>
                <td style="padding:40px;">
                  <h1 style="font-size:1.5rem;font-weight:700;color:#0f172a;margin:0 0 16px;">Xin chào ${customerName},</h1>
                  <p style="color:#475569;font-size:1rem;line-height:1.6;margin:0 0 24px;">
                    Đơn hàng <strong>#${order.display_id || order.id.slice(0, 8)}</strong> của bạn đã được tiếp nhận và đang trong quá trình xử lý. Dưới đây là chi tiết đơn hàng:
                  </p>
                  
                  <div style="background:#f1f5f9;border-radius:12px;padding:24px;margin-bottom:32px;">
                    <h3 style="font-size:1.1rem;font-weight:700;color:#0f172a;margin:0 0 16px;">Chi tiết sản phẩm</h3>
                    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:0.95rem;">
                      ${itemsHtml}
                      <tr>
                        <td style="padding-top: 16px; font-weight: 700; color: #1e293b;">Tổng cộng</td>
                        <td style="padding-top: 16px; text-align: right; font-weight: 700; color: #4F46E5; font-size: 1.1rem;">
                          ${(order.total || 0).toLocaleString('vi-VN')}đ
                        </td>
                      </tr>
                    </table>
                  </div>

                  <div style="margin-bottom:32px;">
                    <h3 style="font-size:1.1rem;font-weight:700;color:#0f172a;margin:0 0 12px;">Thông tin giao hàng</h3>
                    <p style="color:#475569;font-size:0.95rem;line-height:1.6;margin:0;">
                      <strong>Người nhận:</strong> ${customerName}<br/>
                      <strong>Số điện thoại:</strong> ${order.shipping_address?.phone || 'Không có'}<br/>
                      <strong>Địa chỉ:</strong> ${address}
                    </p>
                  </div>

                  <div style="text-align:center;">
                    <a href="${process.env.STORE_FRONTEND_URL || 'http://localhost:5173'}/order-tracking"
                       style="display:inline-block;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#ffffff;font-weight:600;font-size:0.95rem;text-decoration:none;padding:14px 36px;border-radius:999px;">
                      Theo dõi đơn hàng →
                    </a>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="background:#f1f5f9;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
                  <p style="margin:0;font-size:0.85rem;color:#64748b;">
                    © 2026 Sprylo. Mọi thắc mắc liên hệ <a href="mailto:sprylo123@gmail.com" style="color:#4F46E5;">sprylo123@gmail.com</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = data.id;

  const orderService: IOrderModuleService = container.resolve(
    Modules.ORDER
  );

  const order = await orderService.retrieveOrder(orderId, {
    relations: ["items", "shipping_address", "billing_address", "customer"],
  });

  console.log(`[Order Placed] Processing order ${orderId}`);

  // Send Order Confirmation Email
  const resend = getResend();
  const customerEmail = order.email || order.customer?.email;

  if (resend && customerEmail) {
    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'Sprylo <onboarding@resend.dev>';
      const { data: result, error } = await resend.emails.send({
        from: fromEmail,
        to: customerEmail,
        subject: `[Sprylo] Xác nhận đơn hàng #${order.display_id || order.id.slice(0, 8)}`,
        html: buildOrderHtml(order),
      });

      if (error) {
        console.error('[order-placed] Resend error:', error);
      } else {
        console.log(`[order-placed] Order confirmation email sent to ${customerEmail} — ID: ${result?.id}`);
      }
    } catch (err) {
      console.error('[order-placed] Unexpected error sending email:', err);
    }
  } else {
    console.log(`[order-placed] Cannot send email. Resend configured: ${!!resend}, Email found: ${!!customerEmail}`);
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
