# Handoff: Chức năng Checkout & Tích hợp GHN/GHTK

## 1. Mục tiêu (Mục đích nhánh `feature/checkout`)
Hoàn thiện luồng Checkout (Thanh toán), bao gồm:
- Tính phí vận chuyển (Shipping Fee) tự động và có tuỳ chọn (Nhanh / Tiết kiệm).
- Tích hợp tính toán khối lượng và kích thước động từ giỏ hàng.
- Xử lý luồng tạo Order (từ phía Frontend đến Backend API).
- Sử dụng Subscriber `order.placed` (thay cho `order.created` trên bản Medusa v2) để trừ tồn kho (Inventory), thanh toán (Payment) và đẩy vận đơn sang giao hàng (GHN SOC).

## 2. Chi tiết các thay đổi đã thực hiện

### 2.1. Phía Frontend (`src/client/pages/CheckoutPage.tsx`)
- **Quản lý dữ liệu giỏ hàng động**: Bổ sung các trường `weight`, `height`, `length`, `width` cho các sản phẩm trong giỏ hàng. Dùng hàm `reduce` để tính `totalWeight`, `totalHeight`, `maxLength`, `maxWidth` và `insuranceValue` thay vì hard-code.
- **Tính phí vận chuyển**: Tự động gọi API `POST http://localhost:9000/store/ghn/fee` mỗi khi người dùng thay đổi Quận/Huyện, Phường/Xã. 
- **Lựa chọn dịch vụ vận chuyển**: 
  - Thêm xử lý để khi người dùng chọn "Giao hàng Nhanh", hệ thống gửi `service_type_id: 2`.
  - Khi chọn "Giao hàng Tiết kiệm", hệ thống gửi `service_type_id: 5` để lấy 2 mức giá khác nhau. 
  - Có cơ chế fallback: Nếu API báo lỗi hoặc khu vực không hỗ trợ mức giá Tiết kiệm, hệ thống sẽ set mặc định về 25,000đ hoặc 35,000đ.
- **Tích hợp API Checkout**: Cập nhật hàm `handlePlaceOrder` để bắn payload về API `POST /store/checkout`. Xử lý chuyển hướng đến trang thanh toán VNPay nếu nhận được URL `paymentUrl` từ Backend trả về.

### 2.2. Phía Backend (Medusa Framework)
- **API `/store/checkout`**: Được khởi tạo tại `medusa-backend/apps/backend/src/api/store/checkout/route.ts` nhằm đóng vai trò nhận request từ Frontend, validation giỏ hàng và mock trả về link payment.
- **Subscriber `order.placed`**: Được tạo tại `medusa-backend/apps/backend/src/subscribers/order-placed.ts`. Luồng xử lý nền:
  1. Ghi log xử lý Inventory.
  2. Ghi log xử lý Payment.
  3. Quét các item trong order để tính lại khối lượng (`totalWeight`).
  4. POST lên cổng `https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create` (GHN SOC API) để tạo vận đơn tự động.

## 3. Trạng thái hiện tại
- Nhánh làm việc: `feature/checkout`
- Toàn bộ thay đổi đã được add và commit đầy đủ trên nhánh cục bộ của bạn.
- Cả Frontend React và Backend Medusa đều có code đồng bộ và hoạt động khớp với nhau về flow dữ liệu.

## 4. Hướng dẫn Test/Chạy thử
1. Mở 2 terminal.
2. Terminal 1 (Backend): 
   ```bash
   cd medusa-backend/apps/backend
   npm run dev 
   ```
3. Terminal 2 (Frontend):
   ```bash
   npm run dev # Chạy vite React (tại thư mục gốc)
   ```
4. Truy cập giao diện giỏ hàng, tiến hành điền thông tin địa chỉ.
5. Quan sát Network tab hoặc Console:
   - Khi đổi địa chỉ/tỉnh/phường, sẽ có 1 request gọi sang `http://localhost:9000/store/ghn/fee` để báo cước Nhanh/Tiết kiệm.
   - Khi chọn đổi Giao hàng Nhanh / Tiết kiệm, giá sẽ tự nhảy tự động theo API.
   - Khi ấn Đặt hàng, 1 request POST đi sang `http://localhost:9000/store/checkout`.

## 5. Next steps (Cần làm tiếp)
- **API GHN/GHTK**: Nếu muốn dùng GHTK thực thụ, bạn sẽ cần tạo thêm route `/store/ghtk/fee` và `/store/ghtk/soc` ở Backend, sau đó ở Frontend gán URL endpoint tương ứng khi chọn GHTK thay vì lấy giá trị mô phỏng proxy qua GHN.
- **Cấu hình Cart & Order Medusa SDK**: Trong route `checkout/route.ts`, hãy bổ sung hoàn chỉnh bằng các module chính thống của Medusa `cartService`, `orderService` để tạo đơn thật xuống DB nếu team muốn xài hoàn toàn core Medusa cho phần Orders.
- **Env variables**: Đảm bảo add ENV cho `GHN_TOKEN`, `GHN_SHOP_ID` ở `.env` của backend để API tạo vận đơn hoạt động được.
