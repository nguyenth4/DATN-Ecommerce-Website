const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.yumyjivpmdwkpdvrnurh:DatnEcom2026SecurePass@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true',
});

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Seeding weight and dimensions...');

    // Phones and Electronics
    const phoneRes = await client.query(`
      UPDATE product_variant
      SET weight = 350, length = 18, width = 9, height = 5
      FROM product
      WHERE product_variant.product_id = product.id
      AND product.title NOT ILIKE '%Medusa%';
    `);
    console.log(`Updated ${phoneRes.rowCount} electronics variants.`);

    // Clothes
    const clothesRes = await client.query(`
      UPDATE product_variant
      SET weight = 200, length = 25, width = 20, height = 2
      FROM product
      WHERE product_variant.product_id = product.id
      AND product.title ILIKE '%Medusa%';
    `);
    console.log(`Updated ${clothesRes.rowCount} clothing variants.`);

  } catch (err) {
    console.error('Error seeding:', err);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
