/**
 * Script convert_specs_to_string.cjs
 * Chuyển đổi specifications từ dạng Object sang dạng String trong metadata của tất cả sản phẩm
 * Chạy: node scratch/convert_specs_to_string.cjs
 */

const BASE = 'http://localhost:9000';
const ADMIN_EMAIL = 'admin@techstore.com';
const ADMIN_PASS  = 'TechStore@2026';

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
  console.log('🚀 Đang kết nối tới Medusa Admin API...');
  
  // 1. Đăng nhập Admin
  const authRes = await req('POST', '/auth/user/emailpass', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASS
  });
  const token = authRes.token;
  console.log('✅ Đăng nhập thành công!');

  // 2. Lấy danh sách sản phẩm
  console.log('📦 Đang tải danh sách sản phẩm...');
  const productsRes = await req('GET', '/admin/products?limit=100', null, token);
  const products = productsRes.products || [];
  console.log(`📋 Tìm thấy ${products.length} sản phẩm.`);

  let updatedCount = 0;

  // 3. Quét và cập nhật từng sản phẩm
  for (const product of products) {
    const metadata = product.metadata || {};
    const specs = metadata.specifications;

    // Nếu specifications là một Object (không phải string và không phải null/undefined)
    if (specs && typeof specs === 'object' && !Array.isArray(specs)) {
      console.log(`⚙️ Đang xử lý sản phẩm: ${product.title}`);
      
      // Chuyển đối tượng specifications thành chuỗi JSON
      const updatedMetadata = {
        ...metadata,
        specifications: JSON.stringify(specs)
      };

      try {
        // Cập nhật sản phẩm qua API
        await req('POST', `/admin/products/${product.id}`, {
          metadata: updatedMetadata
        }, token);
        
        console.log(`   ✅ Đã chuyển đổi thành công!`);
        updatedCount++;
      } catch (err) {
        console.error(`   ❌ Lỗi khi cập nhật ${product.title}:`, err.message);
      }
    } else {
      console.log(`   ⏭️ Bỏ qua ${product.title} (thông số đã ở dạng chuỗi hoặc không có)`);
    }
  }

  console.log(`\n🎉 Hoàn thành! Đã cập nhật ${updatedCount} sản phẩm.`);
}

main().catch(err => {
  console.error('\n❌ Lỗi thực thi:', err.message);
});
