# PHƯƠNG ÁN TÍCH HỢP & HIỂN THỊ MÀ GIẢM GIÁ (COUPON/VOUCHER)
*Tài liệu trình bày ý tưởng và hướng giải quyết UX/UI cho tính năng Mã giảm giá.*

---

## 1. THỰC TRẠNG HIỆN TẠI CỦA HỆ THỐNG
- Trên trang **Giỏ hàng (Cart Page)** hiện đang có một nút tên là *"Áp dụng mã giảm giá"*. Tuy nhiên, đây chỉ là thiết kế giao diện tĩnh (mockup). Khi bấm vào, hệ thống tự động trừ một khoản tiền giả lập (56.000đ) chứ chưa liên kết với dữ liệu mã giảm giá trên Backend.
- Chưa có nơi nào trên giao diện (Frontend) hiển thị danh sách các mã đang có để khách hàng biết mà nhập.

---

## 2. NƠI TRƯNG BÀY MÃ ĐỂ KHÁCH HÀNG NHÌN THẤY (MẶT TIỀN UX)
Vì khách hàng không thể tự đoán mã, chúng ta phải "khoe" mã ra ở những nơi dễ chú ý nhất trong hành trình mua sắm:

1. **Trang chủ (Home Page):** 
   - Đặt một dải Banner nhỏ trên cùng (Top Announcement Bar). Ví dụ: *"🔥 Nhập mã FREESHIP20 để được miễn phí giao hàng!"*.
   - Hoặc thiết kế một khu vực Slider riêng chuyên tổng hợp các Voucher đang chạy trong tháng.

2. **Trang chi tiết sản phẩm (Product Detail Page - PDP):** 
   - Ngay bên dưới giá tiền sản phẩm, thiết kế một box nhỏ với nội dung: *"Mã giảm giá của shop: [SALE10] [SALE20]"*.
   - Có thể đính kèm một nút **[Copy]** bên cạnh để khách dễ dàng sao chép mã mà không cần nhớ.

3. **Trang Giỏ Hàng & Thanh Toán (Cart / Checkout Page):** 
   - Đây là điểm "chốt sale" quan trọng nhất. Ngay dưới phần tổng tiền, thiết kế một mục *"Khuyến mãi dành riêng cho bạn"*.
   - Ở đó liệt kê sẵn 2-3 mã khách có đủ điều kiện áp dụng, khách chỉ việc bấm nút *"Áp dụng"* thay vì phải gõ lại.

---

## 3. HƯỚNG TRIỂN KHAI VÀ VIẾT CODE CỤ THỂ

Để biến tính năng này thành hiện thực (chạy được thật trên hệ thống Medusa), cần làm theo 3 bước sau:

**Bước 1: Tạo mã thật trên Backend (Quản trị viên)**
- Truy cập vào trang Admin (Cổng 7001) của Medusa.
- Vào mục **Promotions / Discounts** để tạo một mã giảm giá mới. 
- Ví dụ: Tạo mã `GIAM50K`, cấu hình điều kiện là "Trừ 50.000đ cho mọi đơn hàng từ 200.000đ trở lên".

**Bước 2: Cập nhật giao diện Frontend (Cart Page)**
- Sửa lại nút *"Áp dụng mã giảm giá"* trên `CartPage.tsx`.
- Thay vì trừ tiền trực tiếp, khi bấm vào nút này sẽ hiện lên một **Popup (Cửa sổ nổi)**.
- Bên trong Popup sẽ có:
  - Một ô Input nhập văn bản để khách gõ mã (ví dụ: gõ `GIAM50K`) và nút "Xác nhận".
  - Bên dưới ô Input là một danh sách các mã gợi ý có sẵn, đi kèm nút "Áp dụng nhanh".

**Bước 3: Kết nối API (Logical Data)**
- Khi khách hàng bấm "Xác nhận" (hoặc Áp dụng), Frontend sẽ lấy đoạn text mã đó và gọi API của Medusa: `POST /store/carts/{cart_id}/line-items/discount` (hoặc API tương ứng của Medusa v2).
- Nếu API trả về thành công (mã hợp lệ), Frontend sẽ lấy dữ liệu tổng tiền mới từ kết quả API và vẽ lại giao diện (giá tiền sẽ được gạch ngang, hiển thị giá đã giảm). Nếu mã sai, hiển thị dòng báo lỗi *"Mã không tồn tại hoặc hết hạn"*.
