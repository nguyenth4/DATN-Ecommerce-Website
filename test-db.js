import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres.xeqsnglavqnlkpnqxrdx:duantotnghiep%40123@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => {
    console.log('KET NOI SUPABASE THANH CONG!');
    return client.query('SELECT version(), current_database()');
  })
  .then(r => {
    console.log('Database:', r.rows[0].current_database);
    console.log('PostgreSQL:', r.rows[0].version.substring(0, 60));
    return client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`);
  })
  .then(r => {
    console.log('\nSo bang trong public schema:', r.rows.length);
    if (r.rows.length === 0) {
      console.log('   => Chua co bang nao (DB trong, can tao bang)');
    } else {
      r.rows.forEach(row => console.log('   -', row.table_name));
    }
    client.end();
  })
  .catch(err => {
    console.error('LOI KET NOI:', err.message);
    client.end();
    process.exit(1);
  });
