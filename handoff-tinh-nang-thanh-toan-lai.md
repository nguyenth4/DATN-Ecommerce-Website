# Handoff - Nhánh `tinh-nang/thanh-toan-lai`

Dưới đây là tổng hợp toàn bộ các công việc và tính năng đã được phát triển/sửa lỗi trong nhánh này:

## 1. Tính Năng "Thanh Toán Lại" (Retry Payment)
Cho phép khách hàng tiếp tục thanh toán đối với các đơn hàng trực tuyến (ZaloPay, VNPay) nếu trước đó họ thoát ra giữa chừng.

* **Backend (`medusa-backend/apps/backend/src/api/store/orders/[id]/payment-link/route.ts`)**:
  * Tạo API mới `POST /store/orders/[id]/payment-link`.
  * API này nhận `orderId`, lấy lại tổng tiền và phương thức thanh toán cũ để sinh ra một đường link thanh toán ZaloPay/VNPay mới.
  * Tái sử dụng lại logic sinh link của `buildZalopayUrl` và mapping `app_trans_id` để callback ZaloPay tự động cập nhật trạng thái đơn hàng khi thanh toán thành công.
* **Frontend (`src/client/pages/AccountPage.tsx`)**:
  * Thêm nút **"Thanh toán lại"** màu xanh cho cả màn hình danh sách đơn hàng và màn hình chi tiết đơn hàng (Modal).
  * Điều kiện hiển thị: Đơn hàng ở trạng thái **Chờ thanh toán** (`payment_status === "awaiting"`), phương thức thanh toán là ZaloPay hoặc VNPay, và đơn chưa bị hủy.
  * Tích hợp xử lý loading khi bấm nút và tự động chuyển hướng khách hàng (redirect) đến cổng thanh toán.

## 2. Quản Lý Đơn Hàng (Admin & Client)
* **Sửa lỗi hiển thị thông tin giao hàng (Client - `AccountPage.tsx`)**:
  * Fix lỗi hiển thị hardcode phần địa chỉ giao hàng trong modal chi tiết đơn. 
  * Hiện tại địa chỉ được lấy đúng từ thông tin khách hàng nhập (`selectedRealOrder.shipping_address`).
* **Sắp xếp thứ tự đơn hàng (Client - `AccountPage.tsx`)**:
  * Sửa logic render danh sách đơn hàng, tự động đưa các đơn hàng mới nhất (dựa vào `created_at`) lên đầu trang.
* **Điều kiện Hủy đơn hàng (Client - `AccountPage.tsx`)**:
  * Cập nhật hàm `getDynamicStatusStep` xét thêm thuộc tính `fulfillment_status`, đảm bảo nút Hủy Đơn bị vô hiệu hóa nếu đơn hàng đã được người bán đóng gói/giao hàng.
* **Chặn hoàn tiền nhiều lần (Admin - `OrdersWidget.tsx`)**:
  * Sửa lỗi admin bấm được nút "Hoàn tiền" nhiều lần dẫn tới gọi API hoàn tiền trùng lặp.
  * Thêm trạng thái disabled (đang xử lý) khi nút được click.
  * Ẩn hoàn toàn nút "Hoàn tiền" nếu trong metadata của đơn hàng đã ghi nhận mã hoàn tiền (`refund_id`), đồng nghĩa với việc đơn này đã được hoàn tiền xong.

## 3. Điều chỉnh UI/UX Khác
* **Trang Giỏ hàng (`src/client/pages/CartPage.tsx`)**:
  * Bỏ dòng phí vận chuyển.
  * Xóa bỏ dòng thông báo "bạn cần mua thêm X để được freeship" ở phần tóm tắt đơn hàng.
* **Trang Danh sách sản phẩm (`src/client/pages/ProductsPage.tsx`)**:
  * Sửa đổi câu mô tả dưới tiêu đề "Tất cả sản phẩm" thành: *"Khám phá bộ sưu tập điện thoại công nghệ mới nhất."*, loại bỏ các cụm từ không liên quan như "máy tính" và "phụ kiện".

## 4. Các Fix Lỗi Khác
* **Sửa Type Error Backend (`medusa-backend/apps/backend/src/utils/zalopayRefund.ts`)**:
  * Ép kiểu (typecast) kết quả trả về của `response.json()` thành `any` để sửa lỗi biên dịch (build) của TypeScript.

---

**Ghi chú:** Đã chạy lệnh `npm run build` cho backend để hệ thống ghi nhận file route API mới tạo cho tính năng Thanh toán lại. Các thay đổi về giao diện (React) sẽ được hot-reload ngay trên terminal dev.
