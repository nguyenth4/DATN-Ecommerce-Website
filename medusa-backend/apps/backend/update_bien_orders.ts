import { Pool } from "pg";

async function run() {
  const pool = new Pool({
    connectionString: "postgresql://postgres.yumyjivpmdwkpdvrnurh:DatnEcom2026SecurePass@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
  });

  const res = await pool.query(`
    SELECT id, email, metadata, display_id FROM "order" 
    WHERE email = 'bienlekieu974@gmail.com' AND status IN ('canceled', 'pending')
    ORDER BY created_at DESC LIMIT 2
  `);
  
  if (res.rowCount === 0) {
    console.log("No orders found for this user.");
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
    // Update to completed
    await pool.query(`
      UPDATE "order" 
      SET status = 'completed', 
          metadata = $1
      WHERE id = $2
    `, [metadata, row.id]);
    
    // Also update any payment collection for this order to 'authorized' or 'captured'
    await pool.query(`
      UPDATE payment_collection 
      SET status = 'authorized' 
      WHERE order_id = $1
    `, [row.id]).catch(e => console.log("No payment collection for", row.id));

    console.log(`Updated order #${row.display_id} (${row.id}) to completed`);
  }
  
  await pool.end();
}
run().catch(console.error);
