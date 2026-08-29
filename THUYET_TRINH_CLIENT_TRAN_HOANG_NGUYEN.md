# PHÂN CÔNG THUYẾT TRÌNH - GIAO DIỆN CLIENT (STOREFRONT)
## Người thực hiện: Trần Hoàng Nguyện

### 🎯 Vai trò chính trong phần Client:
Phụ trách chính về **Luồng Đặt hàng (Checkout Form)**, **Tính Phí Vận chuyển (GHN/GHTK)**, **Tích hợp Đa cổng Thanh toán Online**, **So sánh Sản phẩm** và **Quản lý Đơn hàng & Hoàn tiền Ví**.

---

### 📋 Danh sách Trang & Phần công việc thuyết trình:

#### 1. Trang Đặt hàng & Nhập Địa chỉ (Checkout Form Page)
- **Nhiệm vụ liên quan**: `T-11`, `T-37`, `T-72`, `T-74`, `T-75`
- **Kịch bản thuyết trình**:
  - **Form nhập địa chỉ nhận hàng**: Chọn Tỉnh/Thành phố, Huyện/Quận, Xã/Phường linh hoạt với dữ liệu hành chính Việt Nam.
  - **Trang Xác nhận Đơn hàng thành công**: Giao diện thông báo hoàn tất đơn hàng, hiển thị tóm tắt thông tin đơn và gửi email xác nhận.

#### 2. Tính Phí Vận Chuyển Real-time & So sánh Đơn vị Giao hàng (GHN/GHTK)
- **Nhiệm vụ liên quan**: `T-11`, `T-37`, `T-46`, `T-90`, `T-102`
- **Kịch bản thuyết trình**:
  - **Gọi API tính phí thực tế**: Hệ thống tự động tính phí vận chuyển dựa trên địa chỉ giao hàng, cân nặng và chiều cao/kích thước quy đổi của sản phẩm.
  - **So sánh 2 đơn vị giao hàng**: Người dùng có thể lựa chọn giữa **Giao hàng nhanh (GHN)** hoặc **Giao hàng tiết kiệm (GHTK)** với mức phí và thời gian dự kiến minh bạch.

#### 3. Tích hợp Đa phương thức Thanh toán Online (Payment Gateways Integration)
- **Nhiệm vụ liên quan**: `T-15`, `T-24`, `T-38`, `T-94`, `T-103`
- **Kịch bản thuyết trình**:
  - **Thanh toán khi nhận hàng (COD)**: Đặt hàng nhanh không qua cổng online.
  - **Cổng thanh toán VNPay**: Demo luồng chuyển hướng sang cổng VNPay Sandbox, thực hiện quét QR/thẻ ATM test và nhận callback cập nhật trạng thái thanh toán.
  - **Cổng thanh toán ZaloPay & MoMo**: Trình diễn các tùy chọn thanh toán ví điện tử phổ biến.
  - **Thanh toán bằng Ví tiền cá nhân**: Tùy chọn trừ tiền trực tiếp từ số dư Ví trên tài khoản.

#### 4. Trang So sánh Sản phẩm (Product Comparison Page)
- **Nhiệm vụ liên quan**: `T-39`
- **Kịch bản thuyết trình**:
  - **Bảng so sánh đa chiều**: Trình diễn tính năng thêm nhiều sản phẩm vào danh sách so sánh và hiển thị bảng so sánh đối chiếu giá cả, thông số kỹ thuật, đánh giá và ước tính phí ship.

#### 5. Quản lý Đơn hàng Cá nhân (Order History) & Luồng Hủy đơn / Hoàn tiền
- **Nhiệm vụ liên quan**: `T-21`, `T-47`, `T-66`, `T-70`, `T-100`
- **Kịch bản thuyết trình**:
  - **Danh sách Đơn hàng của tôi**: Xem danh sách đơn hàng đã mua với badge đếm số đơn theo từng trạng thái (Chờ xác nhận, Đang vận chuyển, Đã giao...).
  - **Timeline Trạng thái Đơn hàng**: Trình diễn thanh tiến trình trạng thái đơn minh bạch.
  - **Quy tắc Hủy đơn & Hoàn tiền tự động**:
    - Demo nút **Hủy đơn** chỉ xuất hiện khi đơn ở trạng thái cho phép (trước "Đang vận chuyển").
    - Khi hủy đơn thành công, tiền thanh toán sẽ **tự động hoàn 100% vào Ví tiền cá nhân** của người dùng kèm thông báo.
