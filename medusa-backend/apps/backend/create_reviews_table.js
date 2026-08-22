const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres.yumyjivpmdwkpdvrnurh:Sprylo2026SecureDb9x@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Create reviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        product_id VARCHAR(50) NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        user_name VARCHAR(100),
        images TEXT[] DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Reviews table created successfully.");
  } catch (err) {
    console.error("Error creating reviews table", err);
  } finally {
    await client.end();
  }
}

run();
