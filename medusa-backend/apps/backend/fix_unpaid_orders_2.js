const fs = require('fs');
let dbUrl = fs.readFileSync('.env', 'utf-8').match(/DATABASE_URL="([^"]+)"/)[1].split('?')[0];
const { Client } = require('pg');
const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function fix() {
  await client.connect();

  const orders = await client.query(`
    SELECT id, metadata FROM "order" 
    WHERE (metadata->>'payment_method' IN ('vnpay', 'zalopay', 'wallet') OR metadata->>'payment_status' = 'paid') 
  `);

  if (orders.rows.length === 0) {
    console.log('No orders to fix');
    await client.end();
    return;
  }

  const orderIds = orders.rows.map(r => r.id);
  
  await client.query(`
    UPDATE "order" SET status = 'completed' WHERE id = ANY($1)
  `, [orderIds]);

  const pc = await client.query(`
    SELECT payment_collection_id FROM order_payment_collection WHERE order_id = ANY($1)
  `, [orderIds]);

  const pcIds = pc.rows.map(r => r.payment_collection_id);

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
    
    await client.query(`
      UPDATE payment
      SET captured_at = NOW()
      WHERE payment_collection_id = ANY($1)
    `, [pcIds]);
  }

  console.log(`Fixed ${orders.rows.length} orders by setting their payment_collections to authorized and captured.`);
  await client.end();
}

fix().catch(console.error);
