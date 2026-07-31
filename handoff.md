# Handoff: Cải thiện UI/UX Trang chủ (Home Page)

## 1. Mục tiêu
Tối ưu hoá và cải thiện trải nghiệm người dùng (UI/UX) trên trang chủ, đặc biệt là các thành phần thẻ Bento, banner khuyến mãi và lưới danh mục sản phẩm. Cập nhật các hành vi điều hướng để mang lại luồng mua sắm liền mạch hơn.

## 2. Chi tiết các thay đổi đã thực hiện

### 2.1. Cải thiện hình ảnh thẻ Bento & Discount Banners
- **Vấn đề cũ**: Hình ảnh trong thẻ Bento và các Discount Banners bị hiển thị thô cứng, hụt viền (lệch) do sử dụng các ảnh vuông có nền đè lên background gradient, gây mất thẩm mỹ.
- **Giải pháp**: 
  - Áp dụng `object-fit: cover` cùng với việc định cấu hình lại `width` và `height` giúp ảnh lấp đầy và bo chuẩn xác theo góc thẻ (`border-radius: overflow hidden`).
  - Sử dụng kỹ thuật `mask-image: linear-gradient` để tạo hiệu ứng mờ dần (fade-out) cho viền trong của bức ảnh. Nhờ đó, bất kỳ hình ảnh nào cũng có thể hòa trộn cực kỳ tự nhiên vào phông nền gradient rực rỡ của thẻ.
  - Phân bổ lại `z-index` (`z-index: 2`) cho các phần chữ (`h3`, `.meta`, `.shop-now`) để luôn sắc nét và không bị ảnh lấn át.
  - Áp dụng đồng bộ trên hai tệp: `src/index.css` và `src/assets/css/styles.css`.

### 2.2. Hình ảnh minh hoạ động cho danh mục (Categories)
- **Vấn đề cũ**: Toàn bộ các danh mục ở mục "Mua sắm theo danh mục" đều hiển thị chung một hình ảnh giả lập (Apple Watch), gây nhầm lẫn cho người dùng.
- **Giải pháp**: Viết hàm `getCategoryFallbackImage` để phân tích tên danh mục (Laptop, iPhone, Điện thoại, Máy ảnh, Tai nghe...) và render hình ảnh phù hợp nhất với danh mục đó khi dữ liệu metadata của backend chưa có sẵn hình.

### 2.3. Tối ưu điều hướng & Dọn dẹp Layout
- **Xoá section "Dành cho bạn"**: Đã loại bỏ hoàn toàn dải sản phẩm "Dành cho bạn" (Compact Row) khỏi tệp `HomePage.tsx` nhằm làm tinh gọn giao diện trang chủ theo yêu cầu.
- **Điều hướng danh mục sang trang Sản phẩm**: Thay đổi thẻ danh mục (Category tiles) thành `<Link>`. Thay vì chỉ cuộn trang (scroll) xuống phần tabs phía dưới, việc click vào một danh mục giờ đây sẽ chuyển hướng người dùng thẳng sang trang `/products`.

## 3. Trạng thái hiện tại
- Toàn bộ giao diện trang chủ (`HomePage.tsx`) đã được cập nhật thành công với layout mới đẹp mắt và sang trọng hơn.
- Giao diện đáp ứng tốt ngay cả với những hình ảnh tải từ API hoặc CMS không tách nền sẵn.
- Tính năng điều hướng đang hoạt động mượt mà.

## 4. Next steps (Đề xuất cần làm tiếp)
- **Xử lý URL Parameters tại `/products`**: Cần bổ sung logic để trang sản phẩm có thể đọc query tham số trên URL nhằm tự động lọc các sản phẩm tương ứng với danh mục mà khách hàng vừa click từ trang chủ.
- **Cập nhật dữ liệu từ CMS**: Cân nhắc cho phép người quản trị upload trực tiếp hình ảnh đại diện (Thumbnail) cho danh mục qua trang Admin thay vì dùng fallback bằng mã nguồn (Hardcode logic).
