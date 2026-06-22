# HANDOFF — DATN E-Commerce Website
> Cập nhật lần cuối: 2026-06-22

---

## 1. TỔNG QUAN DỰ ÁN

| Thành phần | Công nghệ | Trạng thái |
|-----------|-----------|-----------|
| Frontend | React 18 + Vite + TypeScript | ✅ Hoạt động |
| Backend | MedusaJS v2.16 (Node.js 20) | ✅ Hoạt động (Docker đang build) |
| Database | Supabase PostgreSQL | ✅ Đã cấu hình |
| UI Template | HTML/CSS đã migrate sang React | ✅ Hoàn tất |

---

## 2. MÔI TRƯỜNG

### Node.js trên máy Host
- **Phiên bản hiện tại:** v26.3.0 (npm 11.16.0)
- **Lưu ý:** Node v26 quá mới, MedusaJS backend yêu cầu `>=20`. Backend được chạy qua **Docker (Node 20-alpine)** để đảm bảo tương thích.

### Docker
- **Phiên bản:** Docker 29.2.1
- **Trạng thái:** Đang hoạt động
- Image backend: `node:20-alpine` (đã tải sẵn trong Docker cache)

---

## 3. CẤU TRÚC THƯ MỤC

```
DATN-Ecommerce-Website/
├── src/                        # Frontend React/Vite
│   ├── client/
│   │   ├── pages/              # Các trang: Home, Product, Cart, Checkout...
│   │   ├── components/         # Header, Footer, ProductCard, Sidebar...
│   │   ├── layouts/            # ClientLayout.tsx
│   │   ├── routes/             # index.tsx (React Router)
│   │   ├── controllers/        # useProductController.ts
│   │   ├── models/             # mockData.ts
│   │   ├── services/           # product.service.ts
│   │   └── styles/             # custom.css
│   ├── shared/lib/             # medusa.ts (Medusa JS client)
│   ├── index.css               # Global styles (từ shopflow-ui template)
│   └── main.tsx                # Entry point
├── medusa-backend/             # Backend MedusaJS v2
│   ├── apps/backend/
│   │   ├── .env                # Biến môi trường (DATABASE_URL, secrets...)
│   │   ├── medusa-config.ts    # Cấu hình Medusa
│   │   └── src/                # Source backend
│   ├── Dockerfile.dev          # Docker build config (Node 20-alpine)
│   └── docker-compose.yml      # Docker Compose config
├── public/                     # Static assets
├── index.html                  # Vite entry HTML
├── package.json                # Frontend deps
└── vite.config.ts              # Vite config
```

---

## 4. DATABASE — SUPABASE

| Thông số | Giá trị |
|---------|---------|
| Provider | Supabase (AWS ap-northeast-1) |
| Project ID | `xeqsnglavqnlkpnqxrdx` |
| Session Pooler (port 6543) | `postgresql://postgres.xeqsnglavqnlkpnqxrdx:***@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| Direct URL (port 5432) | `postgresql://postgres.xeqsnglavqnlkpnqxrdx:***@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres` |
| Password | `duantotnghiep@123` |

Cấu hình trong: `medusa-backend/apps/backend/.env`

---

## 5. CÁCH CHẠY DỰ ÁN

### Frontend (React/Vite)
```powershell
# Tại thư mục gốc
npm run dev
# → http://localhost:5173
```

### Backend (MedusaJS via Docker)
```powershell
# Di chuyển vào thư mục backend
cd medusa-backend

# Lần đầu (hoặc khi đổi package.json) — mất ~5-10 phút (tùy mạng)
docker compose up --build

# Từ lần 2 trở đi — nhanh hơn nhiều
docker compose up
```
- Backend: `http://localhost:9000`
- Admin Dashboard: `http://localhost:9000/app`

### Tắt server
```powershell
# Tại terminal Docker
Ctrl + C

# Hoặc tại terminal mới
docker compose down
```

---

## 6. CORS ĐÃ CẤU HÌNH

| Biến | Giá trị |
|-----|---------|
| `STORE_CORS` | `http://localhost:8000` |
| `ADMIN_CORS` | `http://localhost:5173, http://localhost:9000` |
| `AUTH_CORS` | `http://localhost:5173, http://localhost:9000, http://localhost:8000` |

---

## 7. LỖI THƯỜNG GẶP & CÁCH XỬ LÝ

### Docker npm install bị ETIMEDOUT
Mạng chậm khi Docker tải packages. Đã sửa trong `Dockerfile.dev` bằng cách tăng timeout:
- `fetch-timeout`: 600000ms (10 phút)
- `fetch-retries`: 5 lần
- Nếu vẫn lỗi: thử lại bằng `docker compose up --build` (Docker sẽ resume từ layer đã cache)

### Port bị chiếm (EADDRINUSE)
```powershell
taskkill /F /IM node.exe
```

### Lỗi node_modules hỏng
```powershell
npm cache clean --force
Remove-Item -Recurse -Force node_modules
npm install --legacy-peer-deps
```

---

## 8. TRẠNG THÁI PHÁT TRIỂN (22/06/2026)

- [x] Frontend React migrate từ HTML template (shopflow-ui)
- [x] Routing: Home, Products, Product Detail, Cart, Checkout, Account, Login, Register, Order Success, Order Tracking, Comparison, Contact
- [x] Layout: ClientLayout (Header + Footer dùng chung)
- [x] MedusaJS backend setup với Supabase
- [x] Docker environment cho backend
- [ ] Kết nối Frontend ↔ Backend API (đang phát triển)
- [ ] Seed dữ liệu sản phẩm thực
- [ ] Authentication flow hoàn chỉnh
