# Tài Liệu Handoff - Tổng Hợp Lỗi Và Các Vấn Đề Chưa Hoàn Chỉnh

Tài liệu này tổng hợp các lỗi hiện tại trên hệ thống (cả phần Client và Admin) và danh sách các tính năng/luồng xử lý chưa được hoàn thiện.

---

## 1. Các luồng chức năng chưa hoàn chỉnh (Cần ưu tiên xử lý)

*   **Luồng thanh toán (Payment Flow):**
    *   Chưa xử lý hoàn chỉnh các trường hợp thanh toán thất bại, timeout, hoặc khách hàng hủy thanh toán giữa chừng.
    *   Cần kiểm tra kỹ tiến trình cập nhật trạng thái đơn hàng (từ `pending` sang `paid` hoặc `failed`) sau khi nhận webhook/callback từ cổng thanh toán.
    *   *Liên quan:* Có script `fix_unpaid_orders_2.js` đang được dùng để xử lý tạm thời các đơn hàng lỗi trạng thái.

*   **Thông báo hoàn tiền bằng ngân hàng (Bank Refund Notification):**
    *   Luồng hoàn tiền (ZaloPay/Ngân hàng) chưa hoàn thiện phần gửi thông báo (email/SMS/In-app) cho khách hàng sau khi tiền đã được hoàn thành công.
    *   *Liên quan:* File `zalopayRefund.ts`.

*   **Gửi mail liên hệ (Contact Email):**
    *   Chức năng khách hàng gửi form liên hệ chưa hoạt động trơn tru (có thể do chưa cấu hình SMTP hoặc lỗi logic gọi API gửi mail).

*   **Đánh giá sản phẩm (Reviews & Ratings):**
    *   Luồng submit đánh giá, duyệt đánh giá chưa hoàn chỉnh.
    *   Đặc biệt cần kiểm tra phần tích hợp AI (Gemini) trong việc phân tích/duyệt đánh giá tự động.
    *   *Liên quan:* File `gemini.ts` trong api reviews.

*   **Logic Hủy Đơn Hàng (Order Cancellation):**
    *   Chưa chặn việc khách hàng tự ý hủy đơn sau khi đơn hàng đã được Admin xác nhận/duyệt (approved). Cần cập nhật logic chỉ cho phép khách hàng hủy đơn khi đơn hàng đang ở trạng thái chờ duyệt (pending).

---

## 2. Danh sách lỗi web (Bugs) đang gặp phải

### A. Phía Client (Storefront - Website bán hàng)
*   **Trang Tài khoản (Account Page):** Cần rà soát lại UI/UX và logic load dữ liệu (như hiển thị lịch sử đơn hàng, trạng thái đơn hàng chưa đồng bộ đúng).
*   **Xử lý lỗi UI (Error Handling):** Các thông báo lỗi khi thanh toán thất bại hoặc thêm vào giỏ hàng lỗi chưa được hiển thị rõ ràng cho người dùng.
*   *(Cần rà soát & bổ sung thêm các lỗi về giao diện responsive, tốc độ load trang...)*

### B. Phía Admin (Medusa Dashboard)
*   **Giao diện Quản lý Đánh giá (Reviews):** Bảng/Trang quản lý đánh giá không hiển thị hoặc không thể truy cập được trên UI của Admin Dashboard.
*   **Quản lý đơn hàng:** Chưa có luồng rõ ràng để Admin xử lý các đơn hàng bị kẹt ở trạng thái thanh toán (unpaid) một cách tự động, hiện tại đang phải dùng script thủ công.
*   **Quản lý hoàn tiền:** Giao diện hoặc logic xử lý hoàn tiền qua cổng thanh toán thứ 3 từ Admin dashboard cần được kiểm thử lại toàn diện.
*   *(Cần rà soát & bổ sung thêm các lỗi về hiển thị danh sách, phân trang, lọc dữ liệu...)*

---

## 3. Trang frontend & chức năng

