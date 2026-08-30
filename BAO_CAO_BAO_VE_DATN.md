# Kịch Bản & Lưu Ý Thuyết Trình Bảo Vệ Đồ Án Tốt Nghiệp
**Sinh viên thực hiện:** Lê Kiều Biên  
**Phụ trách:** Giao diện Client (Storefront)  
**Tên dự án:** Website Thương mại Điện tử Bán lẻ Thiết bị Công nghệ (Sprylo - Apple products)

---

## I. TỔNG QUAN PHẦN THUYẾT TRÌNH CỦA LÊ KIỀU BIÊN

Dưới đây là kịch bản chi tiết và những lưu ý "sống còn" bạn cần nắm để báo cáo tốt nhất phần việc của mình trước Hội đồng:

### 1. Giao diện Chung & Chuẩn hoá UI
- **Nội dung Demo:** Giới thiệu nhanh Layout tổng thể (Header, Footer). Nhấn mạnh việc sử dụng **Font Roboto** nhất quán và **Việt hóa 100% UI** (từ nút bấm, nhãn, đến thông báo lỗi).
- **Điểm cần nhấn mạnh:** "Dạ nhóm em đặc biệt chú trọng UX/UI. Mọi thông báo lỗi đều được Việt hoá thân thiện thay vì để nguyên log tiếng Anh của hệ thống, giúp khách hàng dễ hiểu nhất."
- **Câu hỏi Hội đồng có thể hỏi:** *Làm sao để đảm bảo tính responsive trên mobile?*
  - **Trả lời:** Em sử dụng CSS/Grid và Flexbox kết hợp Media Queries để giao diện tự động co giãn. (Có thể thu nhỏ trình duyệt để demo ngay).

### 2. Trang Chủ (Home Page)
- **Nội dung Demo:** 
  - Trình chiếu Hero Banner (nơi thu hút ánh nhìn đầu tiên).
  - Trình chiếu khối "Mua sắm theo danh mục" (khẳng định đã fix lỗi hình ảnh khớp với category).
  - Khối "Sản phẩm nổi bật/Trending".
- **Điểm cần nhấn mạnh:** "Để tăng trải nghiệm người dùng không bị giật lag khi tải trang, em đã áp dụng hiệu ứng **Skeleton Loader** trong lúc chờ gọi API."
- **Câu hỏi Hội đồng có thể hỏi:** *Skeleton Loader hoạt động như thế nào? Dữ liệu trang chủ có bị chậm không?*
  - **Trả lời:** Skeleton Loader là các khối xám nhấp nháy mô phỏng cấu trúc UI. Nó hiển thị ngay lập tức khi component mount, trong lúc `useEffect` đang call API (fetch data). Khi data trả về, state thay đổi và Skeleton sẽ được thay thế bằng dữ liệu thật.

### 3. Trang Danh sách Sản phẩm (Cửa hàng)
- **Nội dung Demo:**
  - Demo bộ lọc Sidebar (Còn hàng / Giảm giá / Mới).
  - Thử tính năng sắp xếp: Giá tăng/giảm, Phổ biến.
  - Phân trang (Pagination) và Skeleton.
- **Điểm cần nhấn mạnh:** Filter và Sắp xếp là thao tác rất hay dùng. Bạn cần thao tác thật mượt đoạn này.
- **Câu hỏi Hội đồng có thể hỏi:** *Bộ lọc và phân trang này em xử lý ở Frontend hay gọi API xuống Backend?*
  - **Trả lời:** Em xử lý gọi API truyền query parameters xuống Backend. Backend sẽ tính toán trả về số lượng đúng của trang đó (limit/offset) để tối ưu hiệu suất, thay vì tải toàn bộ ngàn sản phẩm về Client rồi mới lọc.

### 4. Trang Chi tiết Sản phẩm
- **Nội dung Demo:** Chọn màu sắc, dung lượng -> Quan sát Giá tiền, Tồn kho (Stock) và Hình ảnh đại diện thay đổi tương ứng.
- **Điểm cần nhấn mạnh:** Sự tương tác tức thời (Real-time UX) khi đổi biến thể (Variants) mà không cần load lại trang.
- **Câu hỏi Hội đồng có thể hỏi:** *Làm sao để đổi hình ảnh khi người dùng bấm vào biến thể?*
  - **Trả lời:** Dạ mỗi `Variant` trong MedusaJS đều có thể gán 1 thuộc tính ảnh riê ng. Khi state của lựa chọn thay đổi, Frontend sẽ tìm (find) variant tương ứng và lấy URL ảnh của nó để set lại vào state của hình ảnh chính.

### 5. Hệ thống Đánh giá & Bình luận (Reviews)
- **Nội dung Demo:** Kéo xuống phần Đánh giá. Hiển thị sao trung bình.
- **Điểm cần nhấn mạnh (Ăn tiền):** "Dạ không phải ai cũng được đánh giá. Logic của em là **chỉ tài khoản đã mua sản phẩm đó và đơn hàng phải ở trạng thái Đã giao/Hoàn thành** thì mới được phép viết review."
- **Câu hỏi Hội đồng có thể hỏi:** *Làm sao chặn được từ ngữ thô tục hoặc spam bình luận?*
  - **Trả lời:** Hiện tại nhóm em xử lý qua bộ lọc keyword cơ bản / chặn nội dung thô tục. (Nếu có làm thì nói, nếu chưa làm thì có thể nói: *Hướng phát triển tương lai là áp dụng AI hoặc Admin duyệt thủ công trước khi hiển thị.*)

