# Tài liệu bàn giao (Handoff): Đồng bộ Dữ liệu Dynamic & Tinh chỉnh Trang Chi tiết Sản phẩm

Tài liệu này ghi nhận toàn bộ các thay đổi, cấu trúc mã nguồn và cải tiến giao diện đã thực hiện cho trang chi tiết sản phẩm và các trang danh sách/trang chủ trong dự án **Sprylo Tech & Gadgets Ecommerce**.

---

## 1. Tóm tắt công việc đã thực hiện

Chúng ta đã chuyển đổi thành công toàn bộ hệ thống từ việc hiển thị dữ liệu tĩnh (mock data) sang **dữ liệu động (dynamic data)** lấy trực tiếp từ hệ quản trị **Medusa v2** và **Supabase**, đồng thời tối ưu hóa trải nghiệm người dùng (UX) và bố cục (layout) của trang chi tiết sản phẩm.

### Các điểm nổi bật:
- **Tải dữ liệu động**: Thay thế toàn bộ mock sản phẩm cứng bằng cách gọi API của Medusa/Supabase để lấy thông tin sản phẩm theo thời gian thực.
- **Tích hợp bộ sưu tập hình ảnh & Video YouTube (Product Gallery)**:
  - Hiển thị ảnh thumbnail sản phẩm và tự động hiển thị video review từ thuộc tính `video_url` trong `metadata` của sản phẩm.
  - Video được trình phát mượt mà trực tiếp tại khung gallery ảnh chính khi chọn tab **VIDEO**, mang lại trải nghiệm chuyên nghiệp.
  - Loại bỏ hoàn toàn khối phát video YouTube thừa ở dưới phần mô tả để tối ưu không gian hiển thị.
- **Cải tiến bố cục (Layout Optimization)**:
  - Di chuyển các huy hiệu uy tín người bán (**Seller Reputation**) và khung **Bảo hành & Đổi trả** xuống cột bên trái dưới phần ảnh thu nhỏ để lấp đầy khoảng trắng.
  - Thiết kế lại hộp **Bảo hành & Đổi trả dạng Lưới 2x2** trực quan, gọn gàng, không bị kéo dài cột thông tin.
  - Khắc phục triệt để khoảng trống trắng lớn (gap) ở giữa trang chi tiết bằng cách tinh chỉnh các thông số `padding` và `margin` của các section.

---

## 2. Danh sách các tệp tin thay đổi/bổ sung

### Cấu hình chính:
*   [index.html](file:///d:/FPT%20Polytechnic/DATN/DATN-Ecommerce-Website/index.html):
    *   Tích hợp thêm bộ icon **Bootstrap Icons** CDN để hiển thị các biểu tượng bảo hành, đổi trả, giao hàng, xe tải.

### Frontend Pages (Trang giao diện):
*   [ProductDetailPage.tsx](file:///d:/FPT%20Polytechnic/DATN/DATN-Ecommerce-Website/src/client/pages/ProductDetailPage.tsx):
    *   Sử dụng params `id` từ URL để gọi hook dynamic `useProduct(id)`.
    *   Hiển thị hiệu ứng chờ **Loading Skeleton** khi dữ liệu đang tải.
    *   Sắp xếp lại cấu trúc 2 cột cân xứng và giảm khoảng cách đệm (`paddingBottom: '0'`, `marginBottom: '1rem'`, `paddingTop: '2rem'`).
*   [ProductsPage.tsx](file:///d:/FPT%20Polytechnic/DATN/DATN-Ecommerce-Website/src/client/pages/ProductsPage.tsx):
    *   Chuyển đổi hoàn toàn sang lấy danh sách sản phẩm động từ API Medusa thông qua hook `useProducts()`.
*   [HomePage.tsx](file:///d:/FPT%20Polytechnic/DATN/DATN-Ecommerce-Website/src/client/pages/HomePage.tsx):
    *   Cập nhật danh sách sản phẩm nổi bật và các banner để lấy dữ liệu thực tế từ cơ sở dữ liệu thay vì mock data tĩnh.

### Frontend Components (Linh kiện giao diện):
*   [ProductGallery.tsx](file:///d:/FPT%20Polytechnic/DATN/DATN-Ecommerce-Website/src/client/components/ProductDetail/ProductGallery.tsx):
    *   Thêm tính năng nhận diện, phân tích cú pháp (regex) URL YouTube để hiển thị đúng khung phát iframe.
    *   Xử lý ảnh đại diện (thumbnail) dự phòng an toàn nếu danh sách hình ảnh của sản phẩm trống.
*   [ProductInfo.tsx](file:///d:/FPT%20Polytechnic/DATN/DATN-Ecommerce-Website/src/client/components/ProductDetail/ProductInfo.tsx):
    *   Hiển thị thông tin tên sản phẩm, các lựa chọn màu sắc, dung lượng và giá tiền tương ứng theo từng biến thể (variant).
    *   Tự động tính toán phần trăm giảm giá và kiểm tra trạng thái còn hàng/hết hàng để vô hiệu hóa (disable) nút mua nếu cần.
*   [ProductSpecsTable.tsx](file:///d:/FPT%20Polytechnic/DATN/DATN-Ecommerce-Website/src/client/components/ProductDetail/ProductSpecsTable.tsx):
    *   Hiển thị bảng thông số kỹ thuật động dạng key-value lấy từ trường `specifications` nằm trong `metadata` của sản phẩm.

---

## 3. Cấu trúc dữ liệu Sản phẩm cần lưu ý (Database Schema)

Để các tính năng hoạt động đồng bộ, dữ liệu sản phẩm trong **Medusa / Supabase** cần tuân thủ cấu trúc `metadata` như sau:

```json
{
  "video_url": "https://www.youtube.com/watch?v=QX7p4VpeYkI",
  "specifications": {
    "Màn hình": "Super Retina XDR OLED, 6.9 inches, 120Hz",
    "Hệ điều hành": "iOS 18",
    "Camera sau": "48 MP + 48 MP + 12 MP",
    "Camera trước": "12 MP",
    "Chipset": "Apple A18 Pro (3 nm)",
    "Pin": "4685 mAh, hỗ trợ sạc nhanh"
  }
}
```

*   **`video_url`**: Đường dẫn video YouTube review sản phẩm (hệ thống sẽ tự chuyển thành link nhúng).
*   **`specifications`**: Đối tượng chứa các cặp khóa-giá trị tương ứng với thông số kỹ thuật để tự động dựng thành bảng thông số.

---

## 4. Hướng dẫn kiểm tra và vận hành cho team members

1.  **Chạy Backend Medusa**:
    Đảm bảo Medusa server đang chạy bình thường ở cổng `9000` (hoặc cổng cấu hình backend).
2.  **Khởi động Storefront**:
    Chạy lệnh `npm run dev` ở thư mục gốc của dự án frontend.
3.  **Kiểm tra trên Trình duyệt**:
    *   Truy cập `http://localhost:5173/` để xem danh sách sản phẩm hiển thị động.
    *   Bấm vào một sản phẩm bất kỳ để chuyển đến trang chi tiết.
    *   Kiểm tra việc chuyển đổi giữa các ảnh con và tab phát **VIDEO**.
    *   Kiểm tra bảng thông số kỹ thuật hiển thị tương ứng với cấu hình trong Supabase/Medusa Admin.
