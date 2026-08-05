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