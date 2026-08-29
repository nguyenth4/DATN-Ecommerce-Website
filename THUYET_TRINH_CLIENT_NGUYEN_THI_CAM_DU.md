# PHÂN CÔNG THUYẾT TRÌNH - GIAO DIỆN CLIENT (STOREFRONT)
## Người thực hiện: Nguyễn Thị Cẩm Dư

### 🎯 Vai trò chính trong phần Client:
Phụ phụ trách chính về **Xác thực Nhanh (OAuth Social Login)**, **Chi tiết Thông số & Uy tín Seller**, **Đồng bộ & Kiểm tra Tồn kho Giỏ hàng**, và **Quản lý Hồ sơ / Sổ địa chỉ**.

---

### 📋 Danh sách Trang & Phần công việc thuyết trình:

#### 1. Đăng nhập Nhanh Mạng Xã Hội (Social Auth UI) & Phân luồng Mua hàng
- **Nhiệm vụ liên quan**: `PB-04`, `T-59`, `T-71`, `T-82`
- **Kịch bản thuyết trình**:
  - **Đăng nhập Google OAuth2 & Facebook**: Demo thao tác 1-click đăng nhập bằng tài khoản Google hoặc Facebook, tự động khởi tạo tài khoản nếu lần đầu và lưu session JWT.
  - **Phân luồng bắt buộc Đăng nhập**: Trình diễn việc hệ thống yêu cầu hoặc điều hướng người dùng đăng nhập trước khi thực hiện các bước Checkout quan trọng.

#### 2. Trang Chi tiết Sản phẩm - Bảng Thông số & Badge Uy tín
- **Nhiệm vụ liên quan**: `T-35`, `T-36`, `T-87`
- **Kịch bản thuyết trình**:
  - **Mô tả chi tiết & Video Embed**: Trình diễn khối mô tả phong phú, chứa video giới thiệu sản phẩm trực quan.
  - **Bảng Thông số Kỹ thuật**: Trình diễn bảng thông số chi tiết (kích thước, chất liệu, xuất xứ...).
  - **Badge Uy tín Seller**: Hiển thị nhãn chứng nhận độ uy tín của cửa hàng/người bán.
  - **Sản phẩm liên quan**: Khối gợi ý các sản phẩm cùng danh mục/thương hiệu ở chân trang chi tiết.

#### 3. Đồng bộ Giỏ hàng (Cart Sync) & Kiểm tra Tồn kho Real-time
- **Nhiệm vụ liên quan**: `T-53`, `T-54`
- **Kịch bản thuyết trình**:
  - **Merge Giỏ hàng vãng lai (Guest Cart Sync)**: Thuyết trình luồng khi người dùng chưa đăng nhập thêm sản phẩm vào giỏ (lưu LocalStorage), sau khi đăng nhập hệ thống tự động đồng bộ gộp vào giỏ hàng trên DB mà không làm mất sản phẩm.
  - **Validate Tồn kho trước Checkout**: Trình diễn tính năng tự động kiểm tra số lượng tồn kho thực tế của từng biến thể trong giỏ, đưa ra cảnh báo nếu sản phẩm đã hết hàng hoặc không đủ số lượng trước khi cho phép qua trang thanh toán.

#### 4. Trang Hồ sơ Cá nhân (User Profile) & Sổ địa chỉ
- **Nhiệm vụ liên quan**: `T-65`, `T-67`
- **Kịch bản thuyết trình**:
  - **Thông tin cá nhân & Upload Avatar**: Xem/sửa Họ tên, Email, SĐT và tải lên/thay đổi ảnh đại diện cá nhân.
  - **Quản lý Sổ địa chỉ giao hàng**: Giao diện CRUD địa chỉ (Thêm mới địa chỉ nhận hàng, sửa, xóa, và chọn địa chỉ mặc định để ưu tiên điền khi checkout).

#### 5. Áp dụng Khuyến mãi & Hiển thị Mã đơn hàng
- **Nhiệm vụ liên quan**: `T-109`, `T-110`, `T114`
- **Kịch bản thuyết trình**:
  - **Giao diện Voucher / Mã giảm giá**: Nhập mã voucher và kiểm tra điều kiện áp dụng ở trang thanh toán.
  - **Tối ưu Mobile Responsive & Mã đơn hàng**: Trình diễn giao diện được tối ưu trên điện thoại di động và hiển thị mã đơn hàng rõ ràng sau khi đặt hàng.
