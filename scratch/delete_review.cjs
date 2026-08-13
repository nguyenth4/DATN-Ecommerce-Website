// Script xóa bình luận không liên quan khỏi bảng reviews
const { Client } = require('pg');

const DB_URL = 'postgresql://postgres:Sprylo2026SecureDb9x@db.yumyjivpmdwkpdvrnurh.supabase.co:5432/postgres?sslmode=require';

async function main() {
  const client = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('✅ Đã kết nối database\n');

  // Xem tất cả bình luận hiện có
  const listRes = await client.query(`
    SELECT id, user_name, comment, created_at FROM reviews ORDER BY created_at DESC LIMIT 20
  `);

  console.log('📋 Danh sách bình luận hiện có:');
  listRes.rows.forEach(r => {
    console.log(`  [${r.id}] ${r.user_name}: "${r.comment}" (${new Date(r.created_at).toLocaleDateString('vi-VN')})`);
  });

  // Xóa bình luận "cơm ngon" của Nguyễn Dư
  const deleteRes = await client.query(`
    DELETE FROM reviews 
    WHERE LOWER(comment) = LOWER('cơm ngon')
    RETURNING id, user_name, comment
  `);

  if (deleteRes.rows.length > 0) {
    console.log('\n🗑️  Đã xóa các bình luận:');
    deleteRes.rows.forEach(r => {
      console.log(`  ✓ [${r.id}] ${r.user_name}: "${r.comment}"`);
    });
  } else {
    console.log('\n⚠️  Không tìm thấy bình luận "cơm ngon" để xóa.');
  }

  // Cập nhật lại rating trong product metadata sau khi xóa
  const productsRes = await client.query(`
    SELECT DISTINCT product_id FROM reviews
  `);

  for (const row of productsRes.rows) {
    const statsRes = await client.query(`
      SELECT AVG(rating)::numeric(4,1) as avg_rating, COUNT(*) as total
      FROM reviews WHERE product_id = $1
    `, [row.product_id]);

    const avg = parseFloat(statsRes.rows[0]?.avg_rating || '5.0');
    const total = parseInt(statsRes.rows[0]?.total || '0');

    await client.query(`
      UPDATE product
      SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('rating', $1::numeric, 'review_count', $2::integer)
      WHERE id = $3
    `, [avg, total, row.product_id]);
  }

  console.log('\n✅ Đã cập nhật lại rating cho tất cả sản phẩm.');
  await client.end();
}

main().catch(err => {
  console.error('❌ Lỗi:', err.message);
  process.exit(1);
});
