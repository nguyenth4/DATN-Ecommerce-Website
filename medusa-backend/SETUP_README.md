# 📦 Medusa Backend — Hướng Dẫn Setup & Ghi Chú Nhóm DATN

> **Dự án:** Website Thương Mại Điện Tử — Bán Điện Thoại & Phụ Kiện  
> **Người setup:** Huỳnh Trần Khang Hỷ  
> **Ngày:** 20/06/2026  
> **Phụ trách phần này:** Khang Hỷ (Phần 1: Admin + Phần 4: Checkout/Giao hàng)

---

## 🚨 TRẠNG THÁI HIỆN TẠI (Update 20/06) & VIỆC CẦN LÀM TIẾP THEO

**Tình hình Backend (Khang Hỷ):**
- Đã cài đặt xong Supabase, chạy db:migrate thành công (có đủ bảng), tạo tài khoản Admin (`admin@techstore.com` / `TechStore@2026`).
- **Đang bị kẹt (Blocker):** Chạy `npm run dev` báo lỗi thiếu file `.mjs` của thư viện `react-aria`, `date-fns`. Đang trong quá trình chạy lại `npm install --force` để cài lại dependencies cho sạch. File `medusa-config.ts` đã fix bằng `require()` để tránh lỗi TypeScript.
- **Tiếp theo cho Hỷ:** Sau khi pull code về, mở terminal ở `medusa-backend/backend`, đợi hoặc chạy lại `npm install --force`, sau đó chạy `npm run dev` để bật Admin.

**Tình hình Frontend & Các bạn khác:**
- **Lê Kiều Biên (Trang chủ, Danh sách SP):** Các trang `HomePage.tsx` và `ProductsPage.tsx` đã có UI cơ bản. Bạn có thể bắt đầu gắn logic API nếu Backend chạy lên được (xem hướng dẫn ở dưới).
- **Nguyễn Thị Cẩm Dư (Chi tiết SP):** `ProductDetailPage.tsx` đã có UI. Chờ backend có data để gắn.
- **Trần Hoàng Nguyện (So sánh SP + Admin):**
  - **Trang So Sánh:** Hiện chưa có file `CompareProductsPage.tsx`. Nguyện CẦN TẠO NGAY trang này và setup logic thêm vào list so sánh (lưu localStorage trước).
  - **Medusa Admin:** Hiện tại `/admin` chỉ có trang Dashboard rỗng. Nguyện có thể phụ Hỷ build các component React quản lý UI phụ cho Frontend nếu cần.

---

## 🏗️ Kiến Trúc Tổng Thể

```
medusa-backend/
└── backend/              ← Medusa v2 Backend (tạo mới hoàn toàn)
    ├── src/
    │   ├── modules/      ← Custom modules (Brands, Reviews, GHN...)
    │   └── api/          ← Custom API routes
    ├── .env              ← Biến môi trường (KHÔNG push lên Git!)
    └── medusa-config.ts  ← Cấu hình Medusa
```

**Medusa chạy trên 2 port:**
- `http://localhost:9000` → Storefront API (cho Frontend React gọi)
- `http://localhost:9000/app` → **Admin Dashboard** (nhập liệu sản phẩm thật)

---

## 🗄️ Database — Supabase PostgreSQL

**Connection String:**
```
postgresql://postgres.xeqsnglavqnlkpnqxrdx:duantotnghiep%40123@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres
```

**Trạng thái:**
- ✅ Supabase kết nối thành công (PostgreSQL 17.6)
- ✅ 14 bảng custom ERD đã tồn tại (tạo trước)
- ✅ Medusa migrations chạy thêm các bảng của Medusa (không xóa bảng cũ)

**Lưu ý quan trọng:** Medusa sẽ tạo thêm ~80+ bảng của riêng nó (tiền tố `product`, `order`, `customer`...). Bảng ERD của nhóm (`brands`, `reviews`...) vẫn giữ nguyên để tham khảo.

---

## ERD Database Nhóm

Sơ đồ ERD gồm 14 bảng chính:

| Bảng | Mô tả | Medusa tương đương |
|---|---|---|
| `users` | Người dùng (admin/customer) | `customer`, `user` |
| `addresses` | Địa chỉ giao hàng | `customer_address` |
| `categories` | Danh mục sản phẩm | `product_category` |
| `brands` | Thương hiệu (Apple, Samsung...) | `product_collection` (custom) |
| `products` | Sản phẩm | `product` |
| `productvariants` | Biến thể (màu, RAM, storage) | `product_variant` |
| `productimages` | Ảnh sản phẩm | `product_image` |
| `reviews` | Đánh giá sản phẩm | ❌ Custom module (Medusa chưa có) |
| `carts` | Giỏ hàng | `cart` |
| `cartitems` | Sản phẩm trong giỏ | `line_item` |
| `orders` | Đơn hàng | `order` |
| `orderitems` | Chi tiết đơn hàng | `order_line_item` |
| `payments` | Thanh toán | `payment`, `payment_session` |
| `shipments` | Vận chuyển (GHN) | `fulfillment` (custom provider) |

