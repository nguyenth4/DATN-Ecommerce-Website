import { Pool } from "pg";

async function run() {
  const pool = new Pool({
    connectionString: "postgresql://postgres.yumyjivpmdwkpdvrnurh:DatnEcom2026SecurePass@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
  });

  const res = await pool.query(`
    SELECT id, email, metadata FROM "order" 
    WHERE status = 'canceled'
    ORDER BY created_at DESC LIMIT 2
  `);
  
  if (res.rowCount === 0) {
    console.log("No canceled orders found to revive.");
    await pool.end();
    return;
  }
  
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
    
    await pool.query(`
      UPDATE "order" 
      SET status = 'completed', 
          payment_status = 'captured',
          metadata = $1
      WHERE id = $2
    `, [metadata, row.id]);
    
    // Also update customer email to 'bienlekieu974@gmail.com' for easier testing if needed
    console.log(`Updated order ${row.id} to completed/captured`);
  }
  
  await pool.end();
}
run().catch(console.error);
