# Handoff Document — Sprylo E-Commerce (DATN)

> **Cập nhật lần cuối:** 2026-08-27  
> **Dự án:** Website Thương Mại Điện Tử — Đồ Án Tốt Nghiệp FPT Polytechnic  
> **Tên thương hiệu:** Sprylo

---

## 1. Tổng quan kiến trúc

```
DATN-Ecommerce-Website/
├── src/                          ← Frontend (React + Vite, port 5174)
│   └── client/
│       ├── pages/                ← Các trang chính
│       ├── components/           ← Các component tái sử dụng
│       ├── services/             ← API calls, auth service
│       ├── routes/               ← Định nghĩa routing (React Router v7)
│       └── utils/
│
└── medusa-backend/backend/       ← Backend (Medusa v2, port 9000)
    └── apps/backend/
        ├── src/api/store/        ← Custom API routes
        ├── src/modules/          ← Custom Medusa modules
        ├── src/subscribers/      ← Event subscribers
        ├── src/workflows/        ← Workflows
        └── .env                  ← File cấu hình chính
```

**Tech stack:**
| Tầng | Công nghệ |
|------|-----------|
| Frontend | React 18, Vite 8, React Router v7, Framer Motion, Lucide React |
| Backend | Medusa v2, Node.js, TypeScript |
| Database | PostgreSQL (Supabase cloud) |
| File Storage | Supabase S3-compatible Storage |
| Admin UI | Medusa Admin (`http://localhost:9000/app`) |

---

## 2. Cách khởi động dự án

### 2.1 Backend (Medusa)

```bash
cd medusa-backend/backend
npm run dev
# Backend chạy tại: http://localhost:9000
# Admin UI tại:     http://localhost:9000/app
```

> **Quan trọng:** File `.env` cần có đầy đủ thông tin — xem mục 4.

### 2.2 Frontend (React/Vite)

```bash
# Tại thư mục gốc dự án
npm run dev
# Frontend chạy tại: http://localhost:5174
```

---

## 3. Trang frontend & chức năng

| Route | Trang | Mô tả |
|-------|-------|--------|
| `/` | `HomePage` | Trang chủ, banner, sản phẩm nổi bật, Bento grid |
| `/products` | `ProductsPage` | Danh sách sản phẩm, lọc/tìm kiếm/phân trang |
| `/products/:id` | `ProductDetailPage` | Chi tiết sản phẩm, review, thêm giỏ hàng |
| `/cart` | `CartPage` | Giỏ hàng, cập nhật số lượng |
| `/checkout` | `CheckoutPage` | Thanh toán: địa chỉ, phương thức vận chuyển, thanh toán |
| `/checkout/vnpay_return` | `VNPayReturnPage` | Kết quả sau thanh toán VNPAY |
| `/account` | `AccountPage` | Hồ sơ, đơn hàng, đổi mật khẩu, ví điện tử |
| `/login` | `LoginPage` | Đăng nhập (email/pass, Google OAuth) |
| `/register` | `RegisterPage` | Đăng ký tài khoản |
| `/forgot-password` | `ForgotPasswordPage` | Quên mật khẩu |
| `/reset-password` | `ResetPasswordPage` | Đặt lại mật khẩu |
| `/compare` | `ComparisonPage` | So sánh sản phẩm |
| `/wishlist` | `WishlistPage` | Danh sách yêu thích |
| `/order-tracking` | `OrderTrackingPage` | Tra cứu đơn hàng |
| `/contact` | `ContactPage` | Liên hệ |
| `/auth/callback` | `OAuthCallbackPage` | Xử lý redirect từ Google/Facebook OAuth |
| `/order-success` | `OrderSuccessPage` | Thông báo đặt hàng thành công (COD/Ví) |

---

## 4. Cấu hình môi trường (`.env`)

File: `medusa-backend/backend/apps/backend/.env`

### Database & Core
```env
DATABASE_URL=postgresql://postgres:DatnEcom2026SecurePass@db.yumyjivpmdwkpdvrnurh.supabase.co:5432/postgres?sslmode=no-verify
NODE_TLS_REJECT_UNAUTHORIZED=0
JWT_SECRET=supersecret
COOKIE_SECRET=supersecret
```

### Supabase Storage (S3)
```env
S3_FILE_URL=https://yumyjivpmdwkpdvrnurh.supabase.co/storage/v1/object/public/medusa-media
S3_ENDPOINT=https://yumyjivpmdwkpdvrnurh.storage.supabase.co/storage/v1/s3
S3_BUCKET=medusa-media
S3_ACCESS_KEY_ID=b8df22cd0246b9eb0fde69c863d9d38f
S3_SECRET_ACCESS_KEY=69e283bcfdf5c8137a77465227b3a9819755757f4e4267513c398d71df8ac8f5
```

