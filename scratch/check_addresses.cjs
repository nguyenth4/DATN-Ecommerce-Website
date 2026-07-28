const { Client } = require('pg');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres:Sprylo2026SecureDb9x@db.yumyjivpmdwkpdvrnurh.supabase.co:5432/postgres?sslmode=require",
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  try {
    // 1. List all address-related tables
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND (table_name LIKE '%address%' OR table_name LIKE '%customer%');
    `);
    console.log("Address / Customer tables:");
    console.log(tablesRes.rows.map(r => r.table_name));

    // 2. Describe customer columns
    const customerCols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'customer';
    `);
    console.log("\nCustomer columns:");
    console.log(customerCols.rows.map(c => `${c.column_name} (${c.data_type})`));

    // 3. Describe address columns if any address table exists
    const addressTable = tablesRes.rows.find(r => r.table_name === 'address') ? 'address' : 
                         tablesRes.rows.find(r => r.table_name === 'customer_address') ? 'customer_address' : null;
    
    if (addressTable) {
      const addressCols = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1;
      `, [addressTable]);
      console.log(`\n${addressTable} columns:`);
      console.log(addressCols.rows.map(c => `${c.column_name} (${c.data_type})`));
    }

    // 4. Let's see some sample addresses
    if (addressTable) {
      const addressesSample = await client.query(`
        SELECT * FROM ${addressTable} LIMIT 3;
      `);
      console.log(`\nSample addresses from ${addressTable}:`);
      console.log(JSON.stringify(addressesSample.rows, null, 2));
    }

  } catch (err) {
    console.error("Database query failed:", err);
  } finally {
    await client.end();
  }
}

main();
