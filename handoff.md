# Handoff: Tích hợp Giao Hàng Nhanh (GHN) vào MedusaJS V2

## 1. Mục tiêu
Tích hợp đơn vị vận chuyển Giao Hàng Nhanh (GHN) vào hệ thống backend MedusaJS (phiên bản V2). 
Mục tiêu là tự động tính toán phí vận chuyển (Shipping Fee) dựa trên khối lượng giỏ hàng, kích thước từng sản phẩm và địa chỉ nhận hàng của khách, từ đó hiển thị chính xác phí giao hàng trên trang Checkout.

## 2. Chi tiết các thay đổi đã thực hiện

### 2.1. Cấu hình biến môi trường
- Bổ sung 3 biến môi trường bắt buộc vào file `apps/backend/.env`:
  - `GHN_API_URL`: URL API của GHN (hiện tại dùng `https://dev-online-gateway.ghn.vn/shiip/public-api/v2` để test).
  - `GHN_API_TOKEN`: Mã token định danh tài khoản.
  - `GHN_SHOP_ID`: ID cửa hàng trên hệ thống GHN.

### 2.2. Khởi tạo Fulfillment Module V2
- Vì Medusa V2 sử dụng kiến trúc Module, nên đã tạo mới thư mục `apps/backend/src/modules/ghn-fulfillment`.
- **`index.ts`**: Khai báo Module sử dụng `ModuleProvider` và `Modules.FULFILLMENT`.
- **`service.ts`**: 
  - Kế thừa class `AbstractFulfillmentProviderService`.
  - Khởi tạo phương thức `getFulfillmentOptions()` để trả về 2 tùy chọn vận chuyển hiển thị trên Admin: "Giao Hàng Nhanh (Tiêu Chuẩn)" (ID: 2) và "Giao Hàng Nhanh (Hàng Nặng)" (ID: 5).
  - Viết logic cho hàm `calculatePrice()`:
    - Bóc tách địa chỉ giao hàng (`district_id`, `ward_code`) từ `context.shipping_address.metadata`.
    - Duyệt qua `context.items` để tự động tính tổng khối lượng (`totalWeight`), tổng chiều cao (`sumHeight`), và chiều dài/rộng lớn nhất để đóng gói. (Có giá trị dự phòng/fallback nếu sản phẩm quên nhập kích thước).
    - Dùng thư viện `axios` gọi tới API tính phí của GHN. Có cấu trúc Catch Error trả về 30.000đ phí đồng giá trong trường hợp gọi GHN thất bại để chống "sập" giỏ hàng.

### 2.3. Đăng ký Module
- Đã đăng ký `ghn-fulfillment` module vào khối `fulfillment` trong file `apps/backend/medusa-config.ts`.

## 3. Trạng thái hiện tại
- Backend đã sẵn sàng cung cấp phương thức tính phí vận chuyển động.
- Provider mang tên `ghn` đã xuất hiện trong danh sách Fulfillment Providers tại màn hình Admin của Medusa.

## 4. Next steps (Đề xuất cần làm tiếp)
- **Frontend / Storefront**: Cập nhật form nhập địa chỉ giao hàng để map mã Phường/Xã và Quận/Huyện của GHN, sau đó lưu vào `metadata` của địa chỉ giao hàng để backend đọc được.
- **Tạo Đơn Hàng (Create Order)**: Sau khi Đồ án Tốt nghiệp ổn định phần tính phí, cần phát triển thêm hàm `createFulfillment()` trong `service.ts` để khi admin ấn nút "Giao hàng", hệ thống tự động bắn request sang GHN tạo mã vận đơn thực tế.

---

# Handoff: Tính năng Gợi ý Sản phẩm (Product Recommendation)

Tài liệu này tổng hợp lại các công việc đã thực hiện để xây dựng tính năng **Gợi ý sản phẩm cá nhân hóa** cho dự án DATN E-commerce (MedusaJS v2 Backend + React/Vite Frontend).

## 1. Tổng quan Công việc Đã hoàn thành

Luồng tính năng từ Backend đến Frontend đã được hoàn thiện để hệ thống có thể theo dõi hành vi người dùng và đưa ra các gợi ý sản phẩm phù hợp.

### Backend (Medusa v2)
*Đường dẫn: `medusa-backend/backend/apps/backend`*