| Route                    | Trang                | Mô tả                                                   |
| ------------------------ | -------------------- | ------------------------------------------------------- |
| `/`                      | `HomePage`           | Trang chủ, banner, sản phẩm nổi bật, Bento grid         |
| `/products`              | `ProductsPage`       | Danh sách sản phẩm, lọc/tìm kiếm/phân trang             |
| `/products/:id`          | `ProductDetailPage`  | Chi tiết sản phẩm, review, thêm giỏ hàng                |
| `/cart`                  | `CartPage`           | Giỏ hàng, cập nhật số lượng                             |
| `/checkout`              | `CheckoutPage`       | Thanh toán: địa chỉ, phương thức vận chuyển, thanh toán |
| `/checkout/vnpay_return` | `VNPayReturnPage`    | Kết quả sau thanh toán VNPAY                            |
| `/account`               | `AccountPage`        | Hồ sơ, đơn hàng, đổi mật khẩu, ví điện tử               |
| `/login`                 | `LoginPage`          | Đăng nhập (email/pass, Google/Facebook OAuth)           |
| `/register`              | `RegisterPage`       | Đăng ký tài khoản                                       |
| `/forgot-password`       | `ForgotPasswordPage` | Quên mật khẩu                                           |
| `/reset-password`        | `ResetPasswordPage`  | Đặt lại mật khẩu                                        |
| `/compare`               | `ComparisonPage`     | So sánh sản phẩm                                        |
| `/wishlist`              | `WishlistPage`       | Danh sách yêu thích                                     |
| `/order-tracking`        | `OrderTrackingPage`  | Tra cứu đơn hàng                                        |
| `/contact`               | `ContactPage`        | Liên hệ                                                 |
| `/auth/callback`         | `OAuthCallbackPage`  | Xử lý redirect từ Google/Facebook OAuth                 |
| `/order-success`         | `OrderSuccessPage`   | Thông báo đặt hàng thành công (COD/Ví)                  |

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

### Google và Facebook OAuth

```env
GOOGLE_CLIENT_ID=xxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_CALLBACK_URL=http://localhost:9000/auth/customer/google/callback
# Facebook OAuth credentials (giá trị thật chỉ lưu trong backend/.env, không commit)
FACEBOOK_APP_ID=<Meta App ID>
FACEBOOK_APP_SECRET=<Meta App Secret>
FACEBOOK_CALLBACK_URL=http://localhost:9000/auth/customer/facebook/callback
```

Facebook Login redirect về `/auth/callback?_type=facebook&token=...`. Ba biến `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET` và `FACEBOOK_CALLBACK_URL` phải nằm trong `medusa-backend/backend/apps/backend/.env`.

**Lưu ý vận hành (đã xử lý):** Khi backend chưa được khởi động lại sau khi cập nhật `.env`, `POST /auth/customer/facebook` sẽ dùng fallback `your_facebook_app_id_here`, làm Meta báo _ID ứng dụng không hợp lệ_. Dừng tiến trình cũ trên cổng `9000` và chạy lại tại thư mục `medusa-backend/backend/apps/backend`:

```powershell
npm run dev
```

Kiểm tra cấu hình đang được nạp bằng request `POST http://localhost:9000/auth/customer/facebook`. Trường `location` trả về phải có `client_id=<Meta App ID>`, không phải `your_facebook_app_id_here`. Trên Meta Developers, thêm Redirect URI hợp lệ: `http://localhost:9000/auth/customer/facebook/callback`; khi app còn ở Development mode, tài khoản kiểm thử phải có vai trò Admin, Developer hoặc Tester.

### Email (Resend)

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx   # Cần thay bằng key thật
RESEND_FROM_EMAIL=Sprylo <onboarding@resend.dev>
STORE_FRONTEND_URL=http://localhost:5174
```

### Email hoàn tiền (SendGrid)

```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=verified-sender@example.com
SENDGRID_RETURN_APPROVED_TEMPLATE_ID=d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

- `SENDGRID_FROM_EMAIL` phải hoàn tất Single Sender Verification hoặc xác thực domain trên SendGrid.
- Dynamic Template hoàn tiền: `apps/backend/static/sendgrid-return-approved-template.html`.
- Không lưu API key thật trong tài liệu, source control hoặc trao đổi chat.

---

## 5. Báo giá vận chuyển GHN và GHTK

### Trạng thái hiện tại

