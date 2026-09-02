require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT * FROM reviews ORDER BY created_at DESC LIMIT 5;', (err, res) => {
  if (err) console.error(err);
  else console.log(res.rows);
  pool.end();
});
