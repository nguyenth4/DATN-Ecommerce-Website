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
    
    // In Medusa v2, the column for payment status is just payment_collections or derived
    // I will just set metadata to indicate payment if I want, or just status = 'completed'
    await pool.query(`
      UPDATE "order" 
      SET status = 'completed', 
          metadata = $1
      WHERE id = $2
    `, [metadata, row.id]);
    
    // Update payment collection status
    await pool.query(`
      UPDATE payment_collection 
      SET status = 'authorized' 
      WHERE order_id = $1
    `, [row.id]).catch(e => console.log("No payment collection for", row.id));

    console.log(`Updated order ${row.id} to completed`);
  }
  
  await pool.end();
}
run().catch(console.error);
