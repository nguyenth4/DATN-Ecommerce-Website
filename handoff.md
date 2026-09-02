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
*Ghi chú: Tài liệu này cần được cập nhật liên tục trong quá trình fix bug và hoàn thiện tính năng.*
