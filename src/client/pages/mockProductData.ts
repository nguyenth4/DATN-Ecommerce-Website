// Mock Data chuẩn cấu trúc MedusaJS cho iPhone 16 Pro
export const mockProduct = {
  id: "prod_iphone16pro",
  title: "iPhone 16 Pro",
  subtitle: "Sức mạnh từ chip A18 Pro & Nút điều khiển Camera thông minh",
  category: "Điện thoại",
  basePrice: 28990000,
  salePrice: 26990000,
  rating: 4.9,
  reviewCount: 312,
  description: "iPhone 16 Pro sở hữu thiết kế bằng Titan cấp vũ trụ siêu nhẹ và bền bỉ. Nút Camera Control hoàn toàn mới mang đến trải nghiệm điều khiển camera trực quan chưa từng có. Sức mạnh vượt trội từ Chip A18 Pro giúp xử lý các tác vụ AI và đồ họa game nặng một cách dễ dàng, đồng thời tiết kiệm pin hiệu quả.",
  keyFeatures: [
    "Thiết kế Titan cấp vũ trụ siêu bền, viền màn hình mỏng nhất từ trước đến nay",
    "Nút điều khiển Camera (Camera Control) thông minh, chụp ảnh/quay video nhanh",
    "Chip A18 Pro mạnh mẽ vượt trội, hỗ trợ các tính năng AI thông minh",
    "Hệ thống Camera Pro zoom quang học 5x, quay video 4K 120 fps Dolby Vision",
    "Thời lượng pin cực khủng lên đến 27 giờ phát video liên tục"
  ],
  options: [
    {
      id: "opt_color",
      title: "Màu sắc",
      values: [
        { name: "Titan Tự Nhiên", hex: "#8E8E8A", img: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-16-pro-titan-tu-nhien.png" },
        { name: "Titan Sa Mạc", hex: "#D1C0B0", img: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-16-pro-titan-sa-mac.png" },
        { name: "Titan Đen", hex: "#2C2C2C", img: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-16-pro-titan-den.png" },
        { name: "Titan Trắng", hex: "#F5F5F0", img: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-16-pro-titan-trang.png" }
      ]
    },
    {
      id: "opt_storage",
      title: "Dung lượng",
      values: ["256GB", "512GB", "1TB"]
    }
  ],
  variants: [
    // Titan Tự Nhiên
    { id: "var_nat_256", color: "Titan Tự Nhiên", storage: "256GB", price: 26990000, oldPrice: 28990000, stock: 15, sku: "IP16P-NAT-128" },
    { id: "var_nat_512", color: "Titan Tự Nhiên", storage: "512GB", price: 29990000, oldPrice: 32490000, stock: 8, sku: "IP16P-NAT-256" },
    { id: "var_nat_1", color: "Titan Tự Nhiên", storage: "1TB", price: 34990000, oldPrice: 37990000, stock: 3, sku: "IP16P-NAT-512" },
    // Titan Sa Mạc
    { id: "var_des_256", color: "Titan Sa Mạc", storage: "256GB", price: 27490000, oldPrice: 29490000, stock: 10, sku: "IP16P-DES-128" },
    { id: "var_des_512", color: "Titan Sa Mạc", storage: "512GB", price: 30490000, oldPrice: 32990000, stock: 0, sku: "IP16P-DES-256" }, // Hết hàng
    { id: "var_des_1", color: "Titan Sa Mạc", storage: "1TB", price: 35490000, oldPrice: 38490000, stock: 4, sku: "IP16P-DES-512" },
    // Titan Đen
    { id: "var_blk_256", color: "Titan Đen", storage: "256GB", price: 26990000, oldPrice: 28990000, stock: 22, sku: "IP16P-BLK-128" },
    { id: "var_blk_512", color: "Titan Đen", storage: "512GB", price: 29990000, oldPrice: 32490000, stock: 12, sku: "IP16P-BLK-256" },
    { id: "var_blk_1", color: "Titan Đen", storage: "1TB", price: 34990000, oldPrice: 37990000, stock: 5, sku: "IP16P-BLK-512" },
    // Titan Trắng
    { id: "var_wht_256", color: "Titan Trắng", storage: "256GB", price: 26990000, oldPrice: 28990000, stock: 7, sku: "IP16P-WHT-128" },
    { id: "var_wht_512", color: "Titan Trắng", storage: "512GB", price: 29990000, oldPrice: 32490000, stock: 9, sku: "IP16P-WHT-256" },
    { id: "var_wht_1", color: "Titan Trắng", storage: "1TB", price: 34990000, oldPrice: 37990000, stock: 2, sku: "IP16P-WHT-512" }
  ],
  metadata: {
    video_url: "https://youtu.be/70gCxCTpvBg?si=-FyQoMAqNJwapcZL",
    specifications: {
      "Màn hình": "6.3 inch, Super Retina XDR OLED, ProMotion 120Hz, HDR10",
      "Hệ điều hành": "iOS 18",
      "Camera sau": "Chính 48MP & Siêu rộng 48MP & Telephoto 5x 12MP",
      "Camera trước": "TrueDepth 12MP, f/1.9, Hỗ trợ FaceID",
      "Chipset (CPU)": "Apple A18 Pro (3nm) 6 nhân",
      "RAM": "8 GB",
      "Dung lượng pin": "3582 mAh, Sạc nhanh 25W, Sạc không dây MagSafe 25W",
      "Trọng lượng": "199 g",
      "Bảo mật": "Face ID (Nhận diện khuôn mặt 3D)",
      "Chống nước": "IP68 (dưới nước 6m trong 30 phút)"
    }
  },
  reviewsList: [
    { name: "Nguyễn Minh Hoàng", rating: 5, date: "15/06/2026", comment: "Máy quá đẹp, màu Titan Sa Mạc nhìn ngoài đời sang chảnh vô cùng. Cầm nắm nhẹ hơn bản thép cũ. Nút Camera Control nhạy và tiện." },
    { name: "Trần Thị Lan Anh", rating: 5, date: "12/06/2026", comment: "Nâng cấp từ iPhone 13 Pro thấy quá xứng đáng. Màn hình sáng nét, viền siêu mỏng quyến rũ, pin dùng cả ngày rưỡi chơi game lướt web vô tư." },
    { name: "Lê Quốc Cường", rating: 4, date: "08/06/2026", comment: "Hiệu năng chip A18 Pro đỉnh cao, không lo giật lag. Chỉ tiếc là hộp máy không có củ sạc nên phải mua thêm sạc ngoài 25W." }
  ]
};

export const mockRelatedProducts = [
  { id: "2", name: "Samsung Galaxy S24 Ultra", category: "Điện thoại", price: "25.990.000đ", img: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=80" },
  { id: "3", name: "iPhone 15 Pro Max", category: "Điện thoại", price: "24.490.000đ", img: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80" },
  { id: "4", name: "Xiaomi 14 Ultra", category: "Điện thoại", price: "21.990.000đ", img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80" }
];
