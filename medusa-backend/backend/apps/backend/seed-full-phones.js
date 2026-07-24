const BASE = 'http://127.0.0.1:9000';
const ADMIN_EMAIL = 'admin@techstore.com';
const ADMIN_PASS = 'TechStore@2026';

const CATEGORIES = [
  { name: 'Điện thoại', handle: 'dien-thoai' },
  { name: 'iPhone', handle: 'iphone' },
  { name: 'Samsung', handle: 'samsung' },
  { name: 'OPPO', handle: 'oppo' },
  { name: 'Xiaomi', handle: 'xiaomi' },
];

const SELLER_DEFAULT = {
  name: 'Sprylo Official Store',
  is_verified: true,
  badge_text: 'Chính Hãng',
  rating: 4.9,
  review_count: 1580,
  response_rate: '99%'
};

const PRODUCTS = [
  {
    title: 'iPhone 16 Pro',
    handle: 'iphone-16-pro',
    subtitle: 'Sức mạnh từ chip A18 Pro & Nút điều khiển Camera thông minh',
    description: 'iPhone 16 Pro sở hữu thiết kế bằng Titan cấp vũ trụ siêu nhẹ và bền bỉ. Nút Camera Control hoàn toàn mới mang đến trải nghiệm điều khiển camera trực quan chưa từng có. Sức mạnh vượt trội từ Chip A18 Pro giúp xử lý các tác vụ AI và đồ họa game nặng một cách dễ dàng, đồng thời tiết kiệm pin hiệu quả.',
    thumbnail: 'https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-16-pro-titan-tu-nhien.png',
    categories: ['dien-thoai', 'iphone'],
    metadata: {
      subtitle: 'Sức mạnh từ chip A18 Pro & Nút điều khiển Camera thông minh',
      rating: 4.9,
      review_count: 312,
      view_count: 5200,
      sale_count: 220,
      video_url: 'https://youtu.be/70gCxCTpvBg',
      seller: SELLER_DEFAULT,
      specifications: {
        'Màn hình': '6.3 inch, Super Retina XDR OLED, ProMotion 120Hz',
        'Hệ điều hành': 'iOS 18',
        'Camera sau': 'Chính 48MP & Siêu rộng 48MP & Telephoto 5x 12MP',
        'Camera trước': 'TrueDepth 12MP, Hỗ trợ FaceID',
        'Chipset (CPU)': 'Apple A18 Pro (3nm) 6 nhân',
        'RAM': '8 GB',
        'Dung lượng pin': '3582 mAh, Sạc nhanh 25W',
        'Trọng lượng': '199 g',
        'Bảo mật': 'Face ID (Nhận diện khuôn mặt 3D)',
        'Chống nước': 'IP68'
      }
    },
    options: [
      { title: 'Màu sắc', values: ['Titan Tự Nhiên', 'Titan Sa Mạc', 'Titan Đen', 'Titan Trắng'] },
      { title: 'Dung lượng', values: ['256GB', '512GB', '1TB'] }
    ],
    variants: [
      { color: 'Titan Tự Nhiên', storage: '256GB', price: 26990000, oldPrice: 28990000 },
      { color: 'Titan Tự Nhiên', storage: '512GB', price: 29990000, oldPrice: 32490000 },
      { color: 'Titan Tự Nhiên', storage: '1TB', price: 34990000, oldPrice: 37990000 },
      { color: 'Titan Sa Mạc', storage: '256GB', price: 27490000, oldPrice: 29490000 },
      { color: 'Titan Sa Mạc', storage: '512GB', price: 30490000, oldPrice: 32990000 },
      { color: 'Titan Sa Mạc', storage: '1TB', price: 35490000, oldPrice: 38490000 },
      { color: 'Titan Đen', storage: '256GB', price: 26990000, oldPrice: 28990000 },
      { color: 'Titan Đen', storage: '512GB', price: 29990000, oldPrice: 32490000 },
      { color: 'Titan Đen', storage: '1TB', price: 34990000, oldPrice: 37990000 },
      { color: 'Titan Trắng', storage: '256GB', price: 26990000, oldPrice: 28990000 },
      { color: 'Titan Trắng', storage: '512GB', price: 29990000, oldPrice: 32490000 },
      { color: 'Titan Trắng', storage: '1TB', price: 34990000, oldPrice: 37990000 }
    ]
  },
  {
    title: 'iPhone 16 Pro Max',
    handle: 'iphone-16-pro-max',
    subtitle: 'Màn hình lớn 6.9 inch ProMotion & Pin trâu nhất từng có',
    description: 'iPhone 16 Pro Max sở hữu màn hình 6.9 inch lớn nhất lịch sử iPhone, viền siêu mỏng, dung lượng pin bền bỉ ấn tượng cùng hệ thống camera zoom quang 5x đỉnh cao.',
    thumbnail: 'https://images.unsplash.com/photo-1696446702183-8fd7c6e63eed?w=500&q=80',
    categories: ['dien-thoai', 'iphone'],
    metadata: {
      subtitle: 'Màn hình lớn 6.9 inch ProMotion & Pin trâu nhất từng có',
      rating: 4.95,
      review_count: 512,
      view_count: 8900,
      sale_count: 430,
      video_url: 'https://youtu.be/70gCxCTpvBg',
      seller: SELLER_DEFAULT,
      specifications: {
        'Màn hình': '6.9 inch, Super Retina XDR OLED, 120Hz',
        'Hệ điều hành': 'iOS 18',
        'Camera sau': 'Chính 48MP & Siêu rộng 48MP & Telephoto 5x 12MP',
        'Camera trước': 'TrueDepth 12MP',
        'Chipset (CPU)': 'Apple A18 Pro (3nm)',
        'RAM': '8 GB',
        'Dung lượng pin': '4685 mAh',
        'Chống nước': 'IP68'
      }
    },
    options: [
      { title: 'Màu sắc', values: ['Titan Tự Nhiên', 'Titan Sa Mạc', 'Titan Đen', 'Titan Trắng'] },
      { title: 'Dung lượng', values: ['256GB', '512GB', '1TB'] }
    ],
    variants: [
      { color: 'Titan Tự Nhiên', storage: '256GB', price: 34990000, oldPrice: 36990000 },
      { color: 'Titan Tự Nhiên', storage: '512GB', price: 40990000, oldPrice: 42990000 },
      { color: 'Titan Tự Nhiên', storage: '1TB', price: 46990000, oldPrice: 48990000 },
      { color: 'Titan Sa Mạc', storage: '256GB', price: 35490000, oldPrice: 37490000 },
      { color: 'Titan Sa Mạc', storage: '512GB', price: 41490000, oldPrice: 43490000 },
      { color: 'Titan Sa Mạc', storage: '1TB', price: 47490000, oldPrice: 49490000 },
      { color: 'Titan Đen', storage: '256GB', price: 34990000, oldPrice: 36990000 },
      { color: 'Titan Đen', storage: '512GB', price: 40990000, oldPrice: 42990000 },
      { color: 'Titan Đen', storage: '1TB', price: 46990000, oldPrice: 48990000 },
      { color: 'Titan Trắng', storage: '256GB', price: 34990000, oldPrice: 36990000 },
      { color: 'Titan Trắng', storage: '512GB', price: 40990000, oldPrice: 42990000 },
      { color: 'Titan Trắng', storage: '1TB', price: 46990000, oldPrice: 48990000 }
    ]
  },
  {
    title: 'Samsung Galaxy S25 Ultra',
    handle: 'samsung-galaxy-s25-ultra',
    subtitle: 'Đỉnh cao AI Galaxy & Camera 200MP đột phá',
    description: 'Samsung Galaxy S25 Ultra đột phá với bút S Pen tích hợp, chip Snapdragon 8 Elite mượt mà và camera 200MP hỗ trợ AI xử lý ảnh vượt trội.',
    thumbnail: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80',
    categories: ['dien-thoai', 'samsung'],
    metadata: {
      subtitle: 'Đỉnh cao AI Galaxy & Camera 200MP đột phá',
      rating: 4.85,
      review_count: 240,
      view_count: 6100,
      sale_count: 190,
      seller: SELLER_DEFAULT,
      specifications: {
        'Màn hình': '6.8 inch Dynamic AMOLED 2X, 120Hz',
        'Hệ điều hành': 'Android 15, One UI 7',
        'Camera sau': '200MP + 50MP + 50MP + 10MP',
        'Camera trước': '12MP',
        'Chipset (CPU)': 'Snapdragon 8 Elite',
        'RAM': '12 GB',
        'Dung lượng pin': '5000 mAh',
        'Bút cảm ứng': 'S Pen có sẵn'
      }
    },
    options: [
      { title: 'Màu sắc', values: ['Titan Đen', 'Titan Xám', 'Titan Trắng'] },
      { title: 'Dung lượng', values: ['256GB', '512GB'] }
    ],
    variants: [
      { color: 'Titan Đen', storage: '256GB', price: 33990000, oldPrice: 35990000 },
      { color: 'Titan Đen', storage: '512GB', price: 37990000, oldPrice: 39990000 },
      { color: 'Titan Xám', storage: '256GB', price: 33990000, oldPrice: 35990000 },
      { color: 'Titan Xám', storage: '512GB', price: 37990000, oldPrice: 39990000 },
      { color: 'Titan Trắng', storage: '256GB', price: 33990000, oldPrice: 35990000 },
      { color: 'Titan Trắng', storage: '512GB', price: 37990000, oldPrice: 39990000 }
    ]
  },
  {
    title: 'Samsung Galaxy Z Flip 6',
    handle: 'samsung-galaxy-z-flip-6',
    subtitle: 'Thiết kế màn hình gập thời thượng & FlexCam thông minh',
    description: 'Galaxy Z Flip 6 mang đến phong cách thời trang gập mở độc đáo, màn hình phụ Flex Window tiện lợi và tính năng FlexCam tự động canh chỉnh khung hình.',
    thumbnail: 'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=500&q=80',
    categories: ['dien-thoai', 'samsung'],
    metadata: {
      subtitle: 'Thiết kế màn hình gập thời thượng & FlexCam thông minh',
      rating: 4.75,
      review_count: 145,
      view_count: 4200,
      sale_count: 110,
      seller: SELLER_DEFAULT,
      specifications: {
        'Màn hình': 'Chính 6.7 inch Dynamic AMOLED 2X, Phụ 3.4 inch Super AMOLED',
        'Chipset (CPU)': 'Snapdragon 8 Gen 3 for Galaxy',
        'RAM': '12 GB',
        'Dung lượng pin': '4000 mAh'
      }
    },
    options: [
      { title: 'Màu sắc', values: ['Vàng', 'Bạc', 'Xanh'] },
      { title: 'Dung lượng', values: ['256GB', '512GB'] }
    ],
    variants: [
      { color: 'Vàng', storage: '256GB', price: 24990000, oldPrice: 26990000 },
      { color: 'Vàng', storage: '512GB', price: 27990000, oldPrice: 29990000 },
      { color: 'Bạc', storage: '256GB', price: 24990000, oldPrice: 26990000 },
      { color: 'Bạc', storage: '512GB', price: 27990000, oldPrice: 29990000 },
      { color: 'Xanh', storage: '256GB', price: 24990000, oldPrice: 26990000 },
      { color: 'Xanh', storage: '512GB', price: 27990000, oldPrice: 29990000 }
    ]
  },
  {
    title: 'OPPO Find X8 Pro',
    handle: 'oppo-find-x8-pro',
    subtitle: 'Nhiếp ảnh chân thực cùng Hasselblad & Dimensity 9400',
    description: 'OPPO Find X8 Pro khẳng định vị thế đỉnh cao photography với hệ thống 4 camera Hasselblad 50MP, ống kính tiềm vọng kép và vi xử lý Dimensity 9400 cực kì mạnh mẽ.',
    thumbnail: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=500&q=80',
    categories: ['dien-thoai', 'oppo'],
    metadata: {
      subtitle: 'Nhiếp ảnh chân thực cùng Hasselblad & Dimensity 9400',
      rating: 4.8,
      review_count: 98,
      view_count: 3100,
      sale_count: 85,
      seller: SELLER_DEFAULT,
      specifications: {
        'Màn hình': '6.78 inch AMOLED 120Hz 4500 nits',
        'Camera sau': '50MP + 50MP + 50MP + 50MP Hasselblad',
        'Chipset (CPU)': 'MediaTek Dimensity 9400',
        'RAM': '16 GB',
        'Dung lượng pin': '5910 mAh, Sạc nhanh 80W'
      }
    },
    options: [
      { title: 'Màu sắc', values: ['Đen', 'Trắng'] },
      { title: 'Dung lượng', values: ['256GB', '512GB'] }
    ],
    variants: [
      { color: 'Đen', storage: '256GB', price: 23990000, oldPrice: 25990000 },
      { color: 'Đen', storage: '512GB', price: 26990000, oldPrice: 28990000 },
      { color: 'Trắng', storage: '256GB', price: 23990000, oldPrice: 25990000 },
      { color: 'Trắng', storage: '512GB', price: 26990000, oldPrice: 28990000 }
    ]
  },
  {
    title: 'Xiaomi 15 Pro',
    handle: 'xiaomi-15-pro',
    subtitle: 'Ống kính Leica Summilux & Sạc siêu tốc 90W',
    description: 'Xiaomi 15 Pro kết hợp cùng Leica mang lại chất lượng ảnh huyền thoại, vi xử lý Snapdragon 8 Elite tốc độ cao và viên pin siêu khủng 6100mAh.',
    thumbnail: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=500&q=80',
    categories: ['dien-thoai', 'xiaomi'],
    metadata: {
      subtitle: 'Ống kính Leica Summilux & Sạc siêu tốc 90W',
      rating: 4.8,
      review_count: 120,
      view_count: 3800,
      sale_count: 140,
      seller: SELLER_DEFAULT,
      specifications: {
        'Màn hình': '6.73 inch 2K LTPO OLED 120Hz',
        'Camera sau': '50MP + 50MP + 50MP Leica',
        'Chipset (CPU)': 'Snapdragon 8 Elite (3nm)',
        'RAM': '12 GB',
        'Dung lượng pin': '6100 mAh, Sạc 90W'
      }
    },
    options: [
      { title: 'Màu sắc', values: ['Đen', 'Trắng', 'Xanh'] },
      { title: 'Dung lượng', values: ['256GB', '512GB'] }
    ],
    variants: [
      { color: 'Đen', storage: '256GB', price: 22990000, oldPrice: 24990000 },
      { color: 'Đen', storage: '512GB', price: 25990000, oldPrice: 27990000 },
      { color: 'Trắng', storage: '256GB', price: 22990000, oldPrice: 24990000 },
      { color: 'Trắng', storage: '512GB', price: 25990000, oldPrice: 27990000 },
      { color: 'Xanh', storage: '256GB', price: 22990000, oldPrice: 24990000 },
      { color: 'Xanh', storage: '512GB', price: 25990000, oldPrice: 27990000 }
    ]
  }
];

