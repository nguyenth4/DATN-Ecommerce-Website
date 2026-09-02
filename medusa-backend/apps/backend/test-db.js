const { Client } = require("pg");
const c = new Client({ connectionString: "postgresql://postgres.yumyjivpmdwkpdvrnurh:DatnEcom2026SecurePass@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true", ssl: { rejectUnauthorized: false } });
c.connect().then(() => c.query("SELECT COUNT(*) FROM reviews")).then(r => console.log("Reviews count:", r.rows[0].count)).catch(e => console.error(e.message)).finally(() => c.end());