- Checkout gọi API báo giá thật của GHN qua `POST /store/ghn/fee` và GHTK qua `POST /store/ghtk/fee`; không dùng bảng giá mock khi API trả về thành công.
- Checkout gửi đồng nhất cho cả hai hãng: cân nặng thực tế, chiều dài, chiều rộng, chiều cao và giá trị bảo hiểm. Giá trị bảo hiểm được giới hạn tối đa `5.000.000đ` để tránh phí bảo hiểm chênh lệch khi giỏ hàng có giá trị cao.
- GHN nhận trực tiếp cân nặng, kích thước và giá trị bảo hiểm theo payload API của hãng. API báo giá GHTK chỉ nhận trường `weight`, vì vậy backend quy đổi kích thước sang trọng lượng thể tích rồi gửi trọng lượng tính cước cho GHTK. Công thức áp dụng: `ceil(dài × rộng × cao × 1000 / 5000)` (gram); trọng lượng tính cước là giá trị lớn hơn giữa cân nặng thực tế và trọng lượng thể tích.
- Kiểm tra trực tiếp qua backend ngày 2026-09-01, với kiện mẫu 500g, khai giá `5.000.000đ`, giao nội thành TP.HCM, đã nhận phản hồi hợp lệ: GHN `46.001đ`, GHTK `48.397đ`. Chênh lệch nhỏ là bình thường vì mỗi hãng có bảng giá, phụ phí và chính sách hợp đồng riêng.

### Tóm tắt cho báo cáo

Hệ thống báo giá vận chuyển tại trang Checkout được đồng bộ dữ liệu đầu vào giữa GHN và GHTK, bao gồm cân nặng, kích thước kiện hàng (dài, rộng, cao) và giá trị bảo hiểm. GHN sử dụng trực tiếp toàn bộ thông số theo API của hãng. Do API báo giá GHTK không nhận kích thước riêng lẻ, hệ thống quy đổi kích thước thành trọng lượng thể tích với công thức `ceil(dài × rộng × cao × 1000 / 5000)` gram và chọn giá trị lớn hơn giữa trọng lượng thực tế và trọng lượng thể tích làm trọng lượng tính cước. Nhờ đó, các kiện hàng cồng kềnh được tính phí nhất quán theo đặc tính vật lý, đồng thời cả hai hãng dùng cùng mức khai giá bảo hiểm tối đa `5.000.000đ`. Mức phí cuối cùng vẫn có thể khác nhau do bảng giá, phụ phí và chính sách riêng của từng đơn vị vận chuyển.

### Điều kiện để phí là giá vận hành thực tế

- GHN đang lấy hàng từ district `1442`, ward `21211` trong `CheckoutPage.tsx`. Cần thay bằng district/ward đúng của kho trước khi triển khai.
- GHTK dùng `GHTK_PICK_PROVINCE` và `GHTK_PICK_DISTRICT`; nếu không đặt, hệ thống mặc định `TP. Hồ Chí Minh / Quận 1`. Cần cấu hình đúng địa chỉ kho lấy hàng.
- GHTK được gửi trọng lượng tính cước sau quy đổi thể tích; cần xác nhận hệ số quy đổi `5000` phù hợp với hợp đồng GHTK khi triển khai production.
- Khi API GHTK lỗi, giao diện đang hiển thị giá dự phòng `30.000đ`. Giá này không phải báo giá hãng; kiểm tra console hoặc Network trước khi xác nhận đơn.

### Lấy bảng giá theo hợp đồng

1. Đăng nhập cổng khách hàng GHN và GHTK bằng đúng tài khoản cấp token API.
2. Xem mục `Bảng giá`, `Chính sách giá`, hoặc yêu cầu nhân viên kinh doanh cung cấp bảng giá theo hợp đồng/tài khoản.
3. Đối chiếu tuyến giao, địa chỉ kho, COD, khai giá/bảo hiểm, phụ phí vùng xa và quy tắc trọng lượng quy đổi với payload API.
4. Dùng API báo giá động ở checkout làm nguồn phí thu khách; bảng giá chỉ dùng để kiểm tra và giải thích chênh lệch.

---

## 6. Custom API Routes (Backend)

Tất cả routes trong `src/api/store/`:

