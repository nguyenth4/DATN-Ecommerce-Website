# Bàn giao: Tự động hóa Vận đơn & Đồng bộ Phí Vận chuyển Đối tác (GHN/GHTK)

Tài liệu này tóm tắt các chỉnh sửa cụ thể để tự động hóa quy trình giao hàng, đồng bộ hóa phí vận chuyển thực tế từ checkout và khắc phục lỗi hiển thị mã vận đơn đối với các đơn hàng lịch sử.

---

## 1. Tổng quan Mục tiêu
* **Loại bỏ chọn thủ công**: Admin không cần lựa chọn nhà vận chuyển khi chuyển trạng thái sang "Đang vận chuyển". Hệ thống tự xác định GHN hoặc GHTK dựa trên thông tin khách hàng đặt lúc checkout.
* **Đồng bộ phí vận chuyển thực tế**: Loại bỏ phí cứng giả lập (`30,000 đ` của GHTK và `0` của GHN) ở trang quản trị, thay vào đó hiển thị đúng số tiền thực tế khách đã trả.
* **Khắc phục lỗi hiển thị vận đơn GHN**: Hiển thị đầy đủ hộp thông tin vận chuyển của đơn hàng GHN trên Dashboard admin.

---

## 2. Chi tiết các Chỉnh sửa

### A. Tự động hóa kích hoạt Vận chuyển (Backend)
* **Tệp tin**: `medusa-backend/backend/apps/backend/src/api/admin/orders/controller.ts`
* **Cách sửa**: 
  * Cập nhật hàm `updateOrderStatus` tự động lấy thông tin nhà vận chuyển từ `order.metadata.shipping_method` để gọi service tương ứng (`createGhnShipping` hoặc `createGhtkShipping`).
  * Đồng thời ghi nhận hoạt động (timeline) trên admin hiển thị đúng tên đối tác vận chuyển thay vì nội dung mặc định chung chung.

### B. Đồng bộ Phí giao hàng đối tác thực tế (Backend Services)
* **Tệp tin**:
  * `medusa-backend/backend/apps/backend/src/api/admin/shipping/ghtk/service.ts`
  * `medusa-backend/backend/apps/backend/src/api/admin/shipping/ghn/service.ts`
* **Cách sửa**:
  * Đọc phí vận chuyển đã tính toán từ bước thanh toán lưu trong `order.metadata.shipping_fee`.
  * Trả về phí này cho hệ thống thay vì các giá trị mock cứng, giúp thông tin thanh toán đồng nhất giữa storefront và admin dashboard.
  * Đối với **GHN**, thêm cơ chế fallback tự lấy `order_code` làm mã vận đơn (`trackingNumber`) nếu API của GHN không trả về trường nhãn vận đơn `label` (lỗi thường gặp trên môi trường test/sandbox).

### C. Đồng nhất giao diện nút bấm Admin (Frontend & Admin UI)
* **Tệp tin**:
  * `medusa-backend/backend/apps/backend/src/admin/widgets/custom-order-widget.tsx`
  * `src/custom-admin/widgets/OrdersWidget.tsx`
  * `src/client/pages/AdminOrdersPage.tsx`
* **Cách sửa**:
  * Gỡ bỏ hoàn toàn việc hiển thị đồng thời cả 2 nút bấm `Giao (GHN)` và `Giao (GHTK)`.
  * Thay thế bằng một nút bấm thông minh duy nhất hiển thị tên đơn vị vận chuyển mà khách đã chọn (Ví dụ: `Giao hàng (GHN)` hoặc `Giao hàng (GHTK)`).

### D. Khắc phục hiển thị hộp thông tin giao hàng GHN (Admin Widget)
* **Tệp tin**: `medusa-backend/backend/apps/backend/src/admin/widgets/custom-order-widget.tsx`
* **Cách sửa**:
  * Điều chỉnh điều kiện hiển thị hộp màu xanh chứa thông tin vận đơn: Chỉ cần có mã đơn giao hàng `meta.shipping_order_id` hoặc mã vận đơn `meta.tracking_number` thì hộp thông tin sẽ hiển thị.
  * Hiển thị mã vận đơn bằng `meta.tracking_number || meta.shipping_order_id`.

### E. Đồng bộ hóa dữ liệu lịch sử trong Cơ sở dữ liệu (Database Sync)
* **Thực hiện**: Đã chạy một script Node.js kết nối trực tiếp vào PostgreSQL (Supabase) để cập nhật dữ liệu lịch sử cho **67 đơn hàng**.
* **Kết quả trong DB**:
  * Cập nhật đúng phí vận chuyển thực tế từ checkout vào trường `shipping_fee` của metadata.
  * Tự động điền mã đơn giao hàng `shipping_order_id` vào `tracking_number` đối với các đơn hàng GHN lịch sử bị khuyết mã vận đơn.
  * Các đơn hàng cũ như **#71**, **#74**, **#78**... giờ đây đều hiển thị chuẩn xác thông tin trên giao diện.

---

## 3. Xác minh hoạt động
1. **Đơn hàng cũ**: Truy cập chi tiết các đơn hàng lịch sử (ví dụ: **#71** và **#74**), hộp thông tin màu xanh hiển thị đầy đủ tên nhà vận chuyển, mã vận đơn tương ứng và phí giao hàng chuẩn xác (không còn bị ẩn hay hiển thị cứng `30,000 đ`).
2. **Đơn hàng mới**: Thực hiện tạo đơn hàng mới ngoài storefront, lựa chọn một nhà vận chuyển và thanh toán. Khi vào Admin xác nhận trạng thái đơn hàng và chuyển sang "Giao hàng", hệ thống sẽ tự động kích hoạt tạo vận đơn với đối tác đã chọn mà không cần admin chọn thủ công, phí vận chuyển đối tác được lưu khớp 100% với số tiền khách đã thanh toán.
