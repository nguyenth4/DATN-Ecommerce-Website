# Hướng Dẫn Test Thanh Toán (Sandbox)

Tài liệu này cung cấp thông tin các thẻ ngân hàng dùng để kiểm thử tính năng thanh toán VNPAY và ZaloPay trong môi trường Sandbox (thử nghiệm) cho Đồ án.

**LƯU Ý CHUNG:**
- KHÔNG dùng điện thoại có cài app ngân hàng/ví thật (ZaloPay thật, Momo thật, VCB Digibank...) để quét mã QR trên màn hình Sandbox. Các app thật sẽ báo lỗi "Nhà cung cấp không hợp lệ".
- Luôn chọn phương thức thanh toán bằng **Thẻ ATM / Tài khoản ngân hàng nội địa** hoặc **Thẻ Quốc Tế** trên cổng thanh toán Sandbox và nhập các thông tin thẻ dưới đây.

---

## 1. VNPAY Sandbox

Khi thanh toán bằng VNPAY, chọn phương thức **"Thẻ nội địa và tài khoản ngân hàng"**, sau đó chọn ngân hàng **NCB** và nhập thông tin sau:

- **Ngân hàng:** NCB
- **Số thẻ:** `9704198526191432198`
- **Tên chủ thẻ:** `NGUYEN VAN A`
- **Ngày phát hành:** `07/15`
- **Mã OTP (nếu được hỏi):** `123456`

---

## 2. ZaloPay Sandbox

Khi thanh toán bằng ZaloPay, trên màn hình cổng thanh toán ZaloPay Sandbox, chọn tab **"Thẻ ATM/Tài khoản ngân hàng"** hoặc **"Thẻ quốc tế"** và nhập một trong các thẻ sau:

### Tùy chọn A: Thẻ ATM Nội Địa (Ngân hàng SBI)
- **Số thẻ:** `9704540000000062`
- **Tên chủ thẻ:** `NGUYEN VAN A`
- **Mã OTP (nếu được hỏi):** `111111` hoặc `123456`

### Tùy chọn B: Thẻ Quốc Tế (Visa)
- **Số thẻ:** `4111111111111111`
- **Tên in trên thẻ:** `NGUYEN VAN A`
- **Ngày hết hạn:** `01/25`
- **Mã CVV/CVC:** `123`
- **Mã OTP (nếu được hỏi):** `111111` hoặc `123456`

*(Lưu ý: Nếu vẫn muốn test quy trình quét mã QR của ZaloPay, bạn phải tải app "ZaloPay Sandbox" dành riêng cho Developer, đăng nhập bằng số điện thoại bất kỳ và nhập mã OTP 111111, sau đó dùng app Sandbox này để quét mã QR).*
