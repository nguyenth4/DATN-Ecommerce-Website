# 📋 Handoff — Session 2026-08-11 (Đã cập nhật)

## Nhánh hiện tại: `nguyentest`

---

## ✅ Những gì đã hoàn thành

### 1. ProductsPage (`src/client/pages/ProductsPage.tsx`)
- Xóa toolbar và bộ lọc rườm rà ở sidebar.
- Thêm 2 nút lọc giá: **Giá Thấp - Cao** và **Giá Cao - Thấp**.
- Chuyển dải danh mục lên đầu trang, tự động lấy từ DB.
- Sửa lỗi phân trang mất đồng bộ: Chuyển sang client-side sorting/pagination.
- Thêm hiệu ứng cuộn lên đầu trang mượt mà khi đổi trang.
- Bỏ 2 danh mục "Laptop" và "Điện thoại" khỏi UI.

### 2. HomePage (`src/client/pages/HomePage.tsx`)
- **Fix lỗi mất section "Dành cho bạn"**: Thay vì lấy mảng rỗng khi chưa có lịch sử, code sẽ lấy 4 sản phẩm ngẫu nhiên khác với nhóm "Thịnh hành" để luôn có sản phẩm hiển thị.

### 3. HomePageProductCard & ProductsPage (Fix Hardcode)
- **Tồn kho & Sao đánh giá**: Xóa bỏ dữ liệu giả (10 SP, 5 sao).
- **Fix hiển thị kho hàng**: Medusa v2 có thể trả về `inventory_quantity: 0` khi lỗi cấu hình Stock. Logic mới kiểm tra cờ `manage_inventory` để hiển thị:
  - Nếu tắt quản lý kho → "Còn hàng"
  - Có hàng → "Còn hàng · [X] sản phẩm"
  - `manage_inventory` bật + 0 SP → Vẫn dự phòng hiện "Còn hàng" tránh gây hoang mang.

---

## 🛠 Lỗi đang còn (Đã fix code nhưng cần thao tác server)

### 1. Lỗi Medusa Admin Trắng Trang (`exports is not defined`)
**Nguyên nhân:** File `medusa-config.ts` đang dùng cú pháp CommonJS (`module.exports = defineConfig(...)`). Admin của Medusa v2 được build bằng Vite (vốn chỉ hỗ trợ chuẩn ESM - `export default`).
**Đã làm:** Tôi đã sửa `module.exports` thành `export default` trong `medusa-config.ts`.
**CẦN LÀM:** 
1. Bạn **phải tắt terminal đang chạy backend** (Ctrl + C).
2. Xóa thư mục `.medusa` nếu muốn chắc chắn: `Remove-Item -Recurse -Force ".medusa"` trong thư mục `apps/backend`.
3. Chạy lại `npm run dev` và đợi Vite build lại admin (1-2 phút).

### 2. Kho Hàng Có Sản Phẩm Nhưng Client Lấy Được 0 (inventory_quantity = 0)
**Nguyên nhân:** Stock Location (kho) chưa kết nối với Sales Channel.
**CẦN LÀM:**
1. Mở Medusa Admin → **Vị trí & Vận chuyển (Locations)** → Chọn kho của bạn.
2. Tab **Kênh bán hàng (Sales Channels)** → Click **Add** → Chọn kênh "Default Sales Channel".
3. Mọi thứ sẽ tự động hiển thị đúng.

### 3. Có 2 "Default Sales Channel"
- Trong Admin → Kênh bán hàng đang bị lặp 2 kênh. Hãy kiểm tra xem kênh nào đang chứa Publishable API Key của storefront thì giữ lại, xóa kênh kia đi để tránh lỗi khi gán kho hàng.

---

*Handoff cập nhật lúc 2026-08-11 23:28 (GMT+7)*
