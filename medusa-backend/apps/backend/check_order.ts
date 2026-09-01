import { Pool } from "pg";

async function run() {
  const pool = new Pool({
    connectionString: "postgresql://postgres.yumyjivpmdwkpdvrnurh:DatnEcom2026SecurePass@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true",
    ssl: { rejectUnauthorized: false }
  });

  const res = await pool.query(`SELECT * FROM "order" WHERE id = 'order_01M1DGV9T2K4RFMHXWVC382PCA';`);
  console.log(JSON.stringify(res.rows, null, 2));
  process.exit(0);
}
run();
