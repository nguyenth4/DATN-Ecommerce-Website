import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { Resend } from 'resend'

// ─── Resend client (lazy init) ────────────────────────────────────────────────
const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[password-reset] RESEND_API_KEY chưa được cấu hình — bỏ qua gửi email.')
    return null
  }
  return new Resend(apiKey)
}

// ─── HTML template ────────────────────────────────────────────────────────────
const buildResetHtml = (email: string, resetUrl: string) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Đặt lại mật khẩu Sprylo</title>
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
                Yêu cầu đặt lại mật khẩu
              </h1>
              <p style="color:#475569;font-size:0.95rem;line-height:1.6;margin:0 0 24px;">
                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>${email}</strong> của bạn. 
                Vui lòng nhấp vào nút dưới đây để thiết lập mật khẩu mới. Liên kết này sẽ hết hạn trong thời gian ngắn.
              </p>

              <!-- CTA Button -->
              <div style="text-align:center;margin:32px 0;">
                <a href="${resetUrl}"
                   style="display:inline-block;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#ffffff;font-weight:600;font-size:0.95rem;text-decoration:none;padding:14px 36px;border-radius:999px;">
                  Đặt lại mật khẩu →
                </a>
              </div>

              <p style="color:#64748b;font-size:0.85rem;line-height:1.6;margin:24px 0 0;">
                Nếu nút trên không hoạt động, bạn có thể sao chép và dán liên kết sau vào trình duyệt:
                <br />
                <a href="${resetUrl}" style="color:#4F46E5;word-break:break-all;">${resetUrl}</a>
              </p>

              <hr style="border:0;border-top:1px solid #e2e8f0;margin:32px 0;" />

              <p style="color:#94a3b8;font-size:0.85rem;line-height:1.5;margin:0;">
                Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email này. Mật khẩu của bạn sẽ không thay đổi.
              </p>
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
export default async function passwordResetSubscriber({
  event: { data },
  container,
}: SubscriberArgs<{ email: string; token: string }>) {
  const email = data.email
  const token = data.token

  const storefrontUrl = process.env.STORE_FRONTEND_URL || 'http://localhost:5174'
  const resetUrl = `${storefrontUrl}/reset-password?token=${token}&email=${email}`

  console.log(`[password-reset] Nhận sự kiện auth.password_reset cho email: ${email}`)
  console.log(`[password-reset] Link đặt lại mật khẩu: ${resetUrl}`)

  const resend = getResend()
  if (!resend) {
    console.warn(`[password-reset] RESEND_API_KEY chưa cấu hình. Link reset của bạn là: ${resetUrl}`)
    return
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Sprylo <onboarding@resend.dev>'

    const { data: result, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: '🔒 Đặt lại mật khẩu tài khoản Sprylo của bạn',
      html: buildResetHtml(email, resetUrl),
    })

    if (error) {
      console.error('[password-reset] Resend error:', error)
    } else {
      console.log(`[password-reset] Email reset đã gửi tới ${email} — ID: ${result?.id}`)
    }
  } catch (err) {
    console.error('[password-reset] Lỗi gửi email không mong đợi:', err)
  }
}

export const config: SubscriberConfig = {
  event: 'auth.password_reset',
}
