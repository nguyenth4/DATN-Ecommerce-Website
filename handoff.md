# Handoff: Chức năng Checkout & Tích hợp GHN/GHTK

## 1. Mục tiêu (Mục đích nhánh `feature/checkout`)
Hoàn thiện luồng Checkout (Thanh toán), bao gồm:
- Tính phí vận chuyển (Shipping Fee) tự động và có tuỳ chọn (Nhanh / Tiết kiệm).
- Tích hợp tính toán khối lượng và kích thước động từ giỏ hàng.
- Xử lý luồng tạo Order (từ phía Frontend đến Backend API).
- Sử dụng Subscriber `order.placed` (thay cho `order.created` trên bản Medusa v2) để trừ tồn kho (Inventory), thanh toán (Payment) và đẩy vận đơn sang giao hàng (GHN SOC).

## 2. Chi tiết các thay đổi đã thực hiện

### 2.1. Phía Frontend (`src/client/pages/CheckoutPage.tsx` & `CartPage.tsx`)
- **Quản lý dữ liệu giỏ hàng động**: Bổ sung các trường `weight`, `height`, `length`, `width` cho các sản phẩm trong giỏ hàng. Dùng hàm `reduce` để tính tổng kích thước và khối lượng thay vì hard-code.
- **Tính phí vận chuyển trên Giỏ hàng (Mới)**: Thêm 3 ô chọn địa chỉ (Tỉnh/Huyện/Xã) vào trang Giỏ hàng (`CartPage.tsx`) để khách hàng tự "Tính phí vận chuyển" dự kiến qua API GHN trước khi sang trang Thanh toán.
- **Tính phí vận chuyển trên Checkout**: Tự động gọi API `POST http://localhost:9000/store/ghn/fee` mỗi khi người dùng thay đổi Quận/Huyện, Phường/Xã. 
- **Gỡ bỏ Fallback Giá Cứng**: Cả trang Cart và Checkout đều đã gỡ bỏ hoàn toàn việc fallback về mức giá cứng 25.000đ hay 35.000đ. Hệ thống chỉ hiển thị phí nếu gọi API thành công theo khoảng cách thực tế, ngược lại hiển thị "Chưa tính".
- **Lựa chọn dịch vụ vận chuyển**: Phân biệt Giao hàng Nhanh (`service_type_id: 2`) và Giao hàng Tiết kiệm (`service_type_id: 5`).
- **Tích hợp API Checkout**: Cập nhật hàm `handlePlaceOrder` bắn payload về API `POST /store/checkout`. Xử lý chuyển hướng đến trang thanh toán VNPay nếu nhận được URL `paymentUrl`.

### 2.2. Phía Backend (Medusa Framework & Docker)
- **API `/store/checkout`**: Được khởi tạo tại `medusa-backend/apps/backend/src/api/store/checkout/route.ts` nhằm nhận request từ Frontend, validation giỏ hàng và trả về link payment.
- **Subscriber `order.placed`**: Được tạo tại `medusa-backend/apps/backend/src/subscribers/order-placed.ts` để xử lý Inventory, Payment và gọi API GHN SOC tạo vận đơn tự động.
- **Fix lỗi Admin Path (Medusa v2)**: Đổi `admin.path` từ `/admin` sang `/app` trong `medusa-config.ts` do v2 cấm sử dụng `/admin`.
- **Fix lỗi Vite trên Docker**: Ép Vite chạy Admin ở cổng cố định `0.0.0.0:7001`, expose port `7001` trong `docker-compose.yml`, và xử lý triệt để lỗi xung đột bộ nhớ đệm (cache `.medusa`) khi chuyển ổ đĩa bằng cách đổi tên thư mục `src/admin/i18n` thành `i18n_bak`.

## 3. Trạng thái hiện tại
- Nhánh làm việc: `feature/checkout`
- Toàn bộ thay đổi đã được add và commit đầy đủ trên nhánh cục bộ của bạn.
- Cả Frontend React và Backend Medusa đều có code đồng bộ và hoạt động khớp với nhau về flow dữ liệu.

