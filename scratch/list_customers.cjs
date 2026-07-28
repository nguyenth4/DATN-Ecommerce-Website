const { Client } = require('pg');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres:Sprylo2026SecureDb9x@db.yumyjivpmdwkpdvrnurh.supabase.co:5432/postgres?sslmode=require",
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  try {
    const res = await client.query(`
      SELECT id, email, first_name, last_name 
      FROM customer 
      LIMIT 10;
    `);

    console.log("Customers:");
    console.log(res.rows);
  } catch (err) {
    console.error("Database query failed:", err);
  } finally {
    await client.end();
  }
}

main();
