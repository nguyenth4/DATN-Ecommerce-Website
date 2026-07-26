const { Client } = require('pg');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.xeqsnglavqnlkpnqxrdx:duantotnghiep%40123@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require",
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  try {
    const res = await client.query(`
      SELECT id, email, first_name, last_name, phone, metadata 
      FROM customer 
      WHERE email = 'van.binh.tran@example.com' OR email = 'thi.thu.hoang@example.com'
      LIMIT 5;
    `);

    console.log("Customer records found:");
    console.log(JSON.stringify(res.rows, null, 2));

    const authRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('auth_user', 'auth_identity');
    `);
    console.log("Auth tables list:", authRes.rows);

    if (authRes.rows.some(r => r.table_name === 'auth_identity')) {
      const identityRes = await client.query(`
        SELECT * FROM auth_identity 
        WHERE identifier = 'van.binh.tran@example.com' OR identifier = 'thi.thu.hoang@example.com';
      `);
      console.log("Auth identities found:");
      console.log(JSON.stringify(identityRes.rows, null, 2));
    }
  } catch (err) {
    console.error("Database query failed:", err);
  } finally {
    await client.end();
  }
}

main();