## 4. Hướng dẫn Test/Chạy thử (Fix Node v25 bug)
1. Do bạn đang sử dụng Node v25, lệnh `turbo` sẽ gây lỗi `os error 193`. Vì vậy BẮT BUỘC dùng Docker cho Backend. Mở 2 terminal.
2. Terminal 1 (Backend): 
   ```bash
   cd medusa-backend
   docker compose up --build
   ```
   - Chờ hệ thống khởi động và chạy xong `Server is ready on port: 9000`.
   - Truy cập Admin: `http://localhost:9000/app` (admin@techstore.com / TechStore@2026).
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

## 6. Cập nhật mới (Tích hợp thanh toán)
- **Cổng thanh toán & Callback**: Đã bổ sung giả lập tạo URL thanh toán cho 3 ví/cổng ngoại vi: `MoMo`, `ZaloPay`, và `VNPay` tại `POST /store/checkout`.
- **API Callback**: Đã tạo đầy đủ 3 API route xử lý Callback trả về (GET) cho `momo`, `vnpay`, `zalopay` tại `api/store/payment/[gateway]/callback/route.ts`. Khi nhận được Callback thành công, hệ thống tự động phát event `order.placed` với `payment_status: "paid"` và chuyển hướng về trang Frontend `http://localhost:5173/order-success`.
- **Thanh toán Nội bộ (COD & Ví Sprylo)**: Đã tích hợp đủ 5 phương thức. Riêng `cod` và `wallet` không qua cổng thanh toán ngoài. API Checkout sẽ trực tiếp cập nhật `payment_status` là `"pending"` (với COD) hoặc `"paid"` (với Ví nội bộ), đồng thời phát event `order.placed`.

## 7. Cập nhật mới (Đẩy đơn vận chuyển Giao Hàng Nhanh)
- **Thay đổi luồng đẩy vận đơn**: Đã vô hiệu hóa tính năng tự động tạo vận đơn bên trong Subscriber `order.placed` nhằm đảm bảo đơn hàng chưa được xác nhận sẽ không bị đẩy nhầm sang hệ thống GHN.
- **Tạo API cho Seller xác nhận đơn**: Xây dựng endpoint mới dành cho Admin/Seller tại `POST /admin/orders/:id/sync-shipping`.
- **Chức năng API**: Khi Admin kích hoạt API này, hệ thống sẽ gom dữ liệu đơn hàng (trọng lượng, số lượng, địa chỉ...) gọi sang GHN API để khởi tạo Vận đơn (Shipping Order). Sau đó tiến hành lấy `order_code` trả về từ GHN và lưu vào metadata của order Medusa dưới trường `tracking_code`.
# Handoff: Chức năng Checkout & Tích hợp GHN/GHTK

## 1. Mục tiêu (Mục đích nhánh `feature/checkout`)
Hoàn thiện luồng Checkout (Thanh toán), bao gồm:
- Tính phí vận chuyển (Shipping Fee) tự động và có tuỳ chọn (Nhanh / Tiết kiệm).
- Tích hợp tính toán khối lượng và kích thước động từ giỏ hàng.
- Xử lý luồng tạo Order (từ phía Frontend đến Backend API).
- Sử dụng Subscriber `order.placed` (thay cho `order.created` trên bản Medusa v2) để trừ tồn kho (Inventory), thanh toán (Payment) và đẩy vận đơn sang giao hàng (GHN SOC).

## 2. Chi tiết các thay đổi đã thực hiện

