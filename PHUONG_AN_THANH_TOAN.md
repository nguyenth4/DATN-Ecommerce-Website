# CÁC PHƯƠNG ÁN TÍCH HỢP THANH TOÁN CHO ĐỒ ÁN TỐT NGHIỆP (DATN)

Do đặc thù Đồ án tốt nghiệp (DATN), nhóm không có giấy phép kinh doanh để đăng ký tài khoản Merchant chính thức của VNPay/ZaloPay. Tuy nhiên, nhóm vẫn muốn thực hiện chức năng thanh toán và có thể **nhận tiền thật về tài khoản ngân hàng cá nhân** để trình bày.

Dưới đây là 3 phương án để nhóm thảo luận và lựa chọn triển khai:

---

## PHƯƠNG ÁN 1: Tích hợp cổng PayOS (Khuyên dùng - Điểm cao, tự động hóa)
PayOS là một cổng thanh toán trung gian hiện đang rất phổ biến cho sinh viên và cá nhân bán hàng nhỏ lẻ.

- **Cách hoạt động:** Khi người dùng chọn thanh toán, hệ thống sẽ hiển thị một mã QR động. Khách hàng dùng bất kỳ app ngân hàng nào quét mã QR này, tiền thật sẽ được chuyển thẳng vào **Tài khoản ngân hàng cá nhân** của một thành viên trong nhóm.
- **Tính tự động (Webhook/IPN):** Ngay khi tiền vừa vào tài khoản, PayOS sẽ lập tức "bắn" một tín hiệu (Webhook) về Server (Backend) của hệ thống. Server sẽ tự động cập nhật trạng thái đơn hàng thành `Đã thanh toán`.
- **Ưu điểm:** 
  - Đăng ký bằng CCCD cá nhân, duyệt tài khoản nhanh chóng.
  - Luồng thanh toán chuẩn chỉ, tự động 100% giống hệt VNPay thật. Tiền là tiền thật.
  - Có thư viện API dễ tích hợp, phù hợp để demo lấy điểm cao kỹ thuật.

---

## PHƯƠNG ÁN 2: Dùng VNPay / ZaloPay Sandbox (Đúng kỹ thuật công nghệ)
Nếu giảng viên yêu cầu bắt buộc phải dùng các cổng thanh toán lớn (VNPay, ZaloPay, MoMo) để đúng với mô hình doanh nghiệp lớn.

- **Cách hoạt động:** Tích hợp API của VNPay/ZaloPay nhưng sử dụng các mã API Key của môi trường **Sandbox (Thử nghiệm)**. 
- **Khi Demo:** Nhóm sẽ sử dụng thông tin "Thẻ ngân hàng ảo" (do VNPay cung cấp) hoặc tải app "ZaloPay Sandbox" để thanh toán. 
- **Ưu điểm:** Chứng minh được nhóm có khả năng đọc tài liệu và tích hợp API phức tạp của các tập đoàn lớn (có mã hóa chữ ký điện tử, xử lý bảo mật).
- **Nhược điểm:** Đây là tiền ảo (môi trường test), không dùng tiền thật và tài khoản thật được. 

---

## PHƯƠNG ÁN 3: Tạo mã VietQR cá nhân (Đơn giản, làm thủ công)
Đây là cách dễ và nhanh nhất nếu nhóm không có nhiều thời gian code phần thanh toán.

- **Cách hoạt động:** Dùng API miễn phí (như `vietqr.io`) để tự động render ra một tấm ảnh QR Code. Mã QR này chứa thông tin: Số TK ngân hàng cá nhân của nhóm trưởng + Số tiền đơn hàng + Nội dung là Mã đơn hàng.
- **Tính tự động:** **Không tự động**. Khi khách mua hàng quét mã QR chuyển tiền xong, khách phải tự bấm nút "Tôi đã chuyển khoản". 
- **Quy trình duyệt:** Admin (nhóm) phải mở app ngân hàng trên điện thoại ra check. Thấy báo "Ting ting" tiền vào thì mới đăng nhập vào trang Quản trị (Admin Dashboard) của website để bấm nút xác nhận đơn hàng đã thanh toán.
- **Ưu điểm:** Cực kỳ dễ làm, 30 phút là code xong phần hiển thị QR.
- **Nhược điểm:** Làm thủ công, không có tính năng tự động (Webhook) nên điểm công nghệ sẽ không cao bằng Phương án 1 và 2.

---

**Kết luận & Đề xuất:**
- Nếu nhóm muốn hệ thống chạy **tiền thật + tự động hoàn toàn**: Hãy chọn **Phương án 1 (PayOS)**.
- Nếu thời gian quá gấp rút: Hãy chọn **Phương án 3 (VietQR tĩnh)**.
