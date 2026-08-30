# Handoff Debugging Lỗi API GHTK (500 Internal Server Error)

Chào bạn,

Hiện tại tính năng đẩy đơn hàng sang Giao Hàng Tiết Kiệm (GHTK) đang gặp lỗi **500 Internal Server Error** từ phía API nội bộ của Medusa. Dưới đây là tóm tắt vấn đề và hướng dẫn để bạn (đồng đội) có thể tiếp tục debug và fix lỗi này.

## 1. Mô tả lỗi
- Trong Admin Dashboard (Widget: `OrdersWidget.tsx`), khi người dùng bấm nút **"Duyệt (GHTK)"**, hệ thống sẽ gửi 1 request `POST` tới API nội bộ: `/admin/orders/:id/sync-shipping`.
- API này sẽ chịu trách nhiệm lấy thông tin đơn hàng và đẩy sang hệ thống của GHTK thông qua endpoint tạo đơn của họ.
- **Vấn đề:** GHTK từ chối payload được gửi sang, dẫn đến API của Medusa quăng lỗi (`throw new Error(...)`) và trả về mã lỗi 500. Kéo theo việc xuất kho (Fulfillment) bị hủy bỏ.

## 2. Các file liên quan cần kiểm tra
1. **Frontend (Widget):** 
   - Đường dẫn: `medusa-backend/apps/backend/src/admin/widgets/OrdersWidget.tsx`
   - *Lưu ý:* AI trước đó đã thêm logic `alert(errText)` vào đây để popup thẳng thông báo lỗi trả về từ API backend lên màn hình. Bạn có thể bấm thử lại nút "Duyệt" trên giao diện để đọc xem chính xác GHTK đang "chê" trường dữ liệu nào.

2. **Backend (API đẩy đơn sang GHTK):** 
   - Đường dẫn: `medusa-backend/apps/backend/src/api/admin/orders/[id]/sync-shipping/route.ts`
   - *Lưu ý:* Trong file này, đoạn fetch sang GHTK:
     ```typescript
     const ghtkRes = await fetch("https://services.giaohangtietkiem.vn/services/shipment/order", { ... })
     ```
     Lỗi 500 sinh ra là do `ghtkRes.ok` là `false` hoặc `ghtkData.success` là `false`.

## 3. Các nguyên nhân phổ biến (Cần check log)
Dựa vào payload chuẩn của GHTK, hãy `console.log(ghtkPayload)` trước khi gửi đi để kiểm tra các lỗi thường gặp sau:
1. **Trọng lượng (weight) không hợp lệ:** GHTK yêu cầu `weight` phải > 0. Nếu trong database Medusa sản phẩm chưa được cài đặt cân nặng, biến này có thể bị truyền sang là `0` hoặc `null`.
2. **Thiếu thông tin địa chỉ lấy hàng (Pick Address):** Các thông số `pick_province`, `pick_district` có thể đang bị thiếu trong `.env` hoặc truyền sai định dạng.
3. **Địa chỉ khách hàng không chuẩn:** Tên tỉnh/thành phố, quận/huyện của khách hàng nhập từ Checkout (Frontend) không khớp với tên chuẩn trong hệ thống GHTK.
4. **Thông tin cơ bản:** Thiếu số điện thoại, thiếu tên người nhận, hoặc giá trị đơn hàng bị sai lệch.

## 4. Hướng giải quyết (Step-by-step)
1. Trên trình duyệt, F5 lại trang Admin và bấm nút **Duyệt (GHTK)** một lần nữa.
2. Một hộp thoại thông báo lỗi (Alert) sẽ hiện lên. Ghi chú lại dòng chữ tiếng Việt trả về từ GHTK là gì (vd: *"Cần cung cấp số điện thoại người nhận"*, *"Địa chỉ lấy hàng không hợp lệ"*).
3. Mở file `sync-shipping/route.ts`, tìm dòng khai báo `const ghtkPayload = ...` và đối chiếu dữ liệu bị sai theo lời phàn nàn của GHTK.
4. Sửa lại logic map dữ liệu cho đúng. Sau khi GHTK chấp nhận đơn, API sẽ tự động chạy tiếp logic tạo Fulfillment và đổi màu trạng thái thành màu xanh.

Chúc bạn fix bug mượt mà!
