# Tài Liệu Bàn Giao (Handoff) Tích Hợp & Sửa Lỗi GHTK

Tài liệu này tóm tắt toàn bộ các lỗi đã được sửa và tính năng mới đã được triển khai cho đơn vị vận chuyển Giao Hàng Tiết Kiệm (GHTK) trong dự án.

---

## 1. Các Lỗi Đã Khắc Phục (Bug Fixes)

### 🔴 Lỗi 1: Phí vận chuyển GHTK luôn mặc định cố định 30.000đ
- **Nguyên nhân:**
  1. Server backend của dự án thực tế đang chạy từ thư mục trùng lặp: `medusa-backend/backend/apps/backend` thay vì thư mục chính. Thư mục này chứa code mock API cũ trả về giá trị 30k cứng.
  2. API GHTK thiếu cơ chế dịch tên Quận/Huyện/Tỉnh từ client sang định dạng chuẩn của GHTK, khiến yêu cầu gửi lên GHTK bị lỗi và phải dùng giá trị fallback 30k.
- **Giải pháp:**
  - Đồng bộ toàn bộ code sửa lỗi sang thư mục đang hoạt động (`medusa-backend/backend/apps/backend`).
  - Viết bộ **Location Resolver** sử dụng API GHN Master Data để dịch tự động tên Phường/Quận sang tên Quận/Huyện chuẩn được GHTK chấp nhận.
  - Viết hàm `normalizeProvinceForGhtk` để chuẩn hóa định dạng các tỉnh thành lớn (ví dụ: "Thành phố Hồ Chí Minh" -> "TP. Hồ Chí Minh").

### 🔴 Lỗi 2: Phí GHTK tăng vọt lên hơn 100k - 200k cho sản phẩm giá trị lớn
- **Nguyên nhân:**
  - GHTK có chính sách tính phí bảo hiểm hàng hóa bằng **0.5%** giá trị đơn hàng cho các đơn hàng > 3.000.000đ. Với các sản phẩm đắt tiền như điện thoại 31 triệu, phí bảo hiểm này lên tới 157.500đ, đẩy tổng phí ship lên hơn 215.000đ.
- **Giải pháp:**
  - Giới hạn trần giá trị khai giá bảo hiểm gửi sang GHTK tối đa là **5.000.000đ** (tương tự cách GHN đang làm), giúp phí bảo hiểm tối đa chỉ là 25.000đ và tổng phí ship cho đơn hàng đắt tiền giảm xuống mức hợp lý (~83.000đ).

---

## 2. Tính Năng Mới Đã Triển Khai (New Features)

### 🚀 Tích Hợp GHTK Làm Module Fulfillment Provider Chính Thức
Trước đây, GHTK chỉ được gọi bằng API tùy biến bên ngoài, không hiển thị trong quản trị của Medusa. Hiện tại GHTK đã được tích hợp giống hệt GHN:
1. **Tạo Module `ghtk-fulfillment`:**
   - [index.ts](file:///d:/FPT%20Polytechnic/DATN/DATN-Ecommerce-Website/medusa-backend/backend/apps/backend/src/modules/ghtk-fulfillment/index.ts)
   - [service.ts](file:///d:/FPT%20Polytechnic/DATN/DATN-Ecommerce-Website/medusa-backend/backend/apps/backend/src/modules/ghtk-fulfillment/service.ts) (kế thừa `AbstractFulfillmentProviderService`).
2. **Khai báo đăng ký:** Trong [medusa-config.ts](file:///d:/FPT%20Polytechnic/DATN/DATN-Ecommerce-Website/medusa-backend/backend/apps/backend/medusa-config.ts) dưới khóa `fulfillment.providers`.
3. **Liên kết kho hàng tự động:** Đã chạy script liên kết mã nhà cung cấp `ghtk` trực tiếp vào cơ sở dữ liệu (`location_fulfillment_provider`), giúp **Ghtk** xuất hiện chính thức trong Admin Dashboard dưới phần cài đặt Vị trí kho hàng (Stock Location Việt Nam).

---

## 3. Cấu Trúc Thư Mục & Các File Cần Lưu Ý

- **Backend chính (Thư mục thực tế đang chạy):** `medusa-backend/backend/apps/backend`
  - **Module GHTK:** `src/modules/ghtk-fulfillment/`
  - **API Tính phí:** `src/api/store/ghtk/fee/route.ts`
  - **API Đồng bộ đơn hàng:** `src/api/admin/orders/[id]/sync-shipping/route.ts`
  - **Widget Admin:** `src/admin/widgets/OrdersWidget.tsx`
  - **File cấu hình:** `medusa-config.ts` và `.env` (đã khai báo `GHTK_API_TOKEN`).

---

## 4. Debugging Lỗi API GHTK (500 Internal Server Error)

Hiện tại tính năng đẩy đơn hàng sang Giao Hàng Tiết Kiệm (GHTK) đôi khi gặp lỗi **500 Internal Server Error** từ phía API nội bộ của Medusa.
- Trong Admin Dashboard (Widget: `OrdersWidget.tsx`), khi người dùng bấm nút **"Duyệt (GHTK)"**, hệ thống sẽ gửi 1 request `POST` tới API nội bộ: `/admin/orders/:id/sync-shipping`.
- API này sẽ lấy thông tin đơn hàng và đẩy sang GHTK thông qua endpoint tạo đơn của họ.
- **Vấn đề:** GHTK từ chối payload được gửi sang, dẫn đến API của Medusa quăng lỗi và trả về mã lỗi 500. Kéo theo việc xuất kho bị hủy bỏ.
- Đã thêm logic alert popup trong `OrdersWidget.tsx` để hiển thị lỗi chi tiết khi GHTK từ chối đơn hàng để dễ dàng debug.

---

## 5. Hướng Dẫn Kiểm Tra & Cấu Hình Trên Admin
1. **Khởi động lại Server Backend:**
   ```bash
   cd medusa-backend/backend/apps/backend
   npm run dev
   ```
2. **Tạo tùy chọn vận chuyển (Shipping Option) trong Admin:**
   - Vào **Cài đặt** -> **Vị trí & Vận chuyển** -> Chọn **VietNam**.
   - Tại thẻ **Nhà cung cấp giao hàng**, bạn sẽ thấy **Ghtk** đã hiển thị bên cạnh **Ghn**.
   - Nhấn **Tạo tùy chọn** dưới mục Vận chuyển:
     - *Loại giá:* Tính toán (Calculated).
     - *Tên:* Giao Hàng Tiết Kiệm (GHTK).
     - *Shipping option type:* Standard.
     - *Tùy chọn giao hàng:* Giao Hàng Tiết Kiệm (Tiêu Chuẩn).
     - *Bật trong cửa hàng:* Kích hoạt.
