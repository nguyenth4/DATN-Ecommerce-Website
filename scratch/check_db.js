const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.xeqsnglavqnlkpnqxrdx:duantotnghiep%40123@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres',
});

async function checkDb() {
  try {
    await client.connect();
    
    const productsRes = await client.query('SELECT id, title, handle FROM product LIMIT 5');
    console.log('--- Products ---');
    console.log(`Found ${productsRes.rowCount} products.`);
    if (productsRes.rowCount > 0) {
        console.table(productsRes.rows);
    } else {
        console.log('No products found.');
    }

    const categoriesRes = await client.query('SELECT id, name, handle FROM product_category LIMIT 5');
    console.log('\n--- Categories ---');
    console.log(`Found ${categoriesRes.rowCount} categories.`);
    if (categoriesRes.rowCount > 0) {
        console.table(categoriesRes.rows);
    } else {
        console.log('No categories found.');
    }

  } catch (err) {
    console.error('Error connecting or querying database:', err.message);
  } finally {
    await client.end();
  }
}

checkDb();
