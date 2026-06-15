# PROJECT HANDOFF DOCUMENT
**Dự án:** Website Ecommerce chuyên bán điện thoại và phụ kiện công nghệ (Đồ án tốt nghiệp)
**Cập nhật lần cuối:** Hôm nay

## 1. Kiến trúc & Công nghệ (Tech Stack)
- **Frontend (Storefront):** React.js + TypeScript + Vite.
- **Backend:** MedusaJS (Phiên bản mới nhất) chạy trên Docker (Hoặc framework khác tùy định hướng).
- **Database:** Supabase (PostgreSQL).
- **Mô hình kiến trúc:** MVC (Model - View - Controller). Source code Frontend được chia tách thành 2 phần độc lập: `client` (người dùng) và `admin` (quản trị viên).

## 2. Trạng thái hiện tại (Current Status)
✅ **Frontend (Client UI):** Đã hoàn tất chuyển đổi 100% giao diện từ thư mục tĩnh `shopflow-ui` sang React Component (`src/client/pages/`).
  - **Các trang đã tạo:** `HomePage`, `ProductsPage`, `ProductDetailPage`, `CartPage`, `CheckoutPage`, `LoginPage`, `RegisterPage`, `AccountPage`, `OrderTrackingPage`, `OrderSuccessPage`.
  - **Cấu hình Layout:** Thiết lập thành công cấu trúc `react-router-dom` (`src/client/routes/index.tsx`), chia Layout chuẩn (dùng chung `ClientLayout` có Header/Footer) và Layout độc lập (cho Auth, Checkout).
  - **Khắc phục CSS:** Sửa lỗi hiển thị (Vỡ Layout) bằng cách import đầy đủ các file CSS riêng lẻ (`account.css`, `auth.css`, `order-success.css`, `order-tracking.css`) vào `index.html`.
  - **Dọn dẹp code:** Đã loại bỏ các đường dẫn/menu thừa (như menu "Đơn hàng" trên Header).
✅ **Database:** Đã thiết lập thành công Supabase. Đã lấy được đường dẫn kết nối chuẩn hỗ trợ IPv4 Pooler.
⚠️ **Backend:** Đang chờ hoàn tất khởi tạo và cấu hình (Sử dụng Docker do xung đột phiên bản Node.js).

## 3. Các bước tiếp theo cần làm ngay (Next Steps)

### Giai đoạn 1: Hoàn thiện Logic Frontend
1. **Chia nhỏ Component:** Tách các khối UI lặp lại nhiều lần (như `ProductCard`, `Sidebar Filter`, `CartItem`) ra thư mục `src/client/components/` để tái sử dụng.
2. **State Management (Quản lý trạng thái):** 
   - Thiết lập React Context hoặc Redux để quản lý **Giỏ hàng (Cart)** và **Phiên đăng nhập (Auth User)**.
   - Chuyển logic JS thuần (như logic chuyển Tab trong trang Account) sang React State (`useState`).
3. **Chuẩn bị tích hợp API:** Cấu hình thư viện gọi API (axios/fetch) và thay thế dữ liệu fix cứng (hard-code) bằng dữ liệu động.

### Giai đoạn 2: Cài đặt Backend MedusaJS bằng Docker
Nếu tiếp tục cài đặt MedusaJS, cần thực hiện theo quy trình sau:
1. **Chuẩn bị môi trường:** Đảm bảo **Docker Desktop** trên Windows đang bật. Xóa bỏ hoàn toàn thư mục `medusa-backend` nếu có bản lỗi cũ.
2. **Khởi tạo qua Docker:** Mở Terminal tại thư mục gốc dự án (`DATN`), chạy lệnh sau để dùng Node 20 tạo dự án:
   ```bash
   docker run --rm -it -v "%cd%":/app -w /app node:20 npx create-medusa-app@latest medusa-backend --db-url "postgresql://postgres.xeqsnglavqnlkpnqxrdx:duantotnghiep%40123@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
   ```
3. **Cấu hình Docker Compose:** Trong thư mục `medusa-backend`, tạo file `docker-compose.yml` với container `node:20`, mount volume `.:/app` và export port `9000`, `7001`.
4. **Khởi động:** Chạy `docker-compose up` để bật server Medusa, sau đó bắt đầu viết API nối với React.

## 4. Thông tin hệ thống quan trọng (Credentials)
- **Supabase URL (Session Pooler):** `postgresql://postgres.xeqsnglavqnlkpnqxrdx:duantotnghiep%40123@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres`
- **Medusa Admin Default Account (Dự kiến):** `admin@medusa-test.com` / `supersecret`
- **Bảo mật:** Tuyệt đối không được đẩy file `.env` chứa mật khẩu Database lên GitHub.
