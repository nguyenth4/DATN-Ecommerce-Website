const fs = require('fs');
const path = require('path');

const envPaths = [
  path.join(__dirname, '.env'),
  path.join(__dirname, '../backend/apps/backend/.env'),
  path.join(__dirname, '../../backend/apps/backend/.env'),
  'd:/FPT Polytechnic/DATN/DATN-Ecommerce-Website/medusa-backend/backend/apps/backend/.env'
];

let envContent = '';
for (const p of envPaths) {
  if (fs.existsSync(p)) {
    console.log("Found .env at:", p);
    envContent = fs.readFileSync(p, 'utf-8');
    break;
  }
}

const match = envContent.match(/DATABASE_URL="?([^"\r\n]+)"?/);
if (!match) {
  console.error("DATABASE_URL not found in env files.");
  process.exit(1);
}

let dbUrl = match[1].split('?')[0];
const { Client } = require('pg');
const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

function generateMedusaId(prefix) {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 18; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}_01${result}`;
}

async function fixMissingCollections() {
  await client.connect();
  console.log("Checking for orders missing payment collections...");

  const missingRes = await client.query(`
    SELECT o.id, o.status, o.metadata, os.totals
    FROM "order" o
    LEFT JOIN order_payment_collection opc ON o.id = opc.order_id
    LEFT JOIN order_summary os ON os.order_id = o.id
    WHERE opc.id IS NULL
  `);

  console.log(`Found ${missingRes.rows.length} orders missing payment collections.`);

  for (const order of missingRes.rows) {
    const meta = order.metadata || {};
    const method = (meta.payment_method || 'cod').toLowerCase();
    
    let orderAmount = 0;
    if (order.totals && order.totals.original_order_total) {
      orderAmount = Number(order.totals.original_order_total);
    }

    const pcId = generateMedusaId('paycol');
    const ordpcId = generateMedusaId('ordpaycol');
    const paySessionId = generateMedusaId('payses');
    const paymentId = generateMedusaId('pay');
    const trxId = generateMedusaId('ordtrx');
    const rawAmtStr = JSON.stringify({ value: orderAmount.toString(), precision: 20 });

    const pcStatus = (meta.payment_status === 'paid' || method !== 'cod' || order.status === 'completed') ? 'authorized' : 'not_paid';

    await client.query(`
      INSERT INTO payment_collection (id, currency_code, amount, raw_amount, status, captured_amount, raw_captured_amount, authorized_amount, raw_authorized_amount, created_at, updated_at)
      VALUES ($1, 'vnd', $2, $3, $4, $5, $6, $5, $6, NOW(), NOW())
    `, [pcId, orderAmount, rawAmtStr, pcStatus, pcStatus === 'authorized' ? orderAmount : 0, pcStatus === 'authorized' ? rawAmtStr : JSON.stringify({ value: '0', precision: 20 })]);

    await client.query(`
      INSERT INTO order_payment_collection (id, order_id, payment_collection_id, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
    `, [ordpcId, order.id, pcId]);

    await client.query(`
      INSERT INTO payment_session (
        id, currency_code, amount, raw_amount, provider_id, 
        data, context, status, authorized_at, payment_collection_id, metadata, created_at, updated_at
      ) VALUES ($1, 'vnd', $2, $3, $4, '{}', '{}', 'authorized', NOW(), $5, '{}', NOW(), NOW())
    `, [paySessionId, orderAmount, rawAmtStr, method, pcId]);

    await client.query(`
      INSERT INTO payment (
        id, amount, raw_amount, currency_code, provider_id, 
        created_at, updated_at, captured_at, payment_collection_id, payment_session_id, data, metadata
      ) VALUES ($1, $2, $3, 'vnd', $4, NOW(), NOW(), NOW(), $5, $6, '{}', '{}')
    `, [paymentId, orderAmount, rawAmtStr, method, pcId, paySessionId]);

    await client.query(`
      INSERT INTO order_transaction (
        id, order_id, version, amount, raw_amount, currency_code, 
        reference, reference_id, created_at, updated_at
      ) VALUES ($1, $2, 1, $3, $4, 'vnd', 'capture', $5, NOW(), NOW())
    `, [trxId, order.id, orderAmount, rawAmtStr, paymentId]);
  }

  // 1. Update provider_id in payment table to match order metadata payment_method
  const r1 = await client.query(`
    UPDATE payment p
    SET provider_id = LOWER(o.metadata->>'payment_method'),
        updated_at = NOW()
    FROM payment_collection pc
    JOIN order_payment_collection opc ON pc.id = opc.payment_collection_id
    JOIN "order" o ON o.id = opc.order_id
    WHERE p.payment_collection_id = pc.id
      AND o.metadata->>'payment_method' IS NOT NULL
      AND p.provider_id <> LOWER(o.metadata->>'payment_method');
  `);
  console.log(`Updated ${r1.rowCount} rows in payment table.`);

  // 2. Update provider_id in payment_session table
  const r2 = await client.query(`
    UPDATE payment_session ps
    SET provider_id = LOWER(o.metadata->>'payment_method'),
        updated_at = NOW()
    FROM payment_collection pc
    JOIN order_payment_collection opc ON pc.id = opc.payment_collection_id
    JOIN "order" o ON o.id = opc.order_id
    WHERE ps.payment_collection_id = pc.id
      AND o.metadata->>'payment_method' IS NOT NULL
      AND ps.provider_id <> LOWER(o.metadata->>'payment_method');
  `);
  console.log(`Updated ${r2.rowCount} rows in payment_session table.`);

  await client.end();
  console.log("Complete!");
}

fixMissingCollections().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
