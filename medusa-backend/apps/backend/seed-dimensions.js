const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.yumyjivpmdwkpdvrnurh:DatnEcom2026SecurePass@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true',
});

/**
 * Kích thước thực tế từng dòng điện thoại (đóng hộp giao hàng)
 * - weight: gram (cân nặng cả hộp + phụ kiện)
 * - height: cm (chiều cao hộp)
 * - length: cm (chiều dài hộp)
 * - width:  cm (chiều rộng hộp)
 * 
 * Công thức tính phí vận chuyển GHN:
 *   Cân nặng quy đổi = (Dài × Rộng × Cao) / 5000 (kg)
 *   Phí ship = max(cân nặng thực, cân nặng quy đổi) × đơn giá
 */
const phoneDimensions = {
  // ========== IPHONE ==========
  'iPhone 14 Pro Max': {
    weight: 390,    // 240g máy + 150g hộp/phụ kiện
    height: 5,      // hộp cao ~5cm
    length: 19,     // hộp dài ~19cm
    width: 10,      // hộp rộng ~10cm
  },
  'iPhone 15': {
    weight: 320,    // 171g máy + 149g hộp/phụ kiện
    height: 5,
    length: 18,
    width: 10,
  },
  'IPhone 16 Pro': {
    weight: 350,    // 199g máy + 151g hộp
    height: 5,
    length: 18,
    width: 10,
  },
  'iPhone 16 Pro Max': {
    weight: 380,    // 227g máy + 153g hộp
    height: 5,
    length: 19,
    width: 10,
  },
  'iPhone 17': {
    weight: 330,    // ~175g máy + 155g hộp
    height: 5,
    length: 18,
    width: 10,
  },
  'iPhone 17 Pro Max': {
    weight: 385,    // ~230g máy + 155g hộp
    height: 5,
    length: 19,
    width: 10,
  },
  'iPhone 17e': {
    weight: 310,    // ~155g máy + 155g hộp (nhẹ nhất dòng iPhone)
    height: 5,
    length: 17,
    width: 9,
  },
  'iPhone Air': {
    weight: 295,    // ~145g máy (siêu mỏng) + 150g hộp
    height: 4,      // hộp mỏng hơn vì máy mỏng
    length: 18,
    width: 10,
  },

  // ========== SAMSUNG ==========
  'Samsung Galaxy S25 Ultra': {
    weight: 370,    // 218g máy + 152g hộp
    height: 5,
    length: 19,
    width: 10,
  },
  'Samsung Galaxy S25 Plus': {
    weight: 340,    // 190g máy + 150g hộp
    height: 5,
    length: 19,
    width: 10,
  },
  'Samsung Galaxy S25 FE': {
    weight: 335,    // ~185g máy + 150g hộp
    height: 5,
    length: 18,
    width: 10,
  },
  'Samsung Galaxy S26 Ultra 5G': {
    weight: 375,    // ~220g máy + 155g hộp
    height: 5,
    length: 19,
    width: 10,
  },
  'Samsung Galaxy Z Flip 6': {
    weight: 340,    // 187g máy + 153g hộp
    height: 6,      // hộp cao hơn vì máy gập
    length: 16,     // hộp ngắn hơn (máy gập lại)
    width: 10,
  },
  'Samsung Galaxy Z Flip8 5G 12GB 256GB': {
    weight: 335,    // ~185g máy + 150g hộp
    height: 6,
    length: 16,
    width: 10,
  },
  'Samsung Galaxy A56 5G 8GB 128GB': {
    weight: 340,    // 190g máy + 150g hộp
    height: 5,
    length: 19,
    width: 10,
  },
  'Samsung Galaxy A57 5G 8GB 128GB': {
    weight: 340,    // ~190g máy + 150g hộp
    height: 5,
    length: 19,
    width: 10,
  },

  // ========== OPPO ==========
  'OPPO Find X8 Pro': {
    weight: 365,    // 215g máy + 150g hộp
    height: 5,
    length: 19,
    width: 10,
  },
  'OPPO Find X8 16GB 512GB': {
    weight: 345,    // 193g máy + 152g hộp
    height: 5,
    length: 18,
    width: 10,
  },
  'OPPO Find X9': {
    weight: 350,    // ~200g máy + 150g hộp
    height: 5,
    length: 18,
    width: 10,
  },
  'OPPO Find N5 16GB 512GB': {
    weight: 370,    // 216g máy + 154g hộp
    height: 7,      // hộp dày hơn vì máy gập
    length: 17,
    width: 10,
  },
  'OPPO Find N6 16GB 512GB': {
    weight: 365,    // ~215g máy + 150g hộp
    height: 7,
    length: 17,
    width: 10,
  },
  'OPPO Reno16 F 5G 8GB 256GB': {
    weight: 335,    // ~185g máy + 150g hộp
    height: 5,
    length: 19,
    width: 10,
  },
  'OPPO Reno14 F 5G 8GB 256GB': {
    weight: 330,    // ~180g máy + 150g hộp
    height: 5,
    length: 19,
    width: 10,
  },
  'OPPO Reno10 Pro+ 5G 12GB 256GB': {
    weight: 345,    // 194g máy + 151g hộp
    height: 5,
    length: 19,
    width: 10,
  },
  'OPPO A6 Pro': {
    weight: 335,    // ~185g máy + 150g hộp
    height: 5,
    length: 19,
    width: 10,
  },
  'OPPO A6t Pro': {
    weight: 335,    // ~185g máy + 150g hộp
    height: 5,
    length: 19,
    width: 10,
  },

  // ========== XIAOMI ==========
  'Xiaomi 14T Pro': {
    weight: 360,    // 209g máy + 151g hộp
    height: 5,
    length: 19,
    width: 10,
  },
  'Xiaomi 15 ': {   // Note: có space ở cuối trong DB
    weight: 340,    // 191g máy + 149g hộp
    height: 5,
    length: 18,
    width: 10,
  },
  'Xiaomi 15': {    // Trường hợp không có space
    weight: 340,
    height: 5,
    length: 18,
    width: 10,
  },
  'Xiaomi 15 Pro': {
    weight: 365,    // 213g máy + 152g hộp
    height: 5,
    length: 19,
    width: 10,
  },
  'Xiaomi 15 Ultra 5G': {
    weight: 380,    // 227g máy + 153g hộp
    height: 6,      // camera module lớn, hộp cao hơn
    length: 19,
    width: 10,
  },
  'Xiaomi 17 Ultra 5G': {
    weight: 380,    // ~225g máy + 155g hộp
    height: 6,
    length: 19,
    width: 10,
  },
  'Xiaomi 17T': {
    weight: 350,    // ~200g máy + 150g hộp
    height: 5,
    length: 19,
    width: 10,
  },
  'Xiaomi 13 Pro 12GB - 256GB': {
    weight: 360,    // 210g máy + 150g hộp
    height: 5,
    length: 19,
    width: 10,
  },
  'Xiaomi Redmi 17': {
    weight: 340,    // ~190g máy + 150g hộp
    height: 5,
    length: 19,
    width: 10,
  },

  // ========== QUẦN ÁO MEDUSA ==========
  'Medusa T-Shirt': {
    weight: 250,    // áo thun nhẹ
    height: 3,      // gấp mỏng
    length: 30,
    width: 25,
  },
  'Medusa Sweatshirt': {
    weight: 500,    // áo nỉ nặng hơn
    height: 5,
    length: 35,
    width: 28,
  },
  'Medusa Sweatpants': {
    weight: 400,    // quần nỉ
    height: 5,
    length: 35,
    width: 28,
  },
  'Medusa Shorts': {
    weight: 220,    // quần short nhẹ
    height: 3,
    length: 30,
    width: 25,
  },
};

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🔍 Đang đọc danh sách sản phẩm...\n');

    const products = await client.query('SELECT id, title, weight, height, length, width FROM product ORDER BY title');
    
    let updated = 0;
    let skipped = 0;
    let notFound = 0;

    for (const product of products.rows) {
      const dims = phoneDimensions[product.title];
      
      if (!dims) {
        // Thử tìm gần đúng (ILIKE)
        const matched = Object.keys(phoneDimensions).find(key => 
          product.title.trim().toLowerCase() === key.trim().toLowerCase()
        );
        
        if (matched) {
          const d = phoneDimensions[matched];
          await updateProduct(client, product, d);
          updated++;
          continue;
        }
        
        console.log(`⚠️  Không tìm thấy kích thước cho: "${product.title}" (${product.id})`);
        notFound++;
        continue;
      }

      await updateProduct(client, product, dims);
      updated++;
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Đã cập nhật: ${updated} sản phẩm`);
    console.log(`⚠️  Không tìm thấy: ${notFound} sản phẩm`);
    console.log(`⏭️  Bỏ qua: ${skipped} sản phẩm`);
    console.log('='.repeat(60));

    // Cập nhật product_variant theo product
    console.log('\n📦 Đang đồng bộ kích thước sang product_variant...');
    const variantRes = await client.query(`
      UPDATE product_variant pv
      SET 
        weight = p.weight,
        length = p.length,
        width = p.width,
        height = p.height
      FROM product p
      WHERE pv.product_id = p.id
      AND p.weight IS NOT NULL;
    `);
    console.log(`✅ Đã đồng bộ ${variantRes.rowCount} variants.`);

    // Hiển thị kết quả cuối cùng
    console.log('\n📊 Kết quả sau khi seed:');
    const finalCheck = await client.query(`
      SELECT p.title, p.weight, p.height, p.length, p.width,
             ROUND((p.length * p.width * p.height) / 5000.0, 2) as "quy_doi_kg"
      FROM product p 
      WHERE p.weight IS NOT NULL
      ORDER BY p.title
    `);
    console.table(finalCheck.rows);

  } catch (err) {
    console.error('❌ Lỗi khi seed:', err);
  } finally {
    client.release();
    pool.end();
  }
}

async function updateProduct(client, product, dims) {
  await client.query(
    `UPDATE product SET weight = $1, height = $2, length = $3, width = $4 WHERE id = $5`,
    [dims.weight, dims.height, dims.length, dims.width, product.id]
  );
  
  const volumeWeight = ((dims.length * dims.width * dims.height) / 5000).toFixed(2);
  console.log(
    `✅ ${product.title.padEnd(42)} | ${dims.weight}g | ${dims.length}×${dims.width}×${dims.height}cm | QĐ: ${volumeWeight}kg`
  );
}

seed();
