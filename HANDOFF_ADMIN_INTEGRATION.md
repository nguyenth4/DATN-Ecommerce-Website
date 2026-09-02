# HANDOFF: Tích hợp Admin – Client & Đồng bộ Tài khoản

**Ngày:** 01/09/2026  
**Phạm vi:** Admin account setup, Admin ↔ Client navigation, Avatar sync, Email update  

---

## 1. Tổng quan công việc đã thực hiện

| STT | Hạng mục | Trạng thái |
|-----|----------|-----------|
| 1 | Tạo tài khoản Admin (`sprylo123@gmail.com`) đồng thời làm Customer | ✅ Hoàn thành |
| 2 | Thêm nút chuyển Admin → Client vào Sidebar Medusa Admin | ✅ Hoàn thành |
| 3 | Tự động đăng nhập tài khoản Admin khi chuyển sang Client | ✅ Hoàn thành |
| 4 | Hiển thị nút "Admin" trên Header Client khi đăng nhập bằng tài khoản admin | ✅ Hoàn thành |
| 5 | Sửa lỗi ảnh avatar Google không hiển thị (thêm `referrerPolicy="no-referrer"`) | ✅ Hoàn thành |
| 6 | Thay thế toàn bộ `support@sprylo.vn` → `sprylo123@gmail.com` | ✅ Hoàn thành |

---

## 2. Tài khoản Admin đã tạo

| Thông tin | Giá trị |
|-----------|---------|
| **Email** | `sprylo123@gmail.com` |
| **Mật khẩu** | `@dmin12345678` |
| **Trang Admin** | `http://localhost:9000/app` |
| **Trang Client** | `http://localhost:5174/login` |
| **User ID (admin)** | `user_01M1DMHKJN6ERKHEPZ8N4S72W6` |
| **Customer ID** | `cus_d23d96df01ebf296cdf74c54` |

> ⚠️ Tài khoản này hoạt động **đồng thời** ở cả hai vai trò:
> - **Admin**: đăng nhập `http://localhost:9000/app` quản lý hệ thống
> - **Customer**: đăng nhập `http://localhost:5174/login` mua hàng như user thường

---

## 3. Chi tiết thay đổi code

### 3.1 Script tạo tài khoản DB

**File:** `medusa-backend/backend/apps/backend/scripts/create_admin.js`

Script Node.js tạo/cập nhật tài khoản admin bằng cách:
1. Hash mật khẩu dùng `scrypt-kdf` (chuẩn Medusa v2)
2. Tạo bản ghi `user` (admin)
3. Tạo bản ghi `customer` (client)
4. Cập nhật `auth_identity` + `provider_identity` liên kết cả hai
5. Hợp nhất `user_id` và `customer_id` vào cùng một `auth_identity` để dùng chung mật khẩu

```bash
# Chạy lại nếu cần reset mật khẩu admin
node scripts/create_admin.js
```

---

### 3.2 Sidebar Admin → "Xem Cửa hàng (Client)"

**Files:**
- `medusa-backend/backend/apps/backend/src/admin/routes/storefront/page.tsx` *(NEW)*
- `medusa-backend/apps/backend/src/admin/routes/storefront/page.tsx` *(NEW)*

Sử dụng `defineRouteConfig` của Medusa Admin SDK để tạo mục điều hướng trên Sidebar Admin.  
Khi bấm, trang Client mở tab mới với query `?admin_sync=true`:

```tsx
export const config = defineRouteConfig({
  label: "Xem Cửa hàng (Client)",
});
```

Khi mở tab mới có `?admin_sync=true`, `AdminSyncHandler` trong `App.tsx` tự động:
1. Đăng nhập tài khoản `sprylo123@gmail.com` qua `/auth/customer/emailpass`
2. Fetch profile từ `/store/customers/me`
3. Fetch avatar từ `/store/custom/auth-identity` (lấy ảnh Google nếu có)
4. Lưu vào `localStorage` (`customer_token` + `customer_info`)
5. Dispatch `customer-auth-change` để Header cập nhật ngay lập tức

---

### 3.3 Nút "Admin" trên Header Client

**File:** `src/client/components/Header.tsx`

Khi đăng nhập bằng tài khoản `sprylo123@gmail.com` trên Client, xuất hiện nút Admin:

```tsx
{customerInfo.email === 'sprylo123@gmail.com' && (
  <a href="http://localhost:9000/app" target="_blank" ...>
    <ShieldCheck size={14} style={{ color: '#38bdf8' }} />
    <span>Admin</span>
  </a>
)}
```

---