---

## 🚀 Hướng Dẫn Chạy Backend

### Yêu cầu môi trường
- Node.js v20+ ✅ (đang dùng v22.20.0)
- npm v10+ ✅
- pnpm v10+ ✅ (đã cài global)

### Bước 1: Vào thư mục backend
```bash
cd medusa-backend/backend
```

### Bước 2: Cài dependencies (nếu chưa)
```bash
npm install
```

### Bước 3: Tạo file .env
Tạo file `.env` trong `medusa-backend/backend/` với nội dung:
```env
DATABASE_URL=postgresql://postgres.xeqsnglavqnlkpnqxrdx:duantotnghiep%40123@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require
MEDUSA_BACKEND_URL=http://localhost:9000
JWT_SECRET=datn-techstore-jwt-secret-2026
COOKIE_SECRET=datn-techstore-cookie-secret-2026
ADMIN_CORS=http://localhost:9000,http://localhost:7001
STORE_CORS=http://localhost:5173,http://localhost:3000
AUTH_CORS=http://localhost:9000,http://localhost:5173
REDIS_URL=
```

### Bước 4: Chạy migrations
```bash
npx medusa db:migrate
```

### Bước 5: Tạo tài khoản admin
```bash
npx medusa user -e admin@techstore.com -p TechStore@2026
```

### Bước 6: Khởi động server
```bash
npm run dev
```

### Bước 7: Truy cập Admin
- Mở trình duyệt: `http://localhost:9000/app`
- Đăng nhập: `admin@techstore.com` / `TechStore@2026`

---

## 📱 Nhập Data Điện Thoại Thật Qua Admin UI

Sau khi login vào Admin Dashboard, làm theo thứ tự:

### 1. Tạo Categories (Danh mục)
`Admin > Categories > Create`
- Điện thoại
- Laptop
- Tai nghe
- Smartwatch
- Phụ kiện

### 2. Tạo Regions (Khu vực)
`Admin > Settings > Regions > Create Region`
- Name: Việt Nam
- Currency: VND
- Countries: Vietnam

### 3. Tạo Products (Sản phẩm điện thoại)
`Admin > Products > Create`

**Thông tin sản phẩm cần nhập (ví dụ iPhone 16 Pro):**
```
Title: iPhone 16 Pro
Category: Điện thoại
Description: [mô tả thật từ Apple.com/vn]
Thumbnail: [ảnh thật]

Options:
  - Màu sắc: Titan Đen / Titan Trắng / Titan Sa Mạc / Titan Tự Nhiên
  - Dung lượng: 128GB / 256GB / 512GB / 1TB

Variants (tổ hợp):
  - Titan Đen + 128GB: 28.999.000 VND
  - Titan Đen + 256GB: 31.999.000 VND
  - ...
```

**Danh sách sản phẩm cần nhập (ưu tiên điện thoại trước):**

| STT | Sản phẩm | Biến thể | Giá từ |
|---|---|---|---|
| 1 | iPhone 16 Pro | 4 màu x 4 dung lượng | 28.999.000đ |
| 2 | iPhone 16 | 5 màu x 3 dung lượng | 22.999.000đ |
| 3 | Samsung Galaxy S25 Ultra | 4 màu x 3 dung lượng | 31.990.000đ |
| 4 | Samsung Galaxy S25+ | 3 màu x 2 dung lượng | 24.990.000đ |
| 5 | Samsung Galaxy A55 5G | 3 màu x 2 dung lượng | 9.490.000đ |
| 6 | Xiaomi 14T Pro | 3 màu x 2 dung lượng | 17.990.000đ |
| 7 | Xiaomi Redmi Note 14 | 4 màu x 3 dung lượng | 6.490.000đ |
| 8 | OPPO Find X8 | 3 màu x 2 dung lượng | 22.990.000đ |
| 9 | OPPO Reno 12 | 3 màu x 2 dung lượng | 9.990.000đ |
| 10 | Vivo V30e | 2 màu x 2 dung lượng | 8.490.000đ |

---

## 🔗 API Endpoints Quan Trọng (Cho Frontend)

Frontend React (`src/client/services/`) sẽ gọi các API này:

