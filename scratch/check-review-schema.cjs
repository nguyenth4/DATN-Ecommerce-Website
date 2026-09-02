const { Client } = require('pg');
async function run() {
  const c = new Client({ connectionString: 'postgresql://postgres.yumyjivpmdwkpdvrnurh:DatnEcom2026SecurePass@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true', ssl: { rejectUnauthorized: false } });
  await c.connect();
  const res = await c.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'reviews'");
  console.log(res.rows);
  await c.end();
}
run();
