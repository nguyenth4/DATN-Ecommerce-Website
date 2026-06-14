# PROJECT HANDOFF DOCUMENT
**Dự án:** Website Ecommerce chuyên bán điện thoại và phụ kiện công nghệ (Đồ án tốt nghiệp)
**Cập nhật lần cuối:** Hôm nay

## 1. Kiến trúc & Công nghệ (Tech Stack)
- **Frontend (Storefront):** React.js + TypeScript + Vite.
- **Backend:** MedusaJS (Phiên bản mới nhất) chạy trên Docker.
- **Database:** Supabase (PostgreSQL).
- **Mô hình kiến trúc:** MVC (Model - View - Controller). Source code Frontend đã được chia tách rõ ràng thành 2 phần độc lập: `client` (người dùng) và `admin` (quản trị viên).

## 2. Trạng thái hiện tại (Current Status)
✅ **Frontend:** Đã khởi tạo cấu trúc thư mục, định tuyến (React Router), ThemeProvider (Dark/Light mode) và giao diện layout cơ bản.
✅ **Database:** Đã thiết lập thành công Supabase. Đã lấy được đường dẫn kết nối chuẩn hỗ trợ IPv4 Pooler.
✅ **Môi trường máy chủ:** Đã cài đặt Node.js v26.3.0 trên máy vật lý để sử dụng cho các dự án khác.
⚠️ **Backend:** Chưa khởi tạo MedusaJS do lỗi tương thích phiên bản Node.js với thư viện lõi C++ của Medusa.

## 3. Vấn đề tương thích & Giải pháp kiến trúc (Architecture Solution)
- **Vấn đề cũ:** Máy tính đang sử dụng Node.js bản mới nhất (v26.3.0), dẫn đến việc MedusaJS không thể biên dịch các thư viện lõi (như `@swc/core`, `turbo`), gây ra lỗi `%1 is not a valid Win32 application`.
- **Giải pháp thống nhất:** Không hạ cấp Node.js trên máy tính vật lý. Thay vào đó, **sử dụng Docker** để khởi tạo và chạy MedusaJS backend với môi trường `node:20` biệt lập. Điều này đảm bảo tính ổn định tuyệt đối và tránh xung đột với các dự án khác.

## 4. Các bước tiếp theo cần làm ngay (Next Steps)
Người tiếp quản dự án (hoặc bạn ở phiên làm việc tiếp theo) cần làm theo chuẩn các bước khởi tạo Backend bằng Docker sau đây:

1. **Chuẩn bị môi trường:** Đảm bảo **Docker Desktop** trên Windows đang được bật và chạy bình thường. Xoá bỏ hoàn toàn thư mục `medusa-backend` nếu có bản lỗi cũ.
2. **Khởi tạo Backend qua Docker:** Mở Terminal tại thư mục gốc (`DATN`), chạy lệnh sau để dùng Node 20 của Docker tạo dự án:
   ```bash
   docker run --rm -it -v "%cd%":/app -w /app node:20 npx create-medusa-app@latest medusa-backend --db-url "postgresql://postgres.xeqsnglavqnlkpnqxrdx:duantotnghiep%40123@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
   ```
3. **Cấu hình Docker Compose:** Sau khi Docker tạo xong mã nguồn, di chuyển vào thư mục `medusa-backend` và tạo file `docker-compose.yml` với nội dung:
   ```yaml
   version: '3.8'
   services:
     medusa:
       image: node:20
       working_dir: /app
       volumes:
         - .:/app
       ports:
         - "9000:9000"
         - "7001:7001"
       command: npm run dev
   ```
4. **Khởi động:** Tại thư mục `medusa-backend`, chạy `docker-compose up` để bật server Medusa.
5. **Tiếp tục phát triển:** Tích hợp gọi API từ Frontend React sang Backend Medusa.

## 5. Thông tin quan trọng (Credentials)
- **Supabase URL (Session Pooler):** `postgresql://postgres.xeqsnglavqnlkpnqxrdx:duantotnghiep%40123@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres`
- **Medusa Admin Default Account (sau khi cài xong):** 
  - Email: `admin@medusa-test.com`
  - Pass: `supersecret`
- **Cấu trúc lưu ý:** Không được đẩy file `.env` chứa mật khẩu Database lên GitHub.