| Method     | Endpoint                           | Chức năng                                                          |
| ---------- | ---------------------------------- | ------------------------------------------------------------------ |
| `POST`     | `/store/checkout`                  | Tạo đơn hàng, trừ tồn kho, tạo payment collection, build VNPAY URL |
| `GET`      | `/store/payment/vnpay/ipn`         | IPN callback từ VNPAY (xác nhận giao dịch server-to-server)        |
| `POST`     | `/store/payment/vnpay/ipn`         | IPN callback từ VNPAY                                              |
| `GET/POST` | `/store/ghn/fee`                   | Tính phí vận chuyển GHN                                            |
| `POST`     | `/store/ghtk/fee`                  | Tính phí vận chuyển GHTK                                           |
| `GET/POST` | `/store/ghn/soc`                   | Tạo đơn vận chuyển GHN                                             |
| `GET/POST` | `/store/orders/:id/cancel`         | Hủy đơn hàng, hoàn trả tồn kho                                     |
| `GET/POST` | `/store/wallet`                    | Quản lý ví điện tử                                                 |
| `GET/POST` | `/store/reviews`                   | Đánh giá sản phẩm                                                  |
| `GET/POST` | `/store/recommendations`           | Gợi ý sản phẩm (AI Gemini)                                         |
| `GET/POST` | `/store/interactions`              | Lịch sử xem/tương tác sản phẩm                                     |
| `POST`     | `/store/custom/profile`            | Cập nhật hồ sơ khách hàng                                          |
| `POST`     | `/store/custom/upload-avatar`      | Upload ảnh đại diện                                                |
| `POST`     | `/store/custom/change-password`    | Đổi mật khẩu                                                       |
| `GET`      | `/store/custom/auth-identity`      | Lấy metadata OAuth, liên kết customer và cấp token customer        |
| `POST`     | `/store/orders/:id/request-return` | Khách gửi lý do trả hàng và phương thức hoàn tiền                  |
| `POST`     | `/admin/orders/:id/approve-return` | Admin duyệt trả hàng, xử lý hoàn tiền và gửi email SendGrid        |

---

## 7. Custom Modules (Backend)

Trong `src/modules/`:

| Module             | Chức năng                                     |
| ------------------ | --------------------------------------------- |
| `wallet`           | Ví điện tử — quản lý số dư, lịch sử giao dịch |
| `payment-vnpay`    | VNPAY payment provider tích hợp Medusa v2     |
| `ghn-fulfillment`  | GHN Fulfillment provider                      |
| `ghtk-fulfillment` | GHTK fulfillment provider và tính phí chuẩn   |
| `auth-providers`   | Facebook OAuth provider tùy chỉnh             |
| `recommendation`   | Gợi ý sản phẩm dựa trên hành vi               |
| `shipping`         | Tính phí ship nội bộ                          |

---

## 8. Luồng thanh toán VNPAY

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

## 9.1. Trả hàng, hoàn tiền và email thông báo

1. Khách mở đơn hàng tại `/account`, gửi `POST /store/orders/:id/request-return` với lý do, thông tin nhận hoàn và lựa chọn `wallet` hoặc `bank_transfer`.
2. API chỉ cho phép customer sở hữu đơn hàng tạo yêu cầu, sau đó lưu trạng thái trong `order.metadata`.
3. Admin mở chi tiết đơn tại Medusa Admin và gọi `POST /admin/orders/:id/approve-return`.
4. Với `wallet`, backend cộng tiền ngay vào Sprylo Wallet bằng `WalletModuleService.addBalance`, ghi transaction loại `refund` và đặt `refund_status=completed`.
5. Với `bank_transfer`, backend lưu `refund_status=bank_transfer_pending`. Nhân viên vẫn phải chuyển khoản thật theo thông tin khách đã cung cấp; SendGrid không thực hiện giao dịch ngân hàng.
6. Sau khi xử lý, backend gửi SendGrid Dynamic Template với các biến `customer_name`, `order_display_id`, `refund_amount_formatted`, `refund_info`, `return_reason`, `support_email`, `is_wallet`, `is_bank_transfer`.

Yêu cầu hoàn tiền có `refund_id` để tránh duyệt/hoàn tiền trùng lặp. Nếu SendGrid chưa cấu hình hoặc gửi lỗi, kết quả hoàn tiền đã ghi vẫn không bị đảo ngược; log backend sẽ ghi nguyên nhân không gửi được email.

---

## 9. Phương thức thanh toán được hỗ trợ

