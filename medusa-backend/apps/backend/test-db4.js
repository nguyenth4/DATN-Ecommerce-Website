const { Client } = require("pg");
const c = new Client({ connectionString: "postgresql://postgres.yumyjivpmdwkpdvrnurh:DatnEcom2026SecurePass@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true" });
c.connect().then(() => c.query(`
      SELECT 
        r.id, 
        r.user_id, 
        r.product_id, 
        r.rating, 
        r.comment, 
        r.created_at, 
        r.user_name,
        r.images,
        COALESCE(p.title, r.product_id) as product_title,
        p.thumbnail as product_thumbnail
      FROM reviews r
      LEFT JOIN product p ON p.id = r.product_id OR ('prod_' || p.title) = r.product_id OR r.product_id ILIKE '%' || p.title || '%'
      ORDER BY r.created_at DESC
      LIMIT 1
`)).then(r => console.log("OK, count:", r.rows.length)).catch(e => console.error(e.message)).finally(() => c.end());
