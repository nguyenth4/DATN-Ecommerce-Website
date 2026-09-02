import { Pool } from "pg";

async function run() {
  const pool = new Pool({
    connectionString: "postgresql://postgres.yumyjivpmdwkpdvrnurh:DatnEcom2026SecurePass@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
  });

  const res = await pool.query(`
    SELECT o.id, o.status, oli.product_id
    FROM "order" o
    JOIN order_item oi ON oi.order_id = o.id
    JOIN order_line_item oli ON oli.id = oi.item_id
    WHERE o.customer_id = 'cus_01KVS3CAPF91NGY79S5F3TAC7S'
  `);
  
  console.log(res.rows);
  await pool.end();
}
run().catch(console.error);
