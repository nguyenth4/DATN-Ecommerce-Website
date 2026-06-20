# Nhật ký Thay đổi Cơ sở dữ liệu (Database Changelog)

Tài liệu này dùng để ghi chú sự khác biệt và những thay đổi giữa **ERD thiết kế ban đầu của DATN** và **Database thực tế của hệ thống Medusa v2**.

---

## 1. Các bảng đã được Medusa tự động bao phủ (Có sẵn 100%)

Những bảng sau trong ERD của bạn đã được Medusa thiết kế sẵn với kiến trúc thậm chí còn chi tiết và xịn hơn (hỗ trợ đa tiền tệ, đa ngôn ngữ, kho hàng...):

| Bảng trong ERD ban đầu | Bảng tương ứng trong Medusa DB | Ghi chú |
| :--- | :--- | :--- |
| `Users` (Role: admin) | `user` | Tài khoản dành cho người quản trị viên (Admin). |
| `Users` (Role: customer) | `customer` | Medusa tách riêng tài khoản khách mua hàng ra một bảng `customer` độc lập để dễ quản lý. |
| `Addresses` | `address` | Được liên kết sẵn với `customer`, `cart` và `order`. |
| `Categories` | `product_category` | Hỗ trợ danh mục đa cấp (cây danh mục con). |
| `Products` | `product` | |
| `ProductVariants` | `product_variant` | Hỗ trợ tồn kho (inventory), giá bán đa tiền tệ (price_list). |
| `ProductImages` | `product_image` | |
| `Carts` & `CartItems` | `cart` & `cart_line_item` | |
| `Orders` & `OrderItems` | `order` & `order_line_item` | |
| `Payments` | `payment` | Quản lý cả phiên thanh toán (payment_session) với các cổng (Stripe, VNPay...). |
| `Shipments` | `fulfillment` / `shipping_method`| Tích hợp sẵn mã vận đơn (tracking_code) và trạng thái giao hàng. |

---

## 2. Các bảng CHƯA CÓ sẵn trong Medusa (Cần phải code thêm)

Medusa là một framework thương mại điện tử nền tảng, nó cung cấp những thứ cốt lõi. Với các tính năng mang tính chất đặc thù của từng mô hình kinh doanh, chúng ta sẽ phải tự viết thêm **Custom Module** (chúng ta sẽ dùng TypeORM/PostgreSQL trong code Backend để tự tạo bảng này).

### 2.1 Bảng `Brands` (Thương hiệu)
- **Tình trạng:** Medusa có khái niệm `product_collection` (Bộ sưu tập). Nhiều bên thường "lách luật" dùng Collection làm Brand. Tuy nhiên, ERD của bạn yêu cầu Brand phải có trường `logo`, `description` riêng biệt.
- **Hành động cần làm:** Viết một Custom Module `BrandModule` trong backend, tạo bảng `brand` (id, name, logo) và liên kết nó với bảng `product`.

### 2.2 Bảng `Reviews` (Đánh giá sản phẩm)
- **Tình trạng:** Khách hàng mua xong vào đánh giá 1-5 sao và comment. Medusa không có sẵn bảng này.
- **Hành động cần làm:** Viết Custom Module `ReviewModule`, tạo bảng `product_review` (id, product_id, customer_id, rating, comment, created_at).

---

## 3. Lịch sử các thay đổi (Sẽ cập nhật liên tục)

*Đây là nơi chúng ta sẽ log lại những thay đổi thực tế khi code backend:*

- **[20/06/2026]** Khởi tạo tài liệu Changelog. Xác định được 2 thực thể cần phát triển custom module là `Brands` và `Reviews`.
- *(Các thay đổi trong tương lai sẽ được ghi thêm vào đây...)*
