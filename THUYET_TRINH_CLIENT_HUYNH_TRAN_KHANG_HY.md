# PHÂN CÔNG THUYẾT TRÌNH - GIAO DIỆN CLIENT (STOREFRONT)
## Người thực hiện: Huỳnh Trần Khang Hỷ

### 🎯 Vai trò chính trong phần Client:
Phụ trách chính về **Hệ thống Đăng ký / Đăng nhập / Quên Mật khẩu Căn bản (Auth Core)**, **Trang Ví Tiền Khách Hàng**, **Thanh Bộ Lọc Giá Động (Dynamic Price Filter)**, **Tóm Tắt Đơn Hàng (Order Summary)** và **Quản lý Session / Đổi mật khẩu**.

---

### 📋 Danh sách Trang & Phần công việc thuyết trình:

#### 1. Hệ thống Xác thực Tài khoản Căn bản (Auth Core UI)
- **Nhiệm vụ liên quan**: `PB-03`, `T-55`, `T-56`, `T-57`, `T-58`
- **Kịch bản thuyết trình**:
  - **Trang Đăng ký & Xác thực OTP Email**: Form đăng ký tài khoản mới bằng Email/SĐT, gửi mã OTP xác nhận về Email và nhập OTP để hoàn tất đăng ký.
  - **Trang Đăng nhập & Xử lý Session JWT**: Form đăng nhập chuẩn, lưu trữ Token/Session an toàn, tự động làm mới phiên làm việc (Refresh Token) và xử lý đăng xuất/xóa phiên khi hết hạn.
  - **Chức năng Quên Mật khẩu / Reset Password**: Gửi link/mã khôi phục mật khẩu qua Email và đặt lại mật khẩu mới.

#### 2. Trang Ví Tiền Khách Hàng (Customer Wallet Page)
- **Nhiệm vụ liên quan**: `T-48`
- **Kịch bản thuyết trình**:
  - **Giao diện Quản lý Số dư Ví**: Hiển thị số dư khả dụng thực tế của tài khoản.
  - **Lịch sử Giao dịch Ví**: Bảng nhật ký chi tiết các lượt nạp tiền, trừ tiền khi thanh toán đơn hàng, và tiền hoàn trả từ các đơn hủy.
  - **Tích hợp thanh toán Ví**: Hướng dẫn thao tác chọn thanh toán bằng số dư Ví khi thực hiện checkout.

#### 3. Thanh Bộ Lọc Giá Động (Dynamic Price Range Filter)
- **Nhiệm vụ liên quan**: `T-62`, `T-79`
- **Kịch bản thuyết trình**:
  - **Dynamic Price Range Slider**: Trình diễn tính năng khoảng giá tự động cập nhật min/max thực tế theo danh mục sản phẩm đang chọn (không dùng range cố định). Đã xử lý triệt để lỗi không cập nhật khoảng giá ở trang Cửa hàng.

#### 4. Trang Tóm tắt Đơn hàng & Review trước Checkout (Order Summary Breakdown)
- **Nhiệm vụ liên quan**: `T-73`
- **Kịch bản thuyết trình**:
  - **Order Summary Component**: Trình diễn giao diện tổng quan đơn hàng trước khi bấm Đặt hàng. Hiển thị rõ ràng chi tiết: Tiền hàng gốc, Số tiền giảm từ Voucher, Phí vận chuyển GHN/GHTK, Số tiền trừ từ Ví và Tổng tiền thanh toán cuối cùng.

#### 5. Đổi Mật Khẩu, Khắc Phục Dữ Liệu So Sánh & Trang Liên Hệ
- **Nhiệm vụ liên quan**: `T-69`, `T-83`, `T-111`, `T-112`
- **Kịch bản thuyết trình**:
  - **Đổi mật khẩu trong Profile**: Form xác nhận mật khẩu cũ và đổi mật khẩu mới an toàn.
  - **Khắc phục mất dữ liệu so sánh (T-83)**: Demo việc danh sách so sánh sản phẩm được lưu giữ an toàn trong LocalStorage/State ngay cả khi F5 refresh trang hoặc đăng xuất.
  - **Trang Liên hệ (Contact Page)**: Giao diện gửi phản hồi/liên hệ tới cửa hàng.
