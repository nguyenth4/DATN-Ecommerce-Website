# LUỒNG THANH TOÁN (VNPAY & ZALOPAY)
*Tài liệu tóm tắt các bước xử lý thanh toán cơ bản dành cho nhóm trình bày.*

## 1. QUÁ TRÌNH ĐẶT HÀNG
- **Bước 1:** Khách hàng chốt giỏ hàng, chọn phương thức VNPay hoặc ZaloPay và bấm "Đặt hàng".
- **Bước 2:** Hệ thống tạo và lưu đơn hàng ở trạng thái "Chờ thanh toán" (Pending).
- **Bước 3:** Hệ thống giao tiếp với cổng thanh toán để tạo ra một đường dẫn (URL) thanh toán bảo mật.
- **Bước 4:** Website tự động chuyển hướng người dùng sang màn hình thanh toán chính thức của VNPay hoặc ZaloPay.

## 2. QUÁ TRÌNH THANH TOÁN & DUYỆT ĐƠN TỰ ĐỘNG
- **Bước 5:** Khách hàng dùng ứng dụng điện thoại quét mã QR hoặc nhập thẻ để thanh toán.
- **Bước 6:** Ngay khi thanh toán thành công, cổng VNPay/ZaloPay lập tức bắn tín hiệu xác nhận (Callback/Webhook) ngầm về cho hệ thống của chúng ta.
- **Bước 7:** Hệ thống nhận được xác nhận, tự động chuyển đơn hàng sang trạng thái "Đã thanh toán" (Paid).
- **Bước 8:** Hệ thống kích hoạt các tác vụ tự động: gửi Email hóa đơn cho khách, xóa giỏ hàng và chuyển khách về trang "Đặt hàng thành công".

---

## 3. DÒNG TIỀN SẼ ĐI VỀ ĐÂU?
- **Khi bảo vệ đồ án (Môi trường Test):** Tiền trong thẻ thanh toán là tiền ảo do hệ thống cấp để kiểm thử luồng chạy. Không có giao dịch tài chính thật diễn ra.
- **Khi kinh doanh thực tế (Môi trường Thật):** Tiền thật của khách sẽ được VNPay/ZaloPay thu hộ và giữ trên hệ thống của họ. Định kỳ (ví dụ: qua ngày hôm sau), cổng thanh toán sẽ đối soát và chuyển khoản toàn bộ doanh thu về **tài khoản ngân hàng thật của chủ website**, sau khi trừ một khoản phí dịch vụ nhỏ.