### 2.1. Phía Frontend (`src/client/pages/CheckoutPage.tsx` & `CartPage.tsx`)
- **Quản lý dữ liệu giỏ hàng động**: Bổ sung các trường `weight`, `height`, `length`, `width` cho các sản phẩm trong giỏ hàng. Dùng hàm `reduce` để tính tổng kích thước và khối lượng thay vì hard-code.
- **Tính phí vận chuyển trên Giỏ hàng (Mới)**: Thêm 3 ô chọn địa chỉ (Tỉnh/Huyện/Xã) vào trang Giỏ hàng (`CartPage.tsx`) để khách hàng tự "Tính phí vận chuyển" dự kiến qua API GHN trước khi sang trang Thanh toán.
- **Tính phí vận chuyển trên Checkout**: Tự động gọi API `POST http://localhost:9000/store/ghn/fee` mỗi khi người dùng thay đổi Quận/Huyện, Phường/Xã. 
- **Gỡ bỏ Fallback Giá Cứng**: Cả trang Cart và Checkout đều đã gỡ bỏ hoàn toàn việc fallback về mức giá cứng 25.000đ hay 35.000đ. Hệ thống chỉ hiển thị phí nếu gọi API thành công theo khoảng cách thực tế, ngược lại hiển thị "Chưa tính".
- **Lựa chọn dịch vụ vận chuyển**: Phân biệt Giao hàng Nhanh (`service_type_id: 2`) và Giao hàng Tiết kiệm (`service_type_id: 5`).
- **Tích hợp API Checkout**: Cập nhật hàm `handlePlaceOrder` bắn payload về API `POST /store/checkout`. Xử lý chuyển hướng đến trang thanh toán VNPay nếu nhận được URL `paymentUrl`.

### 2.2. Phía Backend (Medusa Framework & Docker)
- **API `/store/checkout`**: Được khởi tạo tại `medusa-backend/apps/backend/src/api/store/checkout/route.ts` nhằm nhận request từ Frontend, validation giỏ hàng và trả về link payment.
- **Subscriber `order.placed`**: Được tạo tại `medusa-backend/apps/backend/src/subscribers/order-placed.ts` để xử lý Inventory, Payment và gọi API GHN SOC tạo vận đơn tự động.
- **Fix lỗi Admin Path (Medusa v2)**: Đổi `admin.path` từ `/admin` sang `/app` trong `medusa-config.ts` do v2 cấm sử dụng `/admin`.
- **Fix lỗi Vite trên Docker**: Ép Vite chạy Admin ở cổng cố định `0.0.0.0:7001`, expose port `7001` trong `docker-compose.yml`, và xử lý triệt để lỗi xung đột bộ nhớ đệm (cache `.medusa`) khi chuyển ổ đĩa bằng cách đổi tên thư mục `src/admin/i18n` thành `i18n_bak`.

## 3. Trạng thái hiện tại
- Nhánh làm việc: `feature/checkout`
- Toàn bộ thay đổi đã được add và commit đầy đủ trên nhánh cục bộ của bạn.
- Cả Frontend React và Backend Medusa đều có code đồng bộ và hoạt động khớp với nhau về flow dữ liệu.

## 4. Hướng dẫn Test/Chạy thử (Fix Node v25 bug)
1. Do bạn đang sử dụng Node v25, lệnh `turbo` sẽ gây lỗi `os error 193`. Vì vậy BẮT BUỘC dùng Docker cho Backend. Mở 2 terminal.
2. Terminal 1 (Backend): 
   ```bash
   cd medusa-backend
   docker compose up --build
   ```
   - Chờ hệ thống khởi động và chạy xong `Server is ready on port: 9000`.
   - Truy cập Admin: `http://localhost:9000/app` (admin@techstore.com / TechStore@2026).
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

## 6. Cập nhật mới (Tích hợp thanh toán)
- **Cổng thanh toán & Callback**: Đã bổ sung giả lập tạo URL thanh toán cho 3 ví/cổng ngoại vi: `MoMo`, `ZaloPay`, và `VNPay` tại `POST /store/checkout`.
- **API Callback**: Đã tạo đầy đủ 3 API route xử lý Callback trả về (GET) cho `momo`, `vnpay`, `zalopay` tại `api/store/payment/[gateway]/callback/route.ts`. Khi nhận được Callback thành công, hệ thống tự động phát event `order.placed` với `payment_status: "paid"` và chuyển hướng về trang Frontend `http://localhost:5173/order-success`.
- **Thanh toán Nội bộ (COD & Ví Sprylo)**: Đã tích hợp đủ 5 phương thức. Riêng `cod` và `wallet` không qua cổng thanh toán ngoài. API Checkout sẽ trực tiếp cập nhật `payment_status` là `"pending"` (với COD) hoặc `"paid"` (với Ví nội bộ), đồng thời phát event `order.placed`.

