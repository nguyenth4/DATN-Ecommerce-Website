const { Client } = require('pg');

async function main() {
  const client = new Client({
    user: 'postgres',
    host: 'db.yumyjivpmdwkpdvrnurh.supabase.co',
    database: 'postgres',
    password: 'Sprylo2026SecureDb9x',
    port: 5432,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  const sample = await client.query(`
    SELECT * FROM provider_identity WHERE provider = 'emailpass' LIMIT 3;
  `);
  console.log("Sample emailpass records:");
  for (const row of sample.rows) {
    console.log("------------------------");
    console.log("ID:", row.id);
    console.log("Entity ID (email?):", row.entity_id);
    console.log("Provider Metadata:", JSON.stringify(row.provider_metadata, null, 2));
  }

  await client.end();
}

main().catch(console.error);
