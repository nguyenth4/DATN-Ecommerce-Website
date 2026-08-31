# Handoff Ghi chú: Fix lỗi GHTK/GHN (500 & 400 Errors)

Chào đồng đội, hiện tại quy trình đồng bộ đơn hàng sang GHTK và GHN trên Widget Admin đang gặp lỗi ở hai bước `sync-shipping` (trả về 500) và `fulfillments` (trả về 400). File này tổng hợp các vấn đề cần kiểm tra và hướng xử lý tiếp theo.

## Các Lỗi Đang Gặp Phải
1. **[Error] 500 (Internal Server Error) tại `sync-shipping`**:
   - **Mô tả**: Khi click nút "Duyệt (GHTK)" hoặc "Duyệt (GHN)", API `/admin/orders/:id/sync-shipping` ném lỗi 500.
   - **Nguyên nhân tiềm năng**: 
     - Thiếu cấu hình API Key (`GHTK_API_TOKEN` hoặc `GHN_API_TOKEN`) trên server.
     - Dữ liệu địa chỉ của đơn hàng (Tỉnh/Thành, Quận/Huyện) không khớp với định dạng mà GHTK/GHN yêu cầu.
     - Payload gửi lên đối tác vận chuyển thiếu trường bắt buộc (ví dụ: số điện thoại, tên khách hàng, mã phường xã).
     - Đối với GHN, có thể chưa truyền `ward_code` hoặc `district_id` hợp lệ.
2. **[Error] 400 (Bad Request) tại `fulfillments`**:
   - **Mô tả**: Medusa API `/admin/orders/:id/fulfillments` trả về lỗi 400.
   - **Nguyên nhân tiềm năng**:
     - Lỗi 500 ở trên có thể làm gián đoạn quy trình trước khi gọi đến `fulfillments`.
     - Medusa v2 yêu cầu một payload fulfillment chính xác, có thể đang thiếu thông tin về `location_id` (nếu multi-warehouse được bật), hoặc trạng thái đơn hàng hiện tại không cho phép fulfill (ví dụ: đã fulfill rồi hoặc chưa payment).
     - Số lượng sản phẩm truyền vào để fulfill (`items: [{ id, quantity }]`) có thể không đúng hoặc vượt quá số lượng unfulfilled của đơn hàng.

## Hướng Khắc Phục (Next Steps)
1. **Kiểm tra Logs Backend**:
   - Mở terminal chạy backend Medusa (`medusa-backend`).
   - Khi click nút Duyệt, xem lỗi in ra trong console của `medusa-backend` tại file `medusa-backend/apps/backend/src/api/admin/orders/[id]/sync-shipping/route.ts` để biết chính xác API GHTK/GHN báo lỗi gì (như "Tỉnh/Thành không tồn tại" hoặc "Token không hợp lệ").
2. **Xác minh Địa Chỉ**:
   - Đảm bảo form checkout ở Storefront gửi đúng `province`, `city` (quận/huyện) và lưu vào order address.
   - GHTK rất khắt khe về format tên Tỉnh/Quận. Hãy kiểm tra hàm `normalizeProvinceForGhtk` và xem dữ liệu gửi đi có chính xác không.
3. **Sửa Code (nếu cần)**:
   - Trong `sync-shipping/route.ts`, bổ sung log chi tiết `console.log("GHN Response:", data)` hoặc catch error kỹ hơn.
   - Trong `OrdersWidget.tsx`, kiểm tra lại đoạn fetch `/admin/stock-locations` để lấy `location_id` xem có thành công không trước khi gọi `/fulfillments`.
4. **Vấn đề Đơn Hàng Cũ**:
   - Tôi đã cập nhật `OrdersWidget.tsx` để lọc và ẩn đi các đơn hàng cũ (không có `metadata.shipping_method`). Các đơn mới đặt qua Checkout mới hiển thị ở đây.

Cố gắng kiểm tra log server trước tiên nhé, lỗi thường do sai thông tin địa chỉ hoặc thiếu Token!
