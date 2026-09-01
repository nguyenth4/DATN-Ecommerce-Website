# Kế hoạch Triển khai Chức năng Hoàn tiền (Refund)

Tài liệu này phác thảo kế hoạch và quy trình thực hiện chức năng **Hoàn tiền (Refund)** cho các đơn hàng đã thanh toán qua cổng thanh toán VNPay và ZaloPay. Chức năng này dành cho Quản trị viên (Admin) hoặc tự động kích hoạt khi có yêu cầu huỷ đơn hợp lệ.

---

## 1. Quy trình Nghiệp vụ (Business Flow)

1. **Kích hoạt hoàn tiền**: 
   - Admin vào chi tiết đơn hàng đã thanh toán thành công (Trạng thái thanh toán: `paid`).
   - Admin bấm nút **"Hoàn tiền"** (có thể chọn hoàn toàn bộ hoặc một phần).
   - *Tuỳ chọn*: Khách hàng ấn "Huỷ đơn" trên giao diện của khách (nếu đơn hàng chưa được giao cho đơn vị vận chuyển).

2. **Xử lý Backend**:
   - Backend kiểm tra cổng thanh toán của đơn hàng (ZaloPay hay VNPay).
   - Backend gọi API hoàn tiền tương ứng của đối tác thanh toán.
   - Nhận kết quả trả về từ đối tác (Thành công / Thất bại).

3. **Cập nhật Database**:
   - Nếu đối tác trả về "Thành công", cập nhật trạng thái thanh toán của đơn hàng thành `refunded`.
   - Cập nhật lịch sử giao dịch (Transaction History) lưu lại mã giao dịch hoàn tiền.

4. **Thông báo**:
   - Gửi email thông báo cho khách hàng về việc tiền đang được hoàn lại.

---

## 2. Các thay đổi về mặt Kỹ thuật (Technical Plan)

### A. Tích hợp API Đối tác (VNPay & ZaloPay)

#### 1. Hoàn tiền VNPay
- **Endpoint**: `https://sandbox.vnpayment.vn/merchant_webapi/api/transaction`
- **Phương thức**: POST
- **Dữ liệu cần gửi**:
  - `vnp_RequestId`: Mã yêu cầu hoàn tiền (Tạo random).
  - `vnp_Version`: `2.1.0`
  - `vnp_Command`: `refund`
  - `vnp_TransactionType`: `02` (Hoàn toàn phần) hoặc `03` (Hoàn một phần).
  - `vnp_TxnRef`: Mã đơn hàng của chúng ta (app_trans_id cũ).
  - `vnp_Amount`: Số tiền cần hoàn (x100).
  - `vnp_TransactionNo`: Mã giao dịch VNPay đã ghi nhận trước đó.
  - `vnp_TransactionDate`: Thời gian tạo giao dịch gốc.
  - `vnp_CreateBy`: Tên người tạo yêu cầu (Admin).
  - `vnp_SecureHash`: Chữ ký bảo mật (SHA512).

#### 2. Hoàn tiền ZaloPay
- **Endpoint**: `https://sb-openapi.zalopay.vn/v2/refund`
- **Phương thức**: POST
- **Dữ liệu cần gửi**:
  - `app_id`: Mã ứng dụng.
  - `m_refund_id`: Mã hoàn tiền (Định dạng: `YYMMDD_app_id_randomString`).
  - `zp_trans_id`: Mã giao dịch ZaloPay trả về lúc thanh toán thành công.
  - `amount`: Số tiền hoàn.
  - `timestamp`: Thời gian hiện tại.
  - `description`: Lý do hoàn tiền.
  - `mac`: Chữ ký bảo mật (HMAC SHA256).

### B. Thay đổi Backend (MedusaJS)

- **Database**:
  - Cần đảm bảo lúc thanh toán thành công, chúng ta đã lưu lại `vnp_TransactionNo` (VNPay) và `zp_trans_id` (ZaloPay) vào `metadata` của Order, vì đây là dữ liệu bắt buộc để gọi API hoàn tiền.
  
- **API Routes**:
  - Tạo Endpoint mới cho Admin: `POST /api/admin/orders/:id/refund`
  - Controller này sẽ đọc thông tin đơn hàng, xác định phương thức thanh toán, và gọi Service tương ứng (`vnpay.service.ts` hoặc `zalopay.service.ts`).

### C. Thay đổi Frontend (React Admin & Client)

- **Admin Dashboard**:
  - Thêm một nút **"Refund" (Hoàn tiền)** ở màn hình Chi tiết đơn hàng (Chỉ hiển thị khi đơn hàng đã thanh toán).
  - Hiển thị Popup xác nhận hoàn tiền (nhập lý do hoàn tiền).
  - Xử lý Loading state trong lúc đợi API đối tác trả về.

- **Client App (Người dùng)**:
  - Cập nhật giao diện Lịch sử đơn hàng: Hiển thị trạng thái "Đã hoàn tiền" nếu `payment_status` là `refunded`.
  - Nút "Huỷ đơn" (nếu khách tự huỷ) cần có thông báo giải thích: "Tiền sẽ được hoàn về tài khoản của bạn trong vòng 3-5 ngày làm việc".

---

## 3. Các Rủi ro và Lưu ý (Risk & Edge Cases)

1. **Hoàn tiền thất bại từ phía Ngân hàng**: API đối tác có thể trả về lỗi (do thẻ khách bị khoá, hoặc lỗi hệ thống ngân hàng). Backend cần lưu trạng thái lỗi và cho phép Admin "Thử lại" (Retry).
2. **Idempotency (Tránh hoàn tiền 2 lần)**: Phải đảm bảo nếu Admin bấm nút 2 lần, hệ thống không gọi API hoàn tiền 2 lần. Phải check trạng thái trước khi thực hiện.
3. **Môi trường Sandbox**: Các API hoàn tiền ở môi trường Sandbox của VNPay/ZaloPay đôi khi hoạt động không ổn định hoặc có thời gian delay.
