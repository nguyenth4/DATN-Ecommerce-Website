import { Pool } from "pg";

async function run() {
  const pool = new Pool({
    connectionString: "postgresql://postgres.yumyjivpmdwkpdvrnurh:DatnEcom2026SecurePass@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
  });

  const res = await pool.query(`UPDATE "order" SET status = 'canceled' WHERE status = 'pending'`);
  console.log(`Canceled ${res.rowCount} pending orders.`);
  
  await pool.end();
}
run().catch(console.error);
