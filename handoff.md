# Handoff Document - VNPAY Integration

## Tóm tắt công việc đã thực hiện
- Đã cài đặt và tích hợp module thanh toán `payment-vnpay` (sử dụng package `vnpay` chính thức) vào Medusa v2.
- Đã khắc phục các lỗi liên quan đến tương thích chuẩn ESM/CJS trong service provider và điều chỉnh cấu trúc trả về đúng interface của Medusa v2.
- Đã thiết lập route IPN webhook tại `src/api/store/payment/vnpay/ipn/route.ts` để nhận phản hồi từ VNPAY và cập nhật trạng thái đơn hàng.
- Đã cập nhật file `.env` ở backend với thông tin Merchant Sandbox thực tế do bạn cung cấp (`VNPAY_TMN_CODE`, `VNPAY_SECURE_SECRET`) và chuẩn hóa `VNPAY_RETURN_URL` (`http://localhost:5174/checkout/vnpay_return`).
- Đã đảm bảo file cấu hình `medusa-config.ts` có chứa `payment-vnpay` ở mục `modules.payment.options.providers`.

## Các bước tiếp theo (Dành cho bạn)
1. **Khởi động lại Backend**: Do đã thay đổi `.env`, bạn cần phải restart lại terminal chạy backend để hệ thống nhận được cấu hình mới.
2. **Kích hoạt VNPAY trong Medusa Admin**:
   - Đăng nhập vào trang Admin của Medusa (thường là `http://localhost:9000/app`).
   - Vào **Settings** (Cài đặt) > **Regions** (Khu vực) > Chọn khu vực hiện tại (vd: Vietnam).
   - Ở mục **Payment Providers**, tích chọn **`vnpay`** và bấm **Save**.
3. **Chạy kiểm thử thanh toán (Test Transaction)**:
   - Truy cập trang web bán hàng (Frontend: `http://localhost:5174` hoặc port đang chạy).
   - Đặt hàng một sản phẩm và chọn phương thức thanh toán là **VNPAY**.
   - Tại màn hình giả lập của VNPAY, nhập thông tin thẻ test NCB (`9704198526191432198`, Tên: `NGUYEN VAN A`, Ngày phát hành: `07/15`, OTP: `123456`).
4. **Kiểm tra kết quả**:
   - Trang có chuyển hướng về giao diện thành công của web bạn không? (Frontend `/checkout/vnpay_return`).
   - Đơn hàng trong hệ thống có cập nhật trạng thái `payment_status` thành "Đã thanh toán" (Captured/Authorized) không?

## Ghi chú
- Nếu có lỗi xảy ra ở màn hình thanh toán VNPAY (vd: Invalid Signature), hãy kiểm tra lại xem mật khẩu `VNPAY_SECURE_SECRET` hoặc mã `VNPAY_TMN_CODE` có copy dư khoảng trắng nào không.
- Nếu bạn thấy lỗi liên quan đến Database Timeout, hãy chắc chắn Supabase hoặc Postgres cục bộ đang hoạt động ổn định.
