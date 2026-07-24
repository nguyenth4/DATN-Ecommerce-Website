/**
 * seed-phones.js — Tạo sản phẩm điện thoại vào Medusa v2 qua Admin API
 * Chạy: node seed-phones.js
 */

const BASE = 'http://localhost:9000';
const ADMIN_EMAIL = 'admin@techstore.com';
const ADMIN_PASS  = 'TechStore@2026';

// ── Danh mục cần tạo ──────────────────────────────────────────────────────
const CATEGORIES = [
  { name: 'Điện thoại', handle: 'dien-thoai' },
  { name: 'iPhone',     handle: 'iphone'      },
  { name: 'Samsung',    handle: 'samsung'      },
  { name: 'OPPO',       handle: 'oppo'         },
  { name: 'Xiaomi',     handle: 'xiaomi'       },
];

// ── Danh sách sản phẩm điện thoại ────────────────────────────────────────
const PHONES = [
  {
    title:       'iPhone 16 Pro Max 256GB',
    handle:      'iphone-16-pro-max-256gb',
    description: 'iPhone 16 Pro Max mới nhất với chip A18 Pro, camera 48MP, màn hình 6.9 inch ProMotion 120Hz, pin 4685mAh.',
    thumbnail:   'https://images.unsplash.com/photo-1696446702183-8fd7c6e63eed?w=500&q=80',
    categories:  ['dien-thoai', 'iphone'],
    price_vnd:   34_990_000,
    old_price:   37_000_000,
    stock:       50,
    metadata: { rating: 4.9, review_count: 245, view_count: 5200, sale_count: 180 },
  },
  {
    title:       'iPhone 15 Pro 128GB',
    handle:      'iphone-15-pro-128gb',
    description: 'iPhone 15 Pro với titanium design, chip A17 Pro, camera 48MP ProRAW, Dynamic Island.',
    thumbnail:   'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80',
    categories:  ['dien-thoai', 'iphone'],
    price_vnd:   27_990_000,
    old_price:   29_990_000,
    stock:       35,
    metadata: { rating: 4.8, review_count: 312, view_count: 4800, sale_count: 220 },
  },
  {
    title:       'iPhone 14 128GB',
    handle:      'iphone-14-128gb',
    description: 'iPhone 14 với chip A15 Bionic, camera 12MP Photonic Engine, hệ thống phát hiện tai nạn.',
    thumbnail:   'https://images.unsplash.com/photo-1660753046777-aafad82b0c95?w=500&q=80',
    categories:  ['dien-thoai', 'iphone'],
    price_vnd:   19_990_000,
    old_price:   22_000_000,
    stock:       40,
    metadata: { rating: 4.7, review_count: 420, view_count: 6100, sale_count: 350 },
  },
  {
    title:       'Samsung Galaxy S25 Ultra 256GB',
    handle:      'samsung-galaxy-s25-ultra-256gb',
    description: 'Samsung Galaxy S25 Ultra với S Pen, camera 200MP, chip Snapdragon 8 Elite, AI Galaxy.',
    thumbnail:   'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80',
    categories:  ['dien-thoai', 'samsung'],
    price_vnd:   33_990_000,
    old_price:   35_990_000,
    stock:       28,
    metadata: { rating: 4.8, review_count: 198, view_count: 3900, sale_count: 145 },
  },
  {
    title:       'Samsung Galaxy S24 FE 256GB',
    handle:      'samsung-galaxy-s24-fe-256gb',
    description: 'Samsung Galaxy S24 FE thiết kế cao cấp, Exynos 2500, camera 50MP, màn hình 6.7 inch AMOLED.',
    thumbnail:   'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=500&q=80',
    categories:  ['dien-thoai', 'samsung'],
    price_vnd:   15_990_000,
    old_price:   18_000_000,
    stock:       60,
    metadata: { rating: 4.6, review_count: 167, view_count: 2800, sale_count: 120 },
  },
  {
    title:       'Samsung Galaxy A55 5G 256GB',
    handle:      'samsung-galaxy-a55-5g-256gb',
    description: 'Samsung Galaxy A55 5G tầm trung cao cấp, chip Exynos 1480, camera 50MP, IP67 chống nước.',
    thumbnail:   'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80',
    categories:  ['dien-thoai', 'samsung'],
    price_vnd:   10_990_000,
    old_price:   12_000_000,
    stock:       75,
    metadata: { rating: 4.5, review_count: 234, view_count: 3500, sale_count: 190 },
  },
  {
    title:       'OPPO Find X8 Pro 256GB',
    handle:      'oppo-find-x8-pro-256gb',
    description: 'OPPO Find X8 Pro với camera Hasselblad, chip MediaTek Dimensity 9400, màn hình 6.78 inch 120Hz.',
    thumbnail:   'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=500&q=80',
    categories:  ['dien-thoai', 'oppo'],
    price_vnd:   23_990_000,
    old_price:   25_000_000,
    stock:       22,
    metadata: { rating: 4.7, review_count: 89, view_count: 2100, sale_count: 67 },
  },
  {
    title:       'OPPO Reno 13 Pro 256GB',
    handle:      'oppo-reno-13-pro-256gb',
    description: 'OPPO Reno 13 Pro thiết kế thời trang, chip MediaTek Dimensity 8350, camera 50MP AI.',
    thumbnail:   'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500&q=80',
    categories:  ['dien-thoai', 'oppo'],
    price_vnd:   13_990_000,
    old_price:   15_000_000,
    stock:       45,
    metadata: { rating: 4.5, review_count: 134, view_count: 2400, sale_count: 98 },
  },
  {
    title:       'Xiaomi 15 Pro 256GB',
    handle:      'xiaomi-15-pro-256gb',
    description: 'Xiaomi 15 Pro chip Snapdragon 8 Elite, camera Leica Summilux 50MP, sạc nhanh 90W HyperCharge.',
    thumbnail:   'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=500&q=80',
    categories:  ['dien-thoai', 'xiaomi'],
    price_vnd:   22_990_000,
    old_price:   24_000_000,
    stock:       30,
    metadata: { rating: 4.7, review_count: 156, view_count: 3200, sale_count: 112 },
  },
  {
    title:       'Xiaomi Redmi Note 14 Pro 5G 256GB',
    handle:      'xiaomi-redmi-note-14-pro-5g-256gb',
    description: 'Redmi Note 14 Pro 5G chip MediaTek Dimensity 7300 Ultra, camera 200MP, pin 5110mAh, màn hình AMOLED 120Hz.',
    thumbnail:   'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500&q=80',
    categories:  ['dien-thoai', 'xiaomi'],
    price_vnd:   8_490_000,
    old_price:   9_990_000,
    stock:       90,
    metadata: { rating: 4.5, review_count: 289, view_count: 4100, sale_count: 245 },
  },
  {
    title:       'iPhone 13 128GB',
    handle:      'iphone-13-128gb',
    description: 'iPhone 13 chip A15 Bionic, camera kép 12MP Cinematic Mode, 5G, pin cải tiến 20% so với iPhone 12.',
    thumbnail:   'https://images.unsplash.com/photo-1632633173522-47456de71b76?w=500&q=80',
    categories:  ['dien-thoai', 'iphone'],
    price_vnd:   15_490_000,
    old_price:   17_000_000,
    stock:       55,
    metadata: { rating: 4.6, review_count: 567, view_count: 7200, sale_count: 480 },
  },
  {
    title:       'Samsung Galaxy Z Flip 6 256GB',
    handle:      'samsung-galaxy-z-flip-6-256gb',
    description: 'Galaxy Z Flip 6 màn hình gập 6.7 inch FHD+, chip Snapdragon 8 Gen 3, camera 50MP, khung nhôm Armor.',
    thumbnail:   'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=500&q=80',
    categories:  ['dien-thoai', 'samsung'],
    price_vnd:   24_990_000,
    old_price:   26_990_000,
    stock:       18,
    metadata: { rating: 4.6, review_count: 112, view_count: 2700, sale_count: 78 },
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────
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

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀  Bắt đầu seed sản phẩm điện thoại...\n');

  // 1. Đăng nhập Admin
  console.log('1️⃣  Đăng nhập Admin...');
  const authRes = await req('POST', '/auth/user/emailpass', {
    email: ADMIN_EMAIL, password: ADMIN_PASS
  });
  const token = authRes.token;
  console.log('   ✅  Đăng nhập thành công!\n');

  // 2. Lấy hoặc tạo danh mục
  console.log('2️⃣  Tạo danh mục sản phẩm...');
  const catMap = {}; // handle → id
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
      console.log(`   ➕  Tạo mới danh mục: ${cat.name}`);
    } else {
      console.log(`   ✔️   Danh mục đã tồn tại: ${cat.name}`);
    }
  }
  console.log();

  // 3. Lấy Sales Channel mặc định
  console.log('3️⃣  Lấy Sales Channel...');
  const scRes = await req('GET', '/admin/sales-channels?limit=1', null, token);
  const salesChannelId = scRes.sales_channels?.[0]?.id;
  if (!salesChannelId) throw new Error('Không tìm thấy Sales Channel!');
  console.log(`   ✅  Sales Channel: ${salesChannelId}\n`);

  // 4. Tạo sản phẩm
  console.log('4️⃣  Tạo sản phẩm điện thoại...\n');
  let created = 0;
  for (const phone of PHONES) {
    try {
      // Kiểm tra đã tồn tại chưa
      const check = await req('GET', `/admin/products?q=${encodeURIComponent(phone.title)}&limit=1`, null, token);
      if ((check.products || []).some(p => p.title === phone.title)) {
        console.log(`   ⏭️   Đã tồn tại, bỏ qua: ${phone.title}`);
        continue;
      }

      const catIds = phone.categories.map(h => ({ id: catMap[h] })).filter(c => c.id);

      const payload = {
        title:       phone.title,
        handle:      phone.handle,
        description: phone.description,
        thumbnail:   phone.thumbnail,
        status:      'published',
        metadata:    phone.metadata,
        categories:  catIds,
        sales_channels: [{ id: salesChannelId }],
        options: [{ title: 'Màu sắc', values: ['Chính hãng'] }],
        variants: [
          {
            title: 'Chính hãng',
            prices: [
              { currency_code: 'vnd', amount: phone.price_vnd },
              { currency_code: 'usd', amount: Math.round(phone.price_vnd / 25000) },
            ],
            options: { 'Màu sắc': 'Chính hãng' },
          },
        ],
      };

      await req('POST', '/admin/products', payload, token);
      created++;
      console.log(`   ✅  [${created}] ${phone.title} — ${phone.price_vnd.toLocaleString('vi-VN')}đ`);
    } catch (err) {
      console.log(`   ❌  Lỗi tạo ${phone.title}: ${err.message}`);
    }
  }

  console.log(`\n🎉  Hoàn tất! Đã tạo ${created}/${PHONES.length} sản phẩm.`);
  console.log(`📦  Truy cập Admin: http://localhost:9000/app/products\n`);
}

main().catch(err => {
  console.error('\n❌  Lỗi seed:', err.message);
  process.exit(1);
});
