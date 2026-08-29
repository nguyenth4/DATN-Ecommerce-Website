# PHÂN CÔNG THUYẾT TRÌNH - GIAO DIỆN CLIENT (STOREFRONT)
## Người thực hiện: Lê Kiều Biên

### 🎯 Vai trò chính trong phần Client:
Phụ trách chính về **Tổng quan Giao diện (Layout & Theme)**, **Trang Chủ**, **Trang Danh sách Sản phẩm (Cửa hàng)**, **Trang Chi tiết Sản phẩm (Biến thể & Review)** và **Trải nghiệm Giỏ hàng**.

---

### 📋 Danh sách Trang & Phần công việc thuyết trình:

#### 1. Giao diện Chung & Chuẩn hoá UI (Layout Header/Footer & Localization)
- **Nhiệm vụ liên quan**: `T-05`, `T-45`, `T-61`
- **Kịch bản thuyết trình**:
  - Giới thiệu layout tổng thể thiết kế trên ReactJS với Header điều hướng thông minh, Footer đầy đủ thông tin.
  - Thuyết trình việc **Việt hóa toàn bộ 100% giao diện UI** (bao gồm thông báo lỗi, nút bấm, nhãn).
  - Áp dụng font chữ **Roboto** nhất quán toàn bộ các thẻ sản phẩm và thành phần trang.

#### 2. Trang Chủ (Home Page)
- **Nhiệm vụ liên quan**: `T-06`, `T-33`, `T-77`
- **Kịch bản thuyết trình**:
  - **Hero Banner**: Trình diễn banner khuyến mãi chính thu hút người dùng.
  - **Mua sắm theo danh mục**: Trình diễn các danh mục sản phẩm nổi bật (đã khắc phục lỗi khớp ảnh danh mục theo đúng sản phẩm).
  - **Sản phẩm nổi bật / Trending**: Trình diễn cách trang chủ gọi API lấy sản phẩm mới nhất và nổi bật nhất kèm Skeleton Loader khi đang tải dữ liệu.

#### 3. Trang Danh sách Sản phẩm (/products - Cửa hàng)
- **Nhiệm vụ liên quan**: `T-07`, `T-34`, `T-63`, `T-64`
- **Kịch bản thuyết trình**:
  - **Thanh Sidebar Lọc linh hoạt**: Trình diễn lọc sản phẩm theo tình trạng (`Còn hàng` / `Đang giảm giá` / `Sản phẩm mới`).
  - **Sắp xếp nâng cao**: Lựa chọn sắp xếp theo giá tăng/giảm, tên, và tùy chọn **"Phổ biến"** (dựa trên lượt xem/lượt bán/rating).
  - **Phân trang & Skeleton**: Demo phân trang mượt mà và giao diện skeleton loading giúp trải nghiệm người dùng không bị giật lag.

#### 4. Trang Chi tiết Sản phẩm (/products/:id)
- **Nhiệm vụ liên quan**: `T-08`, `T-76`, `T-44`
- **Kịch bản thuyết trình**:
  - **Đổi biến thể & Cập nhật ảnh live**: Chọn các thuộc tính (Màu sắc, Kích thước) -> Giá tiền, tồn kho và **hình ảnh đại diện tự động đổi theo đúng biến thể đang chọn**.
  - **Chính sách sản phẩm**: Hiển thị khối thông tin chính sách đổi trả, bảo hành minh bạch ngay dưới nút Mua hàng.

#### 5. Hệ thống Đánh giá & Bình luận (Reviews System)
- **Nhiệm vụ liên quan**: `T-20`, `T-40`, `T-92`, `T-93`, `T-106`
- **Kịch bản thuyết trình**:
  - **Hiển thị Đánh giá**: Danh sách bình luận thực tế kèm Avatar, ngày đăng, số sao rating trung bình (xử lý chuẩn: sản phẩm chưa có review hiển thị 0 sao/chưa có đánh giá).
  - **Phân quyền Đánh giá**: Demo logic chỉ tài khoản đã mua sản phẩm và đơn hàng ở trạng thái "Đã giao/Hoàn thành" mới hiển thị form viết review.
  - **Quản lý & Chặn bình luận**: Rà soát bộ lọc từ ngữ/chặn nội dung vi phạm.

#### 6. Trải nghiệm Giỏ hàng (Cart Experience) & Thao tác Khách hàng
- **Nhiệm vụ liên quan**: `T-09`, `T-51`, `T-52`, `T-68`, `T-99`, `T-113`
- **Kịch bản thuyết trình**:
  - **Giỏ hàng Drawer / Trang Giỏ hàng**: Thêm, bớt số lượng, xóa item, tự động tính tổng tiền và tổng số lượng.
  - **Yêu cầu đăng nhập**: Cảnh báo/Chặn yêu cầu đăng nhập trước khi thêm sản phẩm vào giỏ (`T-113`).
  - **Sản phẩm yêu thích (Wishlist)**: Thêm/xóa sản phẩm khỏi danh sách Wishlist (`T-68`).
  - **Xác nhận đã nhận hàng**: Trình diễn nút "Xác nhận đã nhận hàng" trên giao diện User khi đơn ở trạng thái "Đã giao" để chuyển đơn sang "Hoàn thành" (`T-99`).
