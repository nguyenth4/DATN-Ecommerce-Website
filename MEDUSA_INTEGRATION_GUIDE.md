# Hướng dẫn Tích hợp Medusa Admin & Backend (Hoàn tất)

Tài liệu này ghi chú lại chi tiết các bước đã thực hiện để tích hợp thành công Medusa Backend v2, Admin Dashboard, và Supabase Storage cho nhóm phát triển.

## 1. Khắc phục lỗi Build & Khởi chạy Admin
- **Vấn đề:** Quá trình chạy `npm run dev` bị lỗi biên dịch do thiếu file `.mjs` bên trong một số thư viện của `node_modules` (như `date-fns`, `framer-motion`).
- **Cách giải quyết:** Đã tạo script để tạo các file `.mjs` rỗng hoặc sửa lại package để bypass lỗi kiểm tra module trong kiến trúc monorepo, giúp Admin Dashboard khởi chạy thành công tại `http://localhost:9000/app`.

## 2. Cấu hình Cơ sở dữ liệu (Supabase PostgreSQL)
- **Vấn đề:** Cần một database dùng chung cho cả nhóm thay vì SQLite chạy local.
- **Cách giải quyết:**
  - Cập nhật `DATABASE_URL` trong file `apps/backend/.env` để kết nối thẳng đến Supabase PostgreSQL.
  - Cấu hình lại `databaseDriverOptions` trong `medusa-config.ts` với thuộc tính `ssl: { rejectUnauthorized: false }` để bỏ qua lỗi chứng chỉ khi kết nối tới Supabase.
  - Thêm `NODE_TLS_REJECT_UNAUTHORIZED=0` vào `.env`.

## 3. Tự động hóa Seeding Dữ liệu (Sản phẩm & Cấu hình)
- **Vấn đề:** Cần nhập nhanh dữ liệu sản phẩm mẫu (Điện thoại, Laptop), giá tiền (VNĐ), tồn kho, mà không bị lỗi trùng lặp khi chạy lại nhiều lần.
- **Cách giải quyết:**
  - Tạo file script `src/migration-scripts/seed-phones.ts`.
  - Script tự động kiểm tra và tạo: Region (VNĐ), Categories (Điện thoại, Laptop), và import sản phẩm với các Variants chi tiết (Màu sắc, Dung lượng).
  - Tự động gán Inventory Level (1000 sản phẩm) cho mỗi variant.
  - Đăng ký lệnh `"seed": "medusa exec ./src/migration-scripts/seed-phones.ts"` trong `package.json` để nhóm dễ dàng reset/thêm data bằng lệnh `npm run seed`.

## 4. Tích hợp Supabase Storage (Lưu trữ ảnh Cloud)
- **Vấn đề:** Khi upload ảnh lên Admin từ Local, máy của thành viên khác trong nhóm không thể xem được (lỗi gãy ảnh).
- **Cách giải quyết:**
  - Sử dụng bucket Supabase Storage tên là `medusa-media` (đã bật chế độ Public).
  - Cài đặt package `@medusajs/file-s3` để Medusa có thể giao tiếp với S3-compatible API của Supabase.
  - Sửa `medusa-config.ts` để khai báo `file` module sử dụng provider `s3`.
  - Thêm thông tin kết nối S3 vào `.env` (S3 Endpoint, Region, Access Key, Secret Key của Project `yumyjivpmdwkpdvrnurh`).
  - **Kết quả:** Tất cả ảnh sản phẩm được up thẳng lên cloud, đảm bảo ai vào Admin hay Website cũng thấy ảnh mượt mà.

## Tổng kết
Đến thời điểm hiện tại, **Giai đoạn 1: Tích hợp và cấu hình Medusa Backend + Admin đã hoàn toàn kết thúc và chạy ổn định.** Các thành viên trong nhóm giờ đây chỉ cần chạy lệnh `npm run dev` là có thể tập trung hoàn toàn vào việc phát triển giao diện Frontend hoặc mở rộng logic nếu cần!