### 3.4 Sửa lỗi ảnh Google Avatar

**Files:** `src/client/components/Header.tsx`, `src/client/pages/AccountPage.tsx`

**Nguyên nhân lỗi:** Google CDN chặn request có header `Referer` từ domain khác (403 Forbidden).  
**Giải pháp:** Thêm `referrerPolicy="no-referrer"` vào tất cả `<img>` hiển thị avatar Google.

```tsx
<img
  src={avatarUrl}
  alt="Avatar"
  referrerPolicy="no-referrer"
  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
/>
```

---

### 3.5 Cập nhật email liên hệ

Thay thế `support@sprylo.vn` → `sprylo123@gmail.com` trong **7 file**:

| File | Vị trí |
|------|--------|
| `src/client/pages/ContactPage.tsx` | Trang Liên hệ (href mailto + text hiển thị) |
| `medusa-backend/backend/apps/backend/src/subscribers/send-welcome-email.ts` | Email chào mừng |
| `medusa-backend/backend/apps/backend/src/api/admin/orders/controller.ts` | Email xác nhận đơn hàng (backend) |
| `medusa-backend/apps/backend/src/subscribers/order-placed.ts` | Email đặt hàng thành công |
| `medusa-backend/apps/backend/src/subscribers/send-welcome-email.ts` | Email chào mừng (bản song song) |
| `medusa-backend/apps/backend/src/subscribers/password-reset.ts` | Email reset mật khẩu |
| `medusa-backend/apps/backend/src/api/admin/orders/controller.ts` | Controller đơn hàng (bản song song) |

---

## 4. Luồng hoạt động Admin ↔ Client

```
Admin (localhost:9000/app)
        │
        │ Bấm "Xem Cửa hàng (Client)" trên Sidebar
        ▼
Client (localhost:5174/?admin_sync=true)
        │
        ├── AdminSyncHandler detect: admin_sync=true
        ├── POST /auth/customer/emailpass (sprylo123@gmail.com)
        ├── GET /store/customers/me → lấy thông tin customer
        ├── GET /store/custom/auth-identity → lấy avatar_url
        ├── Lưu customer_token + customer_info vào localStorage
        ├── Dispatch 'customer-auth-change' → Header re-render
        └── Toast: "Đã đồng bộ đăng nhập tài khoản Admin"

Client (localhost:5174) - đã đăng nhập
        │
        │ Header hiển thị nút "Admin 🛡️" (chỉ với sprylo123@gmail.com)
        ▼
Admin (localhost:9000/app) - mở tab mới
```

---

## 5. Cấu trúc file mới tạo/sửa trong session này

```
src/
└── App.tsx                             ← Thêm AdminSyncHandler

src/client/
├── components/
│   └── Header.tsx                      ← Thêm nút Admin, sửa avatar referrerPolicy
└── pages/
    ├── ContactPage.tsx                 ← Đổi email
    └── AccountPage.tsx                 ← Sửa avatar referrerPolicy

medusa-backend/backend/apps/backend/
├── scripts/
│   └── create_admin.js                 ← NEW: Script tạo tài khoản admin
├── src/admin/
│   └── routes/storefront/page.tsx     ← NEW: Sidebar link
└── src/admin/widgets/
    └── OrdersWidget.tsx                ← Thêm zone order.list.before

medusa-backend/apps/backend/
└── src/admin/
    └── routes/storefront/page.tsx     ← NEW: Sidebar link (bản song song)
```

---

## 6. Lưu ý quan trọng

> [!WARNING]
> **Avatar Admin chưa có nếu chưa login Google:**  
> Tài khoản `sprylo123@gmail.com` được tạo bằng script thủ công nên không có ảnh đại diện Google trong DB.  
> Để có avatar, cần đăng nhập 1 lần qua nút **"Đăng nhập với Google"** trên trang Client (`/login`).  
> Sau lần đó, avatar sẽ được lưu vào `customer.metadata.avatar_url` và tự đồng bộ.

> [!NOTE]
> **Hai backend song song:**  
> Dự án duy trì 2 đường dẫn backend (`medusa-backend/apps/backend` và `medusa-backend/backend/apps/backend`).  
> Tất cả thay đổi đã được áp dụng cho cả hai. Khi thêm file mới trong tương lai, nhớ copy sang cả 2 vị trí.

> [!TIP]
> **Reset mật khẩu admin:**  
> Nếu cần đổi mật khẩu admin, cập nhật biến `rawPassword` trong script rồi chạy lại:
> ```bash
> cd medusa-backend/backend/apps/backend
> node scripts/create_admin.js
> ```
