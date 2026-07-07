import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { Resend } from 'resend'

// ─── Resend client (lazy init) ────────────────────────────────────────────────
const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[send-welcome-email] RESEND_API_KEY chưa được cấu hình — bỏ qua gửi email.')
    return null
  }
  return new Resend(apiKey)
}

// ─── HTML template ────────────────────────────────────────────────────────────
const buildWelcomeHtml = (firstName: string, email: string) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Chào mừng bạn đến với Sprylo</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.10);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:36px 40px;text-align:center;">
              <div style="font-size:2rem;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">Sprylo</div>
              <div style="color:rgba(255,255,255,0.7);font-size:0.85rem;margin-top:4px;">Tech & Gadgets Store</div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h1 style="font-size:1.5rem;font-weight:700;color:#0f172a;margin:0 0 8px;">
                🎉 Chào mừng, ${firstName}!
              </h1>
              <p style="color:#475569;font-size:0.95rem;line-height:1.6;margin:0 0 24px;">
                Tài khoản <strong>${email}</strong> đã được tạo thành công trên Sprylo. 
                Bạn có thể đăng nhập ngay để khám phá hàng ngàn sản phẩm công nghệ chính hãng.
              </p>

              <!-- CTA Button -->
              <div style="text-align:center;margin:32px 0;">
                <a href="${process.env.STORE_FRONTEND_URL || 'http://localhost:5174'}/login"
                   style="display:inline-block;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#ffffff;font-weight:600;font-size:0.95rem;text-decoration:none;padding:14px 36px;border-radius:999px;">
                  Đăng nhập ngay →
                </a>
              </div>

              <!-- Benefits -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;padding:20px;">
                <tr>
                  <td style="padding:8px 0;font-size:0.875rem;color:#475569;">✅ &nbsp;Voucher 100K cho đơn hàng đầu tiên</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:0.875rem;color:#475569;">🚀 &nbsp;Giao hàng nhanh toàn quốc qua GHN</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:0.875rem;color:#475569;">🔒 &nbsp;Bảo hành chính hãng 12 tháng</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:0.875rem;color:#475569;">💳 &nbsp;Ví điện tử Sprylo — hoàn tiền mỗi đơn</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f1f5f9;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:0.8rem;color:#94a3b8;">
                © 2025 Sprylo. Mọi thắc mắc liên hệ 
                <a href="mailto:support@sprylo.vn" style="color:#4F46E5;">support@sprylo.vn</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

// ─── Subscriber ───────────────────────────────────────────────────────────────
export default async function sendWelcomeEmailSubscriber({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const resend = getResend()
  if (!resend) return // RESEND_API_KEY chưa set → skip

  try {
    // Lấy thông tin customer từ Medusa
    const customerModuleService = container.resolve('customer') as any
    const customer = await customerModuleService.retrieveCustomer(data.id, {
      select: ['id', 'email', 'first_name', 'last_name'],
    })

    if (!customer?.email) {
      console.warn('[send-welcome-email] Không tìm thấy email của customer:', data.id)
      return
    }

    const firstName = customer.first_name || 'bạn'
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Sprylo <onboarding@resend.dev>'

    const { data: result, error } = await resend.emails.send({
      from: fromEmail,
      to: customer.email,
      subject: `🎉 Chào mừng ${firstName} đến với Sprylo!`,
      html: buildWelcomeHtml(firstName, customer.email),
    })

    if (error) {
      console.error('[send-welcome-email] Resend error:', error)
    } else {
      console.log(`[send-welcome-email] Email đã gửi tới ${customer.email} — ID: ${result?.id}`)
    }
  } catch (err) {
    // Không throw để không ảnh hưởng flow đăng ký
    console.error('[send-welcome-email] Lỗi không mong đợi:', err)
  }
}

export const config: SubscriberConfig = {
  event: 'customer.created',
}