| Phương thức                    | Trạng thái             | Ghi chú                             |
| ------------------------------ | ---------------------- | ----------------------------------- |
| COD (Thanh toán khi nhận hàng) | ✅ Hoạt động           | `payment_status = pending`          |
| VNPAY                          | ✅ Hoạt động (sandbox) | Cần credentials thật khi production |
| Ví điện tử (Sprylo Wallet)     | ✅ Hoạt động           | Tích hợp với module wallet nội bộ   |
| MoMo                           | 🔧 Placeholder         | Chưa tích hợp thật                  |
| ZaloPay                        | 🔧 Placeholder         | Chưa tích hợp thật                  |

---

## 10. Tính năng đã hoàn thiện

- [x] Xác thực người dùng: Đăng ký, Đăng nhập, Quên/Đặt lại mật khẩu
- [x] OAuth: Google Login
- [x] OAuth: Facebook Login (đã nạp biến môi trường và xác nhận endpoint tạo OAuth URL dùng Meta App ID)
- [x] Danh sách & lọc sản phẩm (theo danh mục, giá, rating)
- [x] Chi tiết sản phẩm + gallery ảnh
- [x] Giỏ hàng (LocalStorage)
- [x] Checkout đầy đủ: địa chỉ, phương thức ship, phương thức thanh toán
- [x] Tích hợp GHN (tính phí ship, tạo đơn)
- [x] Tích hợp GHTK tính phí ship theo API báo giá
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

## 11. Những việc chưa hoàn thành / Cần làm tiếp

### Ưu tiên cao

- [ ] **Email thật:** Thay `RESEND_API_KEY` bằng key thật để gửi email xác nhận đơn hàng, quên mật khẩu
- [ ] **VNPAY Production:** Khi go-live, thay `VNPAY_HOST`, `VNPAY_TMN_CODE`, `VNPAY_SECURE_SECRET` bằng credentials production và bỏ `testMode: true`
- [ ] **Cấu hình kho vận chuyển thực:** Điền `GHTK_PICK_PROVINCE`, `GHTK_PICK_DISTRICT` và thay district/ward GHN hard-code bằng địa chỉ kho thực tế.

### Ưu tiên trung bình

- [ ] **MoMo / ZaloPay:** Tích hợp thật thay cho placeholder hiện tại
- [ ] **IPN VNPAY qua ngrok/server public:** Để test đồng bộ payment_status đầy đủ trong môi trường dev
- [ ] **GHN Production:** Chuyển từ sandbox sang production khi go-live
- [ ] **GHTK tạo đơn và webhook:** Luồng tạo đơn GHTK trong trạng thái đơn hàng hiện còn mock; cần gọi API tạo đơn thật và bổ sung webhook cập nhật trạng thái.

### Ưu tiên thấp

- [ ] SEO: meta tags, sitemap
- [ ] PWA support
- [ ] Tối ưu hiệu suất: lazy loading ảnh, code splitting

---

## 12. Troubleshooting thường gặp

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

### Phí GHTK hiển thị đúng 30.000đ

- Đây là giá dự phòng khi API GHTK không trả về `fee.fee`, không phải bảng giá hãng.
- Kiểm tra `GHTK_API_TOKEN`, địa chỉ lấy/giao, log `[GHTK Fee]` và phản hồi của `POST /store/ghtk/fee`.

### Phí GHN/GHTK không khớp bảng giá mong đợi

- Xác nhận kho lấy hàng, tuyến giao, khối lượng, kích thước, COD và khai giá gửi đến hai API.
- Bảng giá công khai có thể khác bảng giá áp dụng cho tài khoản/hợp đồng API.

---

## 13. Thông tin tài khoản dịch vụ

| Dịch vụ              | Ghi chú                                    |
| -------------------- | ------------------------------------------ |
| Supabase             | Project ID: `yumyjivpmdwkpdvrnurh`         |
| GHN                  | Sandbox — khachhang.ghn.vn                 |
| VNPAY Sandbox        | TMN Code: `ALPIZLIR`                       |
| Google Cloud Console | Client ID đã cấu hình OAuth consent screen |
| Resend               | Cần thay API key thật trước khi gửi email  |

*Ghi chú: Tài liệu này cần được cập nhật liên tục trong quá trình fix bug và hoàn thiện tính năng.*