### GHN Shipping (Sandbox)
```env
GHN_TOKEN=f3938850-63eb-11f1-98a4-aecc0078e248
GHN_SHOP_ID=6482305
GHN_BASE_URL=https://dev-online-gateway.ghn.vn/shiip/public-api
FROM_DISTRICT_ID=1442    # Quận 1, HCM
FROM_WARD_CODE=20308
```

### VNPAY (Sandbox)
```env
VNPAY_HOST=https://sandbox.vnpayment.vn
VNPAY_TMN_CODE=ALPIZLIR
VNPAY_SECURE_SECRET=TACJHLJOHYIDYOEHGBWVXDJQNBIMOKDT
VNPAY_RETURN_URL=http://localhost:5174/checkout/vnpay_return
VNPAY_IPN_URL=http://localhost:9000/store/payment/vnpay/ipn
```

### Google OAuth
```env
GOOGLE_CLIENT_ID=xxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_CALLBACK_URL=http://localhost:9000/auth/customer/google/callback
```

### Email (Resend)
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx   # Cần thay bằng key thật
RESEND_FROM_EMAIL=Sprylo <onboarding@resend.dev>
STORE_FRONTEND_URL=http://localhost:5174
```

---

## 5. Custom API Routes (Backend)

Tất cả routes trong `src/api/store/`:

| Method | Endpoint | Chức năng |
|--------|----------|-----------|
| `POST` | `/store/checkout` | Tạo đơn hàng, trừ tồn kho, tạo payment collection, build VNPAY URL |
| `GET` | `/store/payment/vnpay/ipn` | IPN callback từ VNPAY (xác nhận giao dịch server-to-server) |
| `POST` | `/store/payment/vnpay/ipn` | IPN callback từ VNPAY |
| `GET/POST` | `/store/ghn/fee` | Tính phí vận chuyển GHN |
| `GET/POST` | `/store/ghn/soc` | Tạo đơn vận chuyển GHN |
| `GET/POST` | `/store/orders/:id/cancel` | Hủy đơn hàng, hoàn trả tồn kho |
| `GET/POST` | `/store/wallet` | Quản lý ví điện tử |
| `GET/POST` | `/store/reviews` | Đánh giá sản phẩm |
| `GET/POST` | `/store/recommendations` | Gợi ý sản phẩm (AI Gemini) |
| `GET/POST` | `/store/interactions` | Lịch sử xem/tương tác sản phẩm |
| `POST` | `/store/custom/profile` | Cập nhật hồ sơ khách hàng |
| `POST` | `/store/custom/upload-avatar` | Upload ảnh đại diện |
| `POST` | `/store/custom/change-password` | Đổi mật khẩu |

---

## 6. Custom Modules (Backend)

Trong `src/modules/`:

| Module | Chức năng |
|--------|-----------|
| `wallet` | Ví điện tử — quản lý số dư, lịch sử giao dịch |
| `payment-vnpay` | VNPAY payment provider tích hợp Medusa v2 |
| `ghn-fulfillment` | GHN Fulfillment provider |
| `auth-providers` | Google OAuth provider |
| `recommendation` | Gợi ý sản phẩm dựa trên hành vi |
| `shipping` | Tính phí ship nội bộ |

---

## 7. Luồng thanh toán VNPAY

```
[Frontend Checkout]
    │
    ▼
POST /store/checkout
    │  ← Tạo order trong DB Medusa
    │  ← Tạo payment_collection liên kết với order
    │  ← Build VNPAY URL (HMAC-SHA512) via SDK vnpay@2.5.0
    │
    ▼
[Redirect → sandbox.vnpayment.vn]
    │  ← User nhập thông tin thẻ & OTP
    │
    ├─→ vnp_ReturnUrl → /checkout/vnpay_return (Frontend)
    │       └─ VNPayReturnPage hiển thị kết quả thành công/thất bại
    │
    └─→ vnp_IpnUrl → /store/payment/vnpay/ipn (Backend)
            └─ Verify chữ ký → UPDATE payment_collection SET status='completed'
