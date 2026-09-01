# Hoàn Tiền (Refund) Feature Implementation Plan

## Mục tiêu
Thêm chức năng hoàn tiền (refund) cho đơn hàng trong hệ thống Medusa, cho phép nhân viên admin thực hiện hoàn tiền cho các đơn đã thanh toán qua ZaloPay (và các nhà cung cấp khác trong tương lai) và cập nhật trạng thái đơn hàng.

## Yêu cầu người dùng xem lại
> [!IMPORTANT]
> - Xác nhận rằng endpoint API chỉ dành cho **admin** và sẽ không mở cho người dùng thường.
> - Xác nhận các nhà cung cấp thanh toán cần hỗ trợ ngay bây giờ (hiện tại chỉ ZaloPay hay muốn mở rộng?).
> - Xác nhận cách tính tiền hoàn: toàn bộ số tiền đơn hàng hay cho phép hoàn một phần (có truyền `amount` trong body không?).
> - Xác nhận các quy tắc kinh doanh: chỉ cho phép hoàn tiền khi trạng thái đơn là `paid`? Có lưu log audit chi tiết không?

## Câu hỏi cần làm rõ
> [!WARNING]
> 1. **Nhà cung cấp**: Chỉ ZaloPay hay cần hỗ trợ MoMo, VNPay,...?
> 2. **Số tiền hoàn**: Toàn bộ hay có hỗ trợ partial refund?
> 3. **Luật kinh doanh**: Hoàn tiền chỉ cho các đơn `paid` hay có trường hợp khác?
> 4. **Biến môi trường**: Các key ZaloPay refund (`ZALOPAY_REFUND_URL`, `ZALOPAY_APP_ID`, `ZALOPAY_APP_SECRET`) đã có trong `.env.template` chưa? Cần placeholder?
> 5. **Giao diện admin**: Nút “Hoàn tiền” sẽ xuất hiện ở đâu? (trong `OrdersWidget.tsx` hay chi tiết đơn hàng?)

## Các thay đổi dự kiến
### 1. Backend – Route API & Service
- **Tạo file mới** `medusa-backend/backend/apps/backend/src/api/admin/orders/[id]/refund/route.ts`
  - POST `/admin/orders/:id/refund`
  - Kiểm tra quyền admin, lấy order, chắc chắn trạng thái `paid`.
  - Gọi `refundService.refundOrder(order)`.
  - Cập nhật `order.status = 'refunded'`, lưu `refund_id`, `refund_at`.
  - Trả về `{ success: true, refundId }`.
- **Tạo service** `medusa-backend/backend/apps/backend/src/services/refund.service.ts`
  - `refundOrder(order: Order): Promise<{ refundId: string }>`
  - Dựa vào `order.payment_method` để gọi hàm provider tương ứng (hiện tại chỉ ZaloPay).
- **Helper ZaloPay** `medusa-backend/backend/apps/backend/src/utils/zalopayRefund.ts`
  - Xây dựng payload, tính MAC, gọi API ZaloPay refund (`https://sandbox.zalopay.com.vn/v2/refund`).
  - Xử lý response, trả về `refund_id` nếu thành công.
- **Thêm unit test** `medusa-backend/backend/apps/backend/src/api/admin/orders/[id]/refund/route.test.ts`.
- **Cập nhật `.env.template`**
  - Thêm `ZALOPAY_REFUND_URL`, `ZALOPAY_APP_ID`, `ZALOPAY_APP_SECRET` (để developer fill).
- **Bảo mật**: Sử dụng middleware `isAdmin` hiện có để bảo vệ route.

### 2. Cơ sở dữ liệu – mở rộng model Order
- **File** `medusa-backend/backend/apps/backend/src/models/order.ts`
  - Thêm trường tùy chọn: `refund_id?: string`, `refund_at?: Date`, `refund_reason?: string`.
- **Migration** (nếu dùng ORM) – tạo migration script để thêm các cột trên vào bảng `order`.

### 3. Giao diện admin – Nút Hoàn tiền
- **File** `medusa-backend/apps/backend/src/admin/widgets/OrdersWidget.tsx`
  - Khi `order.status === 'paid'` hiển thị nút `Hoàn tiền`.
  - Khi click → hiện modal xác nhận, gửi POST tới `/admin/orders/{id}/refund`.
  - Disable nút khi đang chờ response, hiển thị toast thành công hoặc lỗi.
- **Thêm test UI** `OrdersWidget.test.tsx` để kiểm tra hiển thị và hành vi.
- **Styling**: Tuân thủ thiết kế hiện có (glassmorphism, gradient…) để giữ giao diện “premium”.

### 4. Logging & Auditing
- Ghi log `refund` chi tiết (orderId, refundId, amount, response code) trong file logger hiện có.
- Trả về lỗi chi tiết (400/500) nếu ZaloPay trả về lỗi.

### 5. Tài liệu
- **Cập nhật** `KE_HOACH_HOAN_TIEN.md` (đang mở) với mô tả API, cách cấu hình env, hướng dẫn admin sử dụng.
- **Cập nhật** `README.md` (hoặc tài liệu dev) thêm mục “Refund workflow”.

## Kế hoạch kiểm thử
### Kiểm thử tự động
- Chạy toàn bộ test (`npm test`).
- Đảm bảo các kịch bản: 
  1. Người không phải admin → 403.
  2. Đơn không ở trạng thái `paid` → 400.
  3. Gọi ZaloPay mock thành công → trạng thái đổi thành `refunded`, trường `refund_id` được lưu.
### Kiểm thử thủ công
1. **Chuẩn bị môi trường:**
   - Điền các biến môi trường ZaloPay refund vào `.env`.
   - Restart backend (`npm run dev`).
2. **Tạo đơn thanh toán ZaloPay** thành công.
3. **Mở Admin UI**, tìm đơn trong `OrdersWidget`, nhấn “Hoàn tiền”.
4. **Xác nhận** modal, quan sát toast thành công, và kiểm tra trạng thái đơn đổi thành `refunded`.
5. **Kiểm tra DB** (qua admin panel hoặc query) rằng `refund_id` và `refund_at` được lưu.
6. **Kiểm tra log** để thấy entry refund.

## Kế hoạch triển khai
1. **Nhánh** `feature/refund` từ `develop`.
2. Thực hiện các thay đổi trên, commit từng bước (sẽ tạo commit message chi tiết).
3. Pull request, review code, chạy CI.
4. Merge vào `develop`, triển khai lên staging, thực hiện kiểm thử thủ công.
5. Khi mọi thứ ổn, deploy lên production.

---
**Bước tiếp theo**: Vui lòng trả lời các câu hỏi ở mục *Câu hỏi cần làm rõ* để tôi có thể tiến hành triển khai.