### 6. Trải nghiệm Giỏ hàng & Thao tác khách hàng
- **Nội dung Demo:** 
  - Mở Drawer giỏ hàng, tăng giảm số lượng (tự tính tổng tiền).
  - Demo Wishlist (Yêu thích).
  - Demo tính năng "Xác nhận đã nhận hàng" chuyển status.
- **Điểm cần nhấn mạnh (RẤT QUAN TRỌNG):** "Khi người dùng thêm sản phẩm vào giỏ, em có kiểm tra chặt chẽ số lượng Tồn kho (Stock). Nếu kho còn 5 mà đòi mua 6 thì Frontend sẽ chặn ngay lập tức."
- **Câu hỏi Hội đồng có thể hỏi:** *Khách mua hàng thêm vào giỏ xong để đó, người khác vào mua hết thì sao? (Bài toán Overselling)*
  - **Trả lời:** Dạ, khi thêm vào giỏ chỉ là bước tạm thời, chưa khoá tồn kho (vì nếu khoá người ta không mua sẽ bị kẹt hàng). Khi khách bấm **Thanh toán**, Backend sẽ check lại số lượng một lần nữa. Nếu kho đã hết thì sẽ văng thông báo lỗi xin lỗi khách và reload lại giỏ hàng đúng thực tế.

### 7. Tích hợp Thanh toán (Phương án 2: VNPay / ZaloPay Sandbox)
- **Nội dung Demo:** 
  - Chọn phương thức thanh toán VNPay hoặc ZaloPay tại màn hình Checkout.
  - Hệ thống tự động chuyển hướng sang cổng thanh toán Sandbox (môi trường thử nghiệm).
  - Sử dụng thẻ test do VNPay/ZaloPay cung cấp để thực hiện thanh toán.
  - Thanh toán thành công, hệ thống tự động quay về trang "Hoàn tất đơn hàng" và cập nhật trạng thái đơn.
- **Điểm cần nhấn mạnh:** "Nhóm em chọn tích hợp cổng thanh toán trực tiếp qua API của VNPay/ZaloPay thay vì quét mã QR tĩnh. Em sử dụng môi trường Sandbox để đúng với mô hình kỹ thuật công nghệ chuẩn của doanh nghiệp lớn (có mã hoá chữ ký điện tử HMAC-SHA512 để bảo mật toàn vẹn dữ liệu)."
- **Câu hỏi Hội đồng có thể hỏi:** *Đây là thanh toán tiền thật hay giả lập? Làm sao hệ thống biết khách đã trả tiền để đổi trạng thái đơn?*
  - **Trả lời:** "Dạ đây là môi trường Sandbox (Test) do VNPay cung cấp. Tuy là test nhưng luồng mã hoá dữ liệu, chữ ký (signature) và checksum diễn ra hoàn toàn giống môi trường thật 100%. Khi thanh toán xong, VNPay sẽ gọi một webhook (IPN) về backend của nhóm em. Backend xác thực chữ ký an toàn rồi mới đổi trạng thái đơn hàng. Nếu đem hệ thống này triển khai thật, chỉ cần thay đổi API Key sang môi trường Production là có thể nhận tiền thật ngay lập tức."

---

## II. CHECKLIST NHỮNG THỨ LÊ KIỀU BIÊN CẦN NẮM VỮNG

Để bảo vệ thành công, bạn phải nắm chắc **LUỒNG LOGIC (Flow)** của các tính năng mình đã làm:

1. **Quản lý State:** Hiểu rõ cách bạn dùng `useState` và `useEffect` trong React. Nếu bị hỏi *"Chỗ thay đổi biến thể này code viết sao?"*, bạn phải nhớ được là dùng State để lưu lựa chọn (màu/dung lượng), từ đó tính ra được giá và ảnh.
2. **Gọi API:** Nắm được cách Frontend giao tiếp với Backend (sử dụng thư viện `axios` hoặc `fetch`, hoặc Medusa SDK). Nhớ được các endpoint cơ bản.
3. **Bảo mật thao tác:** Nắm vững logic check điều kiện. Ví dụ: Tại sao biết người dùng đã mua hàng để cho đánh giá? (Trả lời: Check lịch sử Order của Customer ID đó coi có ID sản phẩm hiện tại không và status có phải hoàn thành không).
4. **Xử lý Thanh toán (Payment Gateway):** Cần nắm rõ quy trình 3 bước: (1) Client gọi Backend tạo URL thanh toán -> (2) Client redirect người dùng sang VNPay -> (3) VNPay trả kết quả về URL callback để Backend xác thực và Client hiện màn hình thành công.
5. **Chuẩn bị Demo:** Trước khi lên thuyết trình, hãy tự tay test lại 1 luồng mượt mà từ: *Trang chủ -> Tìm sản phẩm -> Click vào chi tiết -> Đổi biến thể -> Thêm Giỏ hàng -> Thanh toán Sandbox.* Đừng quên **chuẩn bị sẵn thông tin thẻ Test của VNPay** (Số thẻ, tên in trên thẻ, ngày phát hành, mã OTP mặc định) để gõ cho nhanh.

**Lưu ý:** Hãy thuyết trình với phong thái tự tin, tốc độ vừa phải. Khi demo đến tính năng nào, dùng chuột chỉ vào vị trí đó trên màn hình để thầy cô dễ theo dõi! Chúc bạn bảo vệ xuất sắc!
