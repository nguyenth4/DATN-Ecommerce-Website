# HƯỚNG DẪN CHẠY DỰ ÁN E-COMMERCE (MEDUSA V2 + REACT/VITE)

Tài liệu này hướng dẫn cách khởi chạy và xử lý sự cố cho hệ thống E-commerce bao gồm Backend (MedusaJS v2) và Frontend (React/Vite).

## ⚠️ LƯU Ý QUAN TRỌNG VỀ MÔI TRƯỜNG (NODE.JS)
Hiện tại máy bạn đang sử dụng **Node.js v25.3.0**. Đây là phiên bản quá mới, gây lỗi `spawn EBUSY` hoặc `EFTYPE` với công cụ `turbo` của Medusa trên Windows.
**Bạn bắt buộc phải hạ phiên bản Node.js xuống bản LTS:**
- Khuyến nghị sử dụng **Node.js v20.x** hoặc **v18.x**.
- Bạn có thể cài đặt [NVM (Node Version Manager) cho Windows](https://github.com/coreybutler/nvm-windows) để dễ dàng chuyển đổi phiên bản Node.js.
  - Lệnh NVM: `nvm install 20` -> `nvm use 20`

---

## 1. KHỞI CHẠY BACKEND (BẰNG DOCKER - KHUYÊN DÙNG)

Do hệ thống sử dụng Node.js v25 không tương thích trên Windows, chúng ta sử dụng **Docker** để ảo hóa môi trường Node.js v20 riêng biệt cho Backend mà không làm ảnh hưởng tới máy thật.

**Bước 1: Di chuyển vào thư mục backend**
Mở terminal và chạy lệnh:
```bash
cd medusa-backend
```

**Bước 2: Chạy Backend bằng Docker**

- **Lần đầu tiên chạy (hoặc khi có cập nhật thư viện `package.json`):**
  Lệnh này sẽ tải môi trường và cài đặt lại toàn bộ `node_modules`. Quá trình mất khoảng 2-5 phút.
  ```bash
  docker compose up --build
  ```

- **Từ lần chạy thứ 2 trở đi (chạy hằng ngày):**
  Lệnh này khởi động cực nhanh vì đã lưu sẵn môi trường.
  ```bash
  docker compose up
  ```

- Nếu chạy thành công, Terminal sẽ báo Server started ở port 9000.
- Medusa Backend: `http://localhost:9000`
- Admin Dashboard: `http://localhost:9000/app` (hoặc cấu hình tương đương).

**Cách tắt Server:** 
Tại terminal đang chạy Docker, bấm **`Ctrl + C`**. Hoặc mở terminal mới gõ `docker compose down`.

---

## 2. SEED DỮ LIỆU SẢN PHẨM MẪU (PRISMA)

Chúng ta đã tạo sẵn một script Prisma độc lập để chèn 5 sản phẩm Smartphone (iPhone, Samsung, v.v.) trực tiếp vào cơ sở dữ liệu Supabase mà không cần chạy thông qua Medusa CLI, giúp tránh các lỗi biên dịch.

**Bước 1: Di chuyển vào thư mục chứa script**
Mở một terminal MỚI:
```bash
cd scratch/prisma-seed
```

**Bước 2: Cài đặt Prisma (nếu chưa có)**
```bash
npm install
```

**Bước 3: Chạy script tiêm dữ liệu**
```bash
node seed_prisma.js
```
*Script sẽ tự động tìm Sales Channel mặc định và tiêm các biến thể, options, mức giá USD/VND vào Database.*

---

## 3. KHỞI CHẠY FRONTEND (REACT / VITE)

Frontend là giao diện cửa hàng cho người dùng mua sắm.

**Bước 1: Mở terminal tại thư mục gốc của dự án**

**Bước 2: Cài đặt thư viện**
```bash
npm install
```

**Bước 3: Khởi chạy Frontend**
```bash
npm run dev
```
- Giao diện người dùng thường sẽ chạy ở: `http://localhost:5173` (tuỳ thuộc vào Vite).

---

## 4. XỬ LÝ SỰ CỐ THƯỜNG GẶP (TROUBLESHOOTING)

### A. Lỗi kẹt cổng (Port in use) / `spawn EBUSY`
Lỗi này thường do có tiến trình Node.js (như Medusa Backend) bị treo ngầm.
**Cách xử lý:** Mở Command Prompt (cmd) hoặc PowerShell với quyền Admin và chạy:
```powershell
taskkill /F /IM node.exe
```
Lệnh này sẽ dập tắt tất cả các tiến trình Node.js đang treo. Sau đó bạn hãy chạy lại dự án.

### B. Lỗi hỏng bộ nhớ đệm `npm` (Corrupted Lockfile / ENOENT)
Trên Windows, bộ nhớ đệm NPM thỉnh thoảng bị lỗi đọc file.
**Cách xử lý:** Xóa file lock và thư mục `node_modules` ở dự án bị lỗi:
```bash
# Xóa cache npm
npm cache clean --force

# Xóa các file rác (thực hiện qua file explorer hoặc terminal)
rm -rf node_modules
rm package-lock.json

# Cài đặt lại an toàn
npm install --ignore-scripts --no-audit --no-fund --legacy-peer-deps
```

### C. Không kết nối được Database
- Đảm bảo file `medusa-backend/apps/backend/.env` đã chứa chuỗi kết nối chính xác tới Supabase (`DATABASE_URL` và `DIRECT_URL`).
- Kiểm tra kết nối mạng của bạn (Supabase Pooler có thể chặn một số dải IP động hoặc yêu cầu chuẩn IPv4).