```

**Thẻ test sandbox NCB:**
- Số thẻ: `9704198526191432 19`
- Tên chủ thẻ: `NGUYEN VAN A`
- Ngày phát hành: `07/15`
- OTP: `123456`

> **Lưu ý IPN:** Trong môi trường `localhost`, VNPAY sandbox **không thể gọi ngược** về `localhost:9000`. IPN sẽ không hoạt động tự động khi dev local. Chỉ `vnp_ReturnUrl` (redirect người dùng) mới hoạt động. Để test IPN đầy đủ, dùng **ngrok** hoặc deploy lên server public.

---

## 8. Phương thức thanh toán được hỗ trợ

| Phương thức | Trạng thái | Ghi chú |
|-------------|-----------|---------|
| COD (Thanh toán khi nhận hàng) | ✅ Hoạt động | `payment_status = pending` |
| VNPAY | ✅ Hoạt động (sandbox) | Cần credentials thật khi production |
| Ví điện tử (Sprylo Wallet) | ✅ Hoạt động | Tích hợp với module wallet nội bộ |
| MoMo | 🔧 Placeholder | Chưa tích hợp thật |
| ZaloPay | 🔧 Placeholder | Chưa tích hợp thật |

---

## 9. Tính năng đã hoàn thiện

- [x] Xác thực người dùng: Đăng ký, Đăng nhập, Quên/Đặt lại mật khẩu
- [x] OAuth: Google Login
- [x] Danh sách & lọc sản phẩm (theo danh mục, giá, rating)
- [x] Chi tiết sản phẩm + gallery ảnh
- [x] Giỏ hàng (LocalStorage)
- [x] Checkout đầy đủ: địa chỉ, phương thức ship, phương thức thanh toán
- [x] Tích hợp GHN (tính phí ship, tạo đơn)
- [x] Thanh toán VNPAY sandbox (URL hợp lệ có chữ ký HMAC-SHA512)
- [x] Ví điện tử: nạp tiền, trừ tiền khi mua, lịch sử giao dịch
- [x] Trang tài khoản: hồ sơ cá nhân, đơn hàng, đổi mật khẩu, upload avatar
- [x] Hủy đơn hàng (hoàn trả tồn kho)
- [x] Đánh giá sản phẩm
- [x] So sánh sản phẩm
- [x] Wishlist
- [x] Gợi ý sản phẩm (AI Gemini)
- [x] Tra cứu đơn hàng
- [x] Trang liên hệ
- [x] Medusa Admin Dashboard kết nối đúng với DB

---

## 10. Những việc chưa hoàn thành / Cần làm tiếp

### Ưu tiên cao
- [ ] **Email thật:** Thay `RESEND_API_KEY` bằng key thật để gửi email xác nhận đơn hàng, quên mật khẩu
- [ ] **Facebook OAuth:** Điền `FACEBOOK_APP_ID` và `FACEBOOK_APP_SECRET` thật
- [ ] **VNPAY Production:** Khi go-live, thay `VNPAY_HOST`, `VNPAY_TMN_CODE`, `VNPAY_SECURE_SECRET` bằng credentials production và bỏ `testMode: true`

### Ưu tiên trung bình
- [ ] **MoMo / ZaloPay:** Tích hợp thật thay cho placeholder hiện tại
- [ ] **IPN VNPAY qua ngrok/server public:** Để test đồng bộ payment_status đầy đủ trong môi trường dev
- [ ] **GHN Production:** Chuyển từ sandbox sang production khi go-live

### Ưu tiên thấp
- [ ] SEO: meta tags, sitemap
- [ ] PWA support
- [ ] Tối ưu hiệu suất: lazy loading ảnh, code splitting

---

## 11. Troubleshooting thường gặp

### Backend không khởi động
- Kiểm tra Supabase còn hoạt động tại `https://supabase.com/dashboard`
- Xem log lỗi — thường do `DATABASE_URL` timeout

### VNPAY báo "Invalid Signature"
- Kiểm tra `VNPAY_TMN_CODE` và `VNPAY_SECURE_SECRET` trong `.env` không có dấu cách thừa
- Đảm bảo đang dùng đúng file `.env` tại `medusa-backend/backend/apps/backend/.env`

### VNPAY URL không được tạo (paymentUrl = null)
- Kiểm tra log backend: tìm dòng `[VNPay Checkout Error]`
- Đảm bảo package `vnpay@2.5.0` đã được cài trong `medusa-backend/backend`

### Đơn hàng tạo nhưng payment_status không cập nhật
- Đây là hành vi bình thường khi dev local (IPN không hoạt động với localhost)
- Dùng ngrok để expose localhost hoặc kiểm tra thủ công qua Medusa Admin

### Frontend lỗi CORS
- Kiểm tra `STORE_CORS`, `AUTH_CORS` trong `.env` có chứa `http://localhost:5174`

---

## 12. Thông tin tài khoản dịch vụ

| Dịch vụ | Ghi chú |
|---------|---------|
| Supabase | Project ID: `yumyjivpmdwkpdvrnurh` |
| GHN | Sandbox — khachhang.ghn.vn |
| VNPAY Sandbox | TMN Code: `ALPIZLIR` |
| Google Cloud Console | Client ID đã cấu hình OAuth consent screen |
| Resend | Cần thay API key thật trước khi gửi email |
