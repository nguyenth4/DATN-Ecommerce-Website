const fs = require('fs');
const { Client } = require('pg');
require('dotenv').config();

async function check() {
  const dbUrl = process.env.DATABASE_URL.split('?')[0];
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  const res = await client.query('SELECT column_name FROM information_schema.columns WHERE table_name = \'order\'');
  console.log(res.rows.map(r => r.column_name).join(', '));

  const orderRes = await client.query('SELECT payment_status FROM "order" ORDER BY created_at DESC LIMIT 5');
  console.log(orderRes.rows);
  
  await client.end();
}
check();
