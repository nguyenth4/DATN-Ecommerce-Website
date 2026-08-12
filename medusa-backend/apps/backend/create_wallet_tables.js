const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres.yumyjivpmdwkpdvrnurh:Sprylo2026SecureDb9x@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Create wallet table
    await client.query(`
      CREATE TABLE IF NOT EXISTS wallet (
        id VARCHAR(50) PRIMARY KEY,
        customer_id VARCHAR(50) NOT NULL UNIQUE,
        balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create wallet_transaction table
    await client.query(`
      CREATE TABLE IF NOT EXISTS wallet_transaction (
        id VARCHAR(50) PRIMARY KEY,
        wallet_id VARCHAR(50) NOT NULL REFERENCES wallet(id) ON DELETE CASCADE,
        amount NUMERIC(15, 2) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('topup', 'deduction', 'refund')),
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Tables created successfully.");
  } catch (err) {
    console.error("Error creating tables", err);
  } finally {
    await client.end();
  }
}

run();
