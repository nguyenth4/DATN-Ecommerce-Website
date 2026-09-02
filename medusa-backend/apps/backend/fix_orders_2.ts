import { Pool } from "pg";

async function run() {
  const pool = new Pool({
    connectionString: "postgresql://postgres.yumyjivpmdwkpdvrnurh:DatnEcom2026SecurePass@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
  });

  const res = await pool.query(`
    SELECT id, email, metadata FROM "order" 
    WHERE email = 'bienlekieu974@gmail.com' 
    ORDER BY created_at DESC LIMIT 3
  `);
  
  for (const row of res.rows) {
    let metadata = row.metadata || {};
    if (typeof metadata === 'string') {
        try {
            metadata = JSON.parse(metadata);
        } catch (e) {
            metadata = {};
        }
    }
    metadata.custom_status = 'delivered';
    metadata.return_requested = true;
    metadata.return_reason = 'Test hoàn tiền';
    metadata.payment_method = 'cod';
    
    await pool.query(`UPDATE "order" SET status = 'completed', metadata = $1 WHERE id = $2`, [metadata, row.id]);
    console.log(`Updated order ${row.id}`);
  }
  
  await pool.end();
}
run().catch(console.error);
