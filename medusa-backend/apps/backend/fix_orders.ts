import { Pool } from "pg";

async function run() {
  const pool = new Pool({
    connectionString: "postgresql://postgres.yumyjivpmdwkpdvrnurh:DatnEcom2026SecurePass@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true",
    ssl: { rejectUnauthorized: false }
  });

  const res = await pool.query(`
    UPDATE "order" 
    SET metadata = jsonb_set(metadata, '{payment_status}', '"captured"') 
    WHERE display_id IN (98, 96, 95, 94, 93)
  `);
  console.log(`Updated ${res.rowCount} orders payment_status to captured.`);
  
  process.exit(0);
}
run();
