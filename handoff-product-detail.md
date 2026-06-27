# Handoff: Chi tiết Sản phẩm Dynamic & Tối ưu hóa Bố cục

Tài liệu này bàn giao các thay đổi thực hiện cho nhánh tính năng hiển thị chi tiết sản phẩm động từ Medusa/Supabase, tích hợp video YouTube, bảng thông số kỹ thuật, thẻ uy tín và tối ưu hóa khoảng trống giao diện.

---

## 1. Mục tiêu công việc
- **Dữ liệu động thực tế**: Loại bỏ hoàn toàn mock sản phẩm tĩnh. Lấy dữ liệu sản phẩm thực tế từ Medusa Backend và Supabase.
- **Thư viện ảnh tích hợp Video**: Nhúng video YouTube trực quan vào cùng bộ sưu tập ảnh (Product Gallery), hỗ trợ tự động phân tích (parse) URL từ database (`metadata.video_url`).
- **Thẻ uy tín người bán (Seller Badge)**: Tự động hiển thị huy hiệu uy tín của seller nếu sản phẩm thuộc về một nhà bán hàng cụ thể.
- **Thông số kỹ thuật động**: Hiển thị bảng cấu hình chi tiết tự động parse từ trường JSON `metadata.specifications`.
- **Tối ưu hóa bố cục & Spacing**:
  - Di chuyển hộp Bảo hành / Đổi trả sang dạng lưới 2x2 gọn gàng nằm ở cột trái dưới gallery ảnh để cân bằng bố cục.
  - Loại bỏ hoàn toàn đầu phát video dư thừa ở dưới phần mô tả.
  - Sửa lỗi khoảng trống trắng lớn (176px) ở giữa trang bằng cách tối ưu hóa `paddingBottom`, `marginBottom` và `paddingTop` của các section liền kề.

---

## 2. Chi tiết các thay đổi đã thực hiện

### 2.1. Phía Frontend (Cập nhật các Trang & Component)
- **`src/client/pages/ProductDetailPage.tsx`**:
  - Refactor toàn bộ trang để sử dụng hook `useProduct(id)` lấy dữ liệu thực tế từ API.
  - Bổ sung trạng thái Loading với Skeleton cực kỳ mượt mà và chuyên nghiệp.
  - Định hình lại bố cục 2 cột cân xứng: Cột trái (Gallery ảnh/video + Hộp bảo hành lưới 2x2), Cột phải (Thông tin chi tiết, màu sắc, dung lượng, nút mua hàng, thông tin bổ sung).
  - Tối ưu hóa spacing: Gỡ bỏ `padding-bottom` thừa của section chi tiết và giảm `padding-top` của section mô tả giúp giao diện liên kết chặt chẽ hơn.
- **`src/client/components/ProductDetail/ProductGallery.tsx`**:
  - Hỗ trợ hiển thị ảnh và video review chung trong một bộ sưu tập.
  - Tích hợp hàm `getEmbedUrl` để chuyển đổi tự động mọi định dạng link YouTube (watch, share, embed) sang dạng iframe an toàn.
  - Thêm thumbnail **VIDEO** có biểu tượng play để người dùng bấm phát trực tiếp trên khung ảnh lớn.
  - Thêm logic fallback tự động dùng ảnh `thumbnail` của sản phẩm nếu mảng `images` trống, tránh màn hình trống.
- **`src/client/components/ProductDetail/ProductInfo.tsx`**:
  - Cập nhật hiển thị tên sản phẩm, phân loại, giá bán và giá gốc động.
  - Thiết kế huy hiệu uy tín người bán **Seller Reputation Badge** trực quan (đạt tiêu chuẩn Top Seller, tỉ lệ phản hồi tốt).
- **`src/client/components/ProductDetail/ProductSpecsTable.tsx`**:
  - Tạo bảng thông số kỹ thuật động. Đọc trực tiếp từ object `specifications` lưu trong metadata của sản phẩm (ví dụ: Màn hình, CPU, RAM, Pin, Hệ điều hành...).
- **`src/client/pages/HomePage.tsx` & `ProductsPage.tsx`**:
  - Cập nhật sang gọi hook `useProducts()` để danh sách sản phẩm trang chủ và trang danh mục đều đồng bộ sử dụng dữ liệu động thực tế từ database.

### 2.2. Phía Client Services (`src/client/services/product.service.ts`)
- Loại bỏ hoàn toàn mảng mock sản phẩm tĩnh khổng lồ (hard-coded data).
- Giữ lại các hàm gọi API Medusa sạch sẽ (`fetchProducts`, `fetchProductById`) giúp cải thiện đáng kể dung lượng bundle và tốc độ tải trang.

---

## 3. Hướng dẫn Kiểm thử & Chạy thử
1. Đảm bảo Backend Medusa đang chạy ở cổng `http://localhost:9000`.
2. Chạy Frontend bằng lệnh:
   ```bash
   npm run dev
   ```
3. Truy cập vào trang chủ `http://localhost:5173/` hoặc trang sản phẩm `http://localhost:5173/products` để kiểm tra danh sách sản phẩm lấy từ DB.
4. Bấm vào bất kỳ sản phẩm nào (ví dụ: `Apple iPhone 16 Pro Max 512GB VN/A`) để kiểm tra trang chi tiết:
   - Thư viện ảnh tải đầy đủ các ảnh con và có nút thumbnail video.
   - Thử bấm nút **VIDEO** để phát video review YouTube.
   - Bảng thông số kỹ thuật bên phải hiển thị đầy đủ thông tin chi tiết.
   - Khoảng cách giữa các phần sát nhau và cân đối, không có khoảng trắng thừa.
