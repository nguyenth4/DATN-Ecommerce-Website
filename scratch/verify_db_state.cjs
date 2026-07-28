const pg = require('pg');

const connectionString = "postgresql://postgres:Sprylo2026SecureDb9x@db.yumyjivpmdwkpdvrnurh.supabase.co:5432/postgres?sslmode=require";

async function main() {
  const client = new pg.Client({ connectionString });
  await client.connect();

  console.log("Querying customer_address table...");
  const res = await client.query(`
    SELECT id, customer_id, first_name, last_name, phone, address_1, is_default_shipping, company, metadata
    FROM customer_address
    ORDER BY created_at DESC
    LIMIT 5
  `);

  console.log("Latest 5 addresses:");
  console.log(JSON.stringify(res.rows, null, 2));

  await client.end();
}

main().catch(console.error);
