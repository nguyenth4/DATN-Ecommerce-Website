# 🚀 Hướng Dẫn Kiểm Thử (Testing Guide) Thanh Toán ZaloPay

Tài liệu này hướng dẫn chi tiết các kịch bản kiểm thử quy trình thanh toán qua **ZaloPay (Sandbox)** cho dự án DATN E-Commerce.

---

## 1. ⚙️ Cấu Hình Biến Môi Trường (`.env`)

Mở file `.env` ở thư mục root backend (`medusa-backend/apps/backend/.env`) và xác nhận/thêm các biến cấu hình ZaloPay Sandbox như sau:

```env
# ZaloPay Sandbox Credentials
ZALOPAY_APP_ID=2553
ZALOPAY_KEY1=Pc94W2rvqAee8DhF2rBegigwkgho0AcZ
ZALOPAY_KEY2=kLTL2wsB2h4DJ2gES0wYNv0DtBjW1MGi
ZALOPAY_ENDPOINT=https://sb-openapi.zalopay.vn/v2/create
ZALOPAY_RETURN_URL=http://localhost:9000/store/payment/zalopay/callback

# Frontend URL
STORE_FRONTEND_URL=http://localhost:5173
```

---

## 2. 🧪 Các Kịch Bản Test (Test Cases)

### 🔹 Kịch bản 1: Thanh toán ZaloPay trực tiếp trên Frontend (End-to-End UI Test)

1. **Khởi động ứng dụng**:
   - Backend (Medusa): `npm run dev` (Port `9000`)
   - Frontend (Vite): `npm run dev` (Port `5173`)
2. **Thực hiện đặt hàng**:
   - Truy cập `http://localhost:5173/products`
   - Chọn sản phẩm, chọn Variant và bấm **Thêm vào giỏ hàng**.
   - Vào **Giỏ hàng** -> bấm **Thanh toán** (`/checkout`).
   - Điền đầy đủ thông tin giao hàng (Họ tên, SĐT, Địa chỉ).
   - Tại mục **Phương thức thanh toán**, chọn **Thanh toán qua ZaloPay**.
   - Bấm **Đặt hàng**.
3. **Kết quả mong đợi**:
   - Hệ thống chuyển hướng đến cổng thanh toán ZaloPay Sandbox (`https://sb-openapi.zalopay.vn/...`).
   - Sau khi hoàn tất hoặc dùng kết quả Sandbox, hệ thống tự động gọi về Backend Callback (`/store/payment/zalopay/callback`).
   - Backend chuyển hướng về trang Frontend `http://localhost:5173/checkout/zalopay_return?apptransid=...&status=1`.
   - Màn hình hiển thị thông báo **"Thanh toán ZaloPay thành công!"** và tự động chuyển về danh sách đơn hàng trong Tài khoản.

---

### 🔹 Kịch bản 2: Test API Backend bằng Postman / cURL

Nếu muốn test trực tiếp API Checkout không qua UI:

**Endpoint**: `POST http://localhost:9000/store/checkout`  
**Headers**: `Content-Type: application/json`

**Payload**:
```json
{
  "paymentMethod": "zalopay",
  "totalAmount": 150000,
  "customer": {
    "fullName": "Nguyen Van A",
    "phoneNumber": "0912345678",
    "email": "testzalopay@gmail.com"
  },
  "address": "123 Đường Lê Lợi, Q.1, TP.HCM",
  "items": [
    {
      "id": "variant_01...",
      "title": "Áo Thun Nam Premium",
      "price": 150000,
      "qty": 1
    }
  ]
}
```

**Kết quả trả về mong đợi**:
```json
{
  "message": "Checkout initiated successfully",
  "data": { ... },
  "orderId": "order_1724856000000",
  "paymentUrl": "https://sb-openapi.zalopay.vn/v2/create/..."
}
```

---

### 🔹 Kịch bản 3: Test Callback & Cập Nhật Trạng Thái Đơn Hàng (Offline / Sandbox Test)

Khi ZaloPay Sandbox chuyển hướng về URL Callback:

**Endpoint Test Callback**:
```http
GET http://localhost:9000/store/payment/zalopay/callback?apptransid=260828_order_1724856000000&status=1&amount=150000
```

**Kết quả mong đợi**:
1. Server log hiển thị: `[ZaloPay Callback] ✅ Payment SUCCESS for order: 260828_order_...`
2. Đơn hàng phát sự kiện `order.placed` cho hệ thống vận chuyển GHN & gửi thông báo.
3. Server trả về mã HTTP `302 Redirect` tới:
   `http://localhost:5173/checkout/zalopay_return?apptransid=...&status=1&amount=150000`

---

## 3. 📱 Thông Tin Tài Khoản ZaloPay Sandbox Test

Khi được chuyển hướng đến cổng ZaloPay Sandbox, sử dụng ứng dụng ZaloPay Sandbox hoặc thông tin thẻ giả lập:

- **Ứng dụng**: ZaloPay Sandbox (Android / iOS)
- **Thẻ ATM Sandbox**:
  - Ngân hàng: NCB / Vietinbank / Vietcombank (Sandbox)
  - Số thẻ: `9704198526191432198`
  - Tên chủ thẻ: `NGUYEN VAN A`
  - Ngày phát hành: `07/15`
  - Mật khẩu OTP: `123456`

---

## 4. ✅ Bảng Kiểm Tra Kết Quả (Checklist)

- [ ] Tạo order nhận được `paymentUrl` hợp lệ chứa domain `zalopay.vn`.
- [ ] Màn hình `ZaloPayReturnPage` hiển thị thành công khi `status=1`.
- [ ] Đơn hàng trong `localStorage` / CSDL được cập nhật `payment_status: paid`.
- [ ] Số lượng tồn kho (inventory) bị trừ đúng số lượng đã đặt.