async function req(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { _raw: text }; }
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

async function main() {
  console.log('\n🚀 Starting full phone data seed into Medusa v2...\n');

  // 1. Admin login
  console.log('1️⃣ Logging in admin...');
  const authRes = await req('POST', '/auth/user/emailpass', {
    email: ADMIN_EMAIL, password: ADMIN_PASS
  });
  const token = authRes.token;
  console.log('   ✅ Logged in successfully!\n');

  // 2. Fetch or create Categories
  console.log('2️⃣ Setting up categories...');
  const catMap = {};
  const existCats = await req('GET', '/admin/product-categories?limit=100', null, token);
  for (const ec of (existCats.product_categories || [])) {
    catMap[ec.handle] = ec.id;
  }
  for (const cat of CATEGORIES) {
    if (!catMap[cat.handle]) {
      const r = await req('POST', '/admin/product-categories', {
        name: cat.name,
        handle: cat.handle,
        is_active: true,
        is_internal: false,
      }, token);
      catMap[cat.handle] = r.product_category.id;
      console.log(`   ➕ Created category: ${cat.name}`);
    } else {
      console.log(`   ✔️ Existing category: ${cat.name}`);
    }
  }
  console.log();

  // 3. Sales Channel
  console.log('3️⃣ Fetching Sales Channel...');
  const scRes = await req('GET', '/admin/sales-channels?limit=1', null, token);
  const salesChannelId = scRes.sales_channels?.[0]?.id;
  if (!salesChannelId) throw new Error('Sales channel not found');
  console.log(`   ✅ Sales Channel ID: ${salesChannelId}\n`);

  // 4. Products creation
  console.log('4️⃣ Creating detailed phone products...\n');
  let count = 0;

  for (const p of PRODUCTS) {
    try {
      // Check existing
      const check = await req('GET', `/admin/products?q=${encodeURIComponent(p.title)}&limit=5`, null, token);
      const existingProduct = (check.products || []).find(item => item.title === p.title);

      if (existingProduct) {
        // Delete old simple product to recreate full options product
        console.log(`   🗑️ Deleting old incomplete product: ${p.title}`);
        await req('DELETE', `/admin/products/${existingProduct.id}`, null, token);
      }

      const catIds = p.categories.map(h => ({ id: catMap[h] })).filter(c => c.id);

      const variantsPayload = p.variants.map(v => ({
        title: `${v.color} / ${v.storage}`,
        options: { 'Màu sắc': v.color, 'Dung lượng': v.storage },
        prices: [
          { currency_code: 'vnd', amount: v.price },
          { currency_code: 'usd', amount: Math.round(v.price / 25000) }
        ]
      }));

      const payload = {
        title: p.title,
        subtitle: p.subtitle,
        handle: p.handle,
        description: p.description,
        thumbnail: p.thumbnail,
        status: 'published',
        metadata: p.metadata,
        categories: catIds,
        sales_channels: [{ id: salesChannelId }],
        options: p.options,
        variants: variantsPayload
      };

      await req('POST', '/admin/products', payload, token);
      count++;
      console.log(`   ✅ [${count}/${PRODUCTS.length}] Created: ${p.title} (${p.variants.length} variants)`);
    } catch (err) {
      console.error(`   ❌ Failed to create ${p.title}: ${err.message}`);
    }
  }

  console.log(`\n🎉 Seed finished! ${count} phone products with full variants & metadata created successfully.\n`);
}

main().catch(err => {
  console.error('\n❌ Seed failed:', err);
  process.exit(1);
});
