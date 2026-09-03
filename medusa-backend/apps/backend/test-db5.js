const { Client } = require("pg");
const c = new Client({ connectionString: "postgresql://postgres.yumyjivpmdwkpdvrnurh:DatnEcom2026SecurePass@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true" });
c.connect().then(() => c.query(`SELECT COUNT(*) FROM product`)).then(r => console.log("Products count:", r.rows[0].count)).catch(e => console.error(e.message)).finally(() => c.end());
