import { Pool } from "pg";

async function run() {
  const pool = new Pool({
    connectionString: "postgresql://postgres.yumyjivpmdwkpdvrnurh:DatnEcom2026SecurePass@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
  });

  const res = await pool.query(`
    SELECT o.customer_id, oli.product_id, oli.product_title
    FROM "order" o
    JOIN order_item oi ON oi.order_id = o.id
    JOIN order_line_item oli ON oli.id = oi.item_id
    WHERE o.email = 'bienlekieu974@gmail.com' AND o.status = 'completed'
  `);
  
  console.log(res.rows);
  await pool.end();
}
run().catch(console.error);
