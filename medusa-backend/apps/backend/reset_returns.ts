import { Pool } from "pg";

async function run() {
  const pool = new Pool({
    connectionString: "postgresql://postgres.yumyjivpmdwkpdvrnurh:DatnEcom2026SecurePass@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true",
    ssl: { rejectUnauthorized: false }
  });

  const res = await pool.query(`
    UPDATE "order" 
    SET metadata = metadata - 'return_requested' - 'return_reason' - 'return_requested_at' - 'refund_info'
    WHERE metadata->>'return_requested' = 'true'
  `);
  console.log(`Reset ${res.rowCount} orders that had return_requested=true.`);
  
  process.exit(0);
}
run();
