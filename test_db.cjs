const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
async function run() {
  await client.connect();
  const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'wallet_transaction'");
  console.log(res.rows);
  await client.end();
}
run();