## 7. Cập nhật mới (Đẩy đơn vận chuyển Giao Hàng Nhanh)
- **Thay đổi luồng đẩy vận đơn**: Đã vô hiệu hóa tính năng tự động tạo vận đơn bên trong Subscriber `order.placed` nhằm đảm bảo đơn hàng chưa được xác nhận sẽ không bị đẩy nhầm sang hệ thống GHN.
- **Tạo API cho Seller xác nhận đơn**: Xây dựng endpoint mới dành cho Admin/Seller tại `POST /admin/orders/:id/sync-shipping`.
- **Chức năng API**: Khi Admin kích hoạt API này, hệ thống sẽ gom dữ liệu đơn hàng (trọng lượng, số lượng, địa chỉ...) gọi sang GHN API để khởi tạo Vận đơn (Shipping Order). Sau đó tiến hành lấy `order_code` trả về từ GHN và lưu vào metadata của order Medusa dưới trường `tracking_code`.

## 8. Cập nhật mới (Cải thiện UI/UX)
- **Hệ thống Toast Notification**: Tích hợp thư viện `react-hot-toast` vào `App.tsx` để cung cấp các thông báo (toast) nhất quán, thiết kế đẹp mắt. Đã áp dụng hiển thị toast khi thêm/xoá So sánh sản phẩm và khi Gửi đánh giá (Review) thành công/thất bại.
- **Skeleton Loader (Trang Danh Sách)**: Tạo `ProductCardSkeleton` thay thế vòng xoay Loading cũ, hiển thị dưới dạng lưới mô phỏng các thẻ sản phẩm với hiệu ứng Shimmer mượt mà, giúp cấu trúc layout không bị giật lag khi chờ API tải.
- **Skeleton Loader (Trang Chi Tiết)**: Tạo `ProductDetailSkeleton` mô phỏng chính xác bố cục lưới (hình ảnh lớn, tiêu đề, nút bấm) của trang Chi tiết Sản phẩm.

## 9. Cập nhật mới (Quản lý tồn kho / Inventory)
- **Trừ kho khi Seller xác nhận**: Đã bổ sung logic trừ số lượng tồn kho (inventory_quantity) của từng Product Variant vào trong API `POST /admin/orders/:id/sync-shipping`. Khi Seller/Admin duyệt đẩy đơn, hệ thống không chỉ gọi sang GHN mà còn tự động tính toán trừ kho các mặt hàng có trong đơn.
- **Rollback khi huỷ đơn (Canceled)**: Đã tạo thêm Subscriber `order-canceled.ts` lắng nghe event `order.canceled`. Nếu đơn hàng bị huỷ, hệ thống sẽ tự động hoàn trả (cộng lại) số lượng tồn kho tương ứng của các variant bị huỷ. Đồng thời chuẩn bị sẵn block code để bắn API huỷ vận đơn bên GHN nếu cần.

## 10. Cập nhật mới (Công thức vận chuyển & Phí bảo hiểm)
- **Truyền đúng thông số vào API GHN**: Tại trang Checkout, hệ thống đã gom nhóm giỏ hàng để tự động tính tổng trọng lượng (weight), kích thước lớn nhất (length, width, height) và giá trị giỏ hàng (insurance_value) để đẩy sang endpoint `/store/ghn/fee`.
- **Hiển thị Breakdown rõ ràng**: Phí trả về từ GHN API được bóc tách rõ ràng. Trong phần tóm tắt đơn hàng (Order Summary) trên giao diện, chi phí được hiển thị tách biệt: **Phí vận chuyển** (service_fee) và **Phí bảo hiểm hàng hoá** (insurance_fee). Điều này giúp minh bạch cước vận chuyển cho khách hàng.
