# Dự án Frontend Ecommerce (TechStore)

Dự án này là giao diện Frontend cho website thương mại điện tử chuyên bán điện thoại và phụ kiện công nghệ. 
Dự án được xây dựng theo kiến trúc **MVC**, tách biệt hoàn toàn Client và Admin, sẵn sàng để tích hợp Backend (NodeJS + MedusaJS) và MySQL trong tương lai.

## 🚀 Công nghệ sử dụng
- **Lõi:** React, TypeScript, Vite.
- **Routing:** React Router v6.
- **UI/UX:** Vanilla CSS (CSS thuần, hỗ trợ CSS variables), Framer Motion (hiệu ứng mượt mà), Lucide React (bộ icon).
- **Tính năng:** Hỗ trợ giao diện sáng/tối (Dark Mode / Light Mode).

---

## 🛠 Hướng dẫn cài đặt và chạy dự án

### Yêu cầu môi trường
- Đã cài đặt **Node.js** (Khuyên dùng bản LTS từ v18 trở lên).
- Trình quản lý gói **npm** (được cài mặc định cùng Node.js).

### Các bước khởi chạy

**Bước 1:** Mở Terminal (hoặc Command Prompt, PowerShell) và điều hướng vào thư mục dự án `D:\FPT Polytechnic\DATN\DATN`. Nếu bạn đang dùng VS Code, hãy mở Terminal tích hợp bằng phím tắt `` Ctrl + ` ``.

**Bước 2:** Cài đặt các thư viện cần thiết bằng lệnh:
```bash
npm install
```

**Bước 3:** Khởi động máy chủ phát triển (Development Server):
```bash
npm run dev
```

**Bước 4:** Truy cập ứng dụng qua trình duyệt:
- Sau khi chạy lệnh trên, Terminal sẽ hiển thị đường link local (thường là `http://localhost:5173`).
- **Trang dành cho khách hàng (Client):** `http://localhost:5173/`
- **Trang quản trị viên (Admin Dashboard):** `http://localhost:5173/admin`

---

## 📁 Cấu trúc thư mục cốt lõi

```
src/
├── client/          # Chứa toàn bộ logic và giao diện cho Khách Hàng (Người dùng cuối)
│   ├── models/      # Định nghĩa kiểu dữ liệu (types/interfaces) và dữ liệu mô phỏng (mock data)
│   ├── views/       # (Tùy chọn) Giao diện tĩnh nếu tách biệt component
│   ├── controllers/ # React Hooks tùy chỉnh để xử lý logic, gọi service (MVC Controller)
│   ├── components/  # Các component tái sử dụng (Header, Footer, ProductCard...)
│   ├── layouts/     # Bố cục trang web (ClientLayout)
│   ├── pages/       # Các trang chính (HomePage, ProductDetails...)
│   ├── routes/      # Định tuyến riêng cho Client
│   └── services/    # Logic giao tiếp với API hoặc Mock Data
│
├── admin/           # Chứa toàn bộ logic và giao diện cho Quản Trị Viên (Dashboard)
│   └── ...          # (Cấu trúc tương tự như Client)
│
├── shared/          # Các thành phần dùng chung cho cả Client và Admin
│   ├── components/  # (Ví dụ: ThemeProvider)
│   ├── hooks/
│   ├── constants/
│   ├── utils/
│   └── types/
│
└── assets/          # Tài nguyên tĩnh như hình ảnh, CSS chung...
```

---

## 💡 Lưu ý khi phát triển tiếp
- Các dữ liệu sản phẩm, doanh thu hiện tại đang được lấy từ thư mục `models/mockData.ts` và được xử lý qua `services` để giả lập thời gian phản hồi API.
- Khi có Backend thực tế, bạn chỉ cần thay đổi code trong thư mục `services` (sử dụng thư viện Axios hoặc Fetch) mà **không cần** đụng tới các phần logic ở UI (Views/Pages).
- Theme được lưu trong `localStorage` bằng context `ThemeProvider` ở mục `shared`. Tự động áp dụng các biến CSS (`--primary-color`, `--bg-color`...) định nghĩa trong `src/index.css`.