- **Custom Module `recommendationModuleService`**: 
  - Khởi tạo entity `Interaction` bằng DML (`model.define`) để lưu vết các hành vi: `VIEW` (xem), `CART` (thêm giỏ hàng), `PURCHASE` (mua hàng).
  - Viết logic xử lý trong `RecommendationModuleService` để lọc ra các sản phẩm đã xem hoặc tính toán gợi ý cơ bản dựa trên `customer_id` hoặc `session_id`.
- **Custom APIs**:
  - `POST /store/interactions`: API nhận dữ liệu tracking từ Frontend.
  - `GET /store/recommendations`: API trả về danh sách sản phẩm gợi ý (có sử dụng Medusa Query Graph để lấy kèm thông tin `variants`, `prices`, `images`...).
- **Cấu hình**: Đã đăng ký thành công module vào `medusa-config.ts`.

### Frontend (React / Vite)
*Đường dẫn: `src/client`*

- **API & Hooks (`src/client/services/product.service.ts`)**: 
  - Tích hợp hàm `trackInteraction()` và `getRecommendedProducts()` dùng Medusa JS SDK (`medusa.client.fetch`).
  - Viết custom hook `useRecommendedProducts` kết hợp với React Query để tự động caching và fetch dữ liệu mượt mà.
- **Tracking Hành vi (`ProductDetailPage.tsx`)**:
  - Tích hợp logic chạy ngầm: Mỗi khi user vào xem thành công một trang chi tiết sản phẩm, hệ thống tự động bắn API `POST /store/interactions` kèm `session_id` để ghi nhận sự kiện `VIEW`.
- **Hiển thị UI (`HomePage.tsx`)**:
  - Cập nhật mục **"Dành cho bạn"** (For you) để hiển thị danh sách sản phẩm động lấy từ API gợi ý thay vì hiển thị dữ liệu cắt ngẫu nhiên như trước. Nếu hệ thống chưa có dữ liệu lịch sử của người dùng, giao diện sẽ fallback về sản phẩm ngẫu nhiên.

---

## 2. Các tệp tin đã thay đổi / tạo mới

**Backend:**
- `+ src/modules/recommendation/models/interaction.ts`
- `+ src/modules/recommendation/service.ts`
- `+ src/modules/recommendation/index.ts`
- `+ src/api/store/interactions/route.ts`
- `+ src/api/store/recommendations/route.ts`
- `~ medusa-config.ts` (Thêm config module)

**Frontend:**
- `~ src/client/services/product.service.ts`
- `~ src/client/pages/HomePage.tsx`
- `~ src/client/pages/ProductDetailPage.tsx`

---

## 3. Các bước tiếp theo cần thực hiện (Next Steps)

Để đảm bảo dự án chạy trơn tru, bạn cần thực hiện các thao tác sau:

1. **Chạy Migration Database**:
   Do có bảng `interaction` mới, bạn cần tạo bảng này dưới database:
   ```bash
   cd "medusa-backend/backend/apps/backend"
   npx medusa db:migrate
   ```

2. **Kiểm thử (Testing)**:
   - Khởi động lại Backend và Frontend (`npm run dev`).
   - Mở giao diện bằng trình duyệt ẩn danh (Incognito).
   - Truy cập vào trang chủ (Lúc này mục "Dành cho bạn" sẽ hiển thị sản phẩm mặc định).
   - Click vào xem 1-2 sản phẩm ngẫu nhiên.
   - Quay lại trang chủ, kiểm tra xem mục "Dành cho bạn" đã ưu tiên hiển thị các sản phẩm vừa xem hay chưa.

3. **Hướng phát triển mở rộng (Dành cho Đồ án nâng cao)**:
   - **Xử lý sự kiện CART / PURCHASE**: Hiện tại đang bắt sự kiện VIEW ở trang chi tiết. Bạn có thể chèn thêm `trackInteraction(id, 'CART')` vào nút "Thêm vào giỏ" ở component `ProductInfo.tsx`.
   - **Nâng cấp thuật toán**: Bạn có thể sửa file `RecommendationModuleService` ở backend để tích hợp thuật toán **Collaborative Filtering** (Tìm các sản phẩm thường được mua cùng nhau trong các order cũ) thay vì chỉ lấy lịch sử đã xem.
   - **Cronjob**: Tham khảo tính năng *Scheduled Jobs* của Medusa để tính toán trước dữ liệu gợi ý vào ban đêm nhằm tối ưu tốc độ API.

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
