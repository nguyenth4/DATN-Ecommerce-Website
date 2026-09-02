const fs = require('fs');
let dbUrl = fs.readFileSync('.env', 'utf-8').match(/DATABASE_URL="([^"]+)"/)[1];
dbUrl = dbUrl.split('?')[0]; 
const { Client } = require('pg');
const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
async function run() {
  await client.connect();
  
  // Get 3 canceled orders
  const orders = await client.query(`
    SELECT id FROM "order" 
    WHERE status = 'canceled'
    ORDER BY created_at DESC LIMIT 3
  `);
  
  const orderIds = orders.rows.map(r => r.id);
  if(orderIds.length === 0) { console.log('No canceled orders found either'); return; }
  
  // Update order status
  await client.query(`
    UPDATE "order" SET status = 'completed' WHERE id = ANY($1)
  `, [orderIds]);
  
  // Find payment collections
  const pc = await client.query(`
    SELECT payment_collection_id FROM order_payment_collection WHERE order_id = ANY($1)
  `, [orderIds]);
  const pcIds = pc.rows.map(r => r.payment_collection_id);
  
  // Update payment_collection status to authorized, set amounts
  if (pcIds.length > 0) {
    await client.query(`
      UPDATE payment_collection 
      SET status = 'authorized', 
          authorized_amount = amount,
          raw_authorized_amount = raw_amount,
          captured_amount = amount, 
          raw_captured_amount = raw_amount 
      WHERE id = ANY($1)
    `, [pcIds]);
    
    // Also update payments (if they exist)
    await client.query(`
      UPDATE payment
      SET captured_at = NOW()
      WHERE payment_collection_id = ANY($1)
    `, [pcIds]);
  }
  
  console.log('Restored 3 canceled orders to completed and authorized/captured');
  await client.end();
}
run();
