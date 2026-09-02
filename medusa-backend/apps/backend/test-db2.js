const { Client } = require("pg");
const c = new Client({ connectionString: "postgresql://postgres.yumyjivpmdwkpdvrnurh:DatnEcom2026SecurePass@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true" });
c.connect().then(() => c.query("SELECT * FROM reviews")).then(r => console.log("OK")).catch(e => console.error(e.message)).finally(() => c.end());