```
GET  http://localhost:9000/store/products              → Danh sách sản phẩm
GET  http://localhost:9000/store/products/:id          → Chi tiết sản phẩm
GET  http://localhost:9000/store/products?q=iphone     → Tìm kiếm
GET  http://localhost:9000/store/product-categories    → Danh mục
POST http://localhost:9000/store/carts                 → Tạo giỏ hàng
POST http://localhost:9000/store/carts/:id/line-items  → Thêm vào giỏ
POST http://localhost:9000/store/carts/:id/complete    → Đặt hàng
GET  http://localhost:9000/store/orders/:id            → Chi tiết đơn hàng
```

**Publishable API Key** (lấy từ Admin > Settings > Publishable API Keys):
- Phải thêm header: `x-publishable-api-key: pk_xxxx` vào mọi request

---

## 💳 Phần 4: Checkout / Giao hàng / Thanh toán Online

**Trách nhiệm:** Khang Hỷ

### Luồng Checkout (Medusa Checkout Flow):
```
1. Tạo Cart → POST /store/carts
2. Thêm items → POST /store/carts/:id/line-items  
3. Nhập địa chỉ → POST /store/carts/:id (shipping_address)
4. Chọn shipping → POST /store/carts/:id/shipping-methods
5. Chọn payment → POST /store/payment-sessions
6. Thanh toán → PUT /store/payment-sessions/:id
7. Hoàn tất → POST /store/carts/:id/complete
```

### Thanh toán Online cần tích hợp:
- **COD:** Có sẵn trong Medusa (manual payment provider)
- **VNPay:** Cần cài thêm plugin hoặc tự custom
- **MoMo:** Cần tự custom payment provider

### Giao hàng GHN:
- Cài plugin: `medusa-fulfillment-shiprocket` hoặc custom GHN provider
- API GHN: `https://dev-online-gateway.ghn.vn/shiip/public-api/`
- Thông tin `ghn_order_code` lưu vào bảng `shipments`

---

## 📝 Ghi Chú Cho Các Thành Viên Khác

### Cho Lê Kiều Biên (Phần 2 - ProductsPage):
1. Cài Medusa JS SDK: `npm install @medusajs/js-sdk`
2. Sửa `src/client/services/product.service.ts`:
```typescript
import Medusa from "@medusajs/js-sdk"
const medusa = new Medusa({ 
  baseUrl: "http://localhost:9000",
  publishableKey: "pk_xxxx" // lấy từ Admin Settings
})
```
3. Gọi API: `medusa.store.product.list({ limit: 12, offset: 0 })`

### Cho Nguyễn Thị Cẩm Dư (Phần 3 - ProductDetailPage):
1. Dùng URL param: `const { id } = useParams()`
2. Gọi: `medusa.store.product.retrieve(id)`
3. Biến thể: `product.variants` — mỗi variant có `options` (màu, storage, ram)
4. Reviews: Medusa chưa có sẵn → cần custom module hoặc dùng bảng `reviews` trong Supabase trực tiếp

### Cho Trần Hoàng Nguyện (Phần 5 - So sánh):
1. Dữ liệu compare lấy từ `product.metadata` (custom fields)
2. Lưu compare list vào `localStorage`
3. API: Gọi nhiều `medusa.store.product.retrieve(id)` song song với `Promise.all`

---

## ⚠️ Lưu Ý Bảo Mật

- **KHÔNG** push file `.env` lên GitHub
- File `.env` đã được thêm vào `.gitignore`
- Supabase password: `duantotnghiep@123` (chỉ dùng nội bộ nhóm)
- Medusa Admin: `admin@techstore.com` / `TechStore@2026`

---

## 📋 Checklist Tiến Độ

### Phần 1 — Medusa Admin (Khang Hỷ)
- [x] Cài đặt pnpm global
- [x] Tạo Medusa v2 backend với Supabase
- [x] Cấu hình DATABASE_URL, CORS
- [ ] Chạy migrations thành công
- [ ] Tạo tài khoản admin
- [ ] Tạo Region Việt Nam (VND)
- [ ] Tạo Categories (Điện thoại, Laptop...)
- [ ] Nhập 10 sản phẩm điện thoại thật với biến thể đầy đủ
- [ ] Lấy Publishable API Key → gửi cho cả nhóm
- [ ] Custom module: Brands (thương hiệu)
- [ ] Custom module: Reviews (đánh giá)
- [ ] Tích hợp GHN Shipping Provider

### Phần 4 — Checkout/Giao hàng (Khang Hỷ)
- [ ] Kết nối Medusa Cart API vào CartPage.tsx
- [ ] Implement Checkout flow 3 bước
- [ ] Form địa chỉ với API tỉnh/quận/xã VN
- [ ] Hiển thị shipping options (GHN/GHTK)
- [ ] Tích hợp COD payment
- [ ] Tích hợp VNPay payment
- [ ] OrderSuccessPage hiển thị đúng

---

*Cập nhật README này sau mỗi lần hoàn thành task để nhóm nắm tiến độ.*
