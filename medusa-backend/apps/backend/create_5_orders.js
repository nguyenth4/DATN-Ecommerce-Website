const fs = require('fs');
let dbUrl = fs.readFileSync('.env', 'utf-8').match(/DATABASE_URL="([^"]+)"/)[1];
dbUrl = dbUrl.split('?')[0]; 
const { Client } = require('pg');
const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
const axios = require('axios');

async function run() {
  await client.connect();
  
  const customerRes = await client.query("SELECT id, email FROM customer WHERE email = 'bienlekieu974@gmail.com' LIMIT 1");
  let customer = customerRes.rows[0];
  if (!customer) { 
    console.log('Customer bienlekieu974@gmail.com not found, falling back to any customer');
    const fallback = await client.query('SELECT id, email FROM customer LIMIT 1');
    customer = fallback.rows[0];
    if (!customer) { console.log('No customer found'); return; }
  }

  const variantRes = await client.query('SELECT id, title FROM product_variant LIMIT 1');
  const variant = variantRes.rows[0];

  const methods = ['cod', 'vnpay', 'zalopay', 'vnpay', 'cod'];
  
  for (let i = 0; i < 5; i++) {
    const paymentMethod = methods[i];
    console.log(`Creating order ${i+1} with payment method: ${paymentMethod}`);
    
    const payload = {
      customer: { email: customer.email, fullName: 'Test User', phoneNumber: '0123456789' },
      customer_id: customer.id,
      address: {
        province: 'Hà Nội', district: 'Quận Ba Đình', ward: 'Phường Phúc Xá', detail: 'Số 1',
        metadata: { province_id: 1, district_id: 1, ward_code: "1" }
      },
      paymentMethod: 'cod',
      shippingMethod: 'ghn_express',
      items: [{
        id: variant.id,
        name: 'Sản phẩm Test',
        price: 150000,
        qty: 1,
        variant: variant.title,
        img: ''
      }],
      use_wallet: false,
      totalAmount: 150000
    };

    try {
      const res = await axios.post('http://localhost:9000/store/checkout', payload, {
        headers: { 'x-publishable-api-key': 'pk_a2f0825ab169a70b98f5a520693ca5e8e633f36c1b5dabd5548326c5451c4e6d' }
      });
      console.log(`Checkout response:`, res.data.message || res.data);
    } catch (err) {
      console.error(`Checkout failed:`, err.response?.data || err.message);
      continue;
    }
    
    const orderRes = await client.query(`
      SELECT id, metadata FROM "order" 
      ORDER BY created_at DESC LIMIT 1
    `);
    
    if (orderRes.rows.length > 0) {
      const orderId = orderRes.rows[0].id;
      let metadata = orderRes.rows[0].metadata || {};
      metadata.payment_method = paymentMethod;
      metadata.shipping_status = 'Đã nhận';
      
      await client.query(`
        UPDATE "order" 
        SET status = 'completed', 
            metadata = $1
        WHERE id = $2
      `, [metadata, orderId]);
      
      const pcRes = await client.query(`SELECT payment_collection_id FROM order_payment_collection WHERE order_id = $1`, [orderId]);
      if (pcRes.rows.length > 0) {
        const pcId = pcRes.rows[0].payment_collection_id;
        await client.query(`UPDATE payment_collection SET status = 'authorized', captured_amount = amount, raw_captured_amount = raw_amount WHERE id = $1`, [pcId]);
        await client.query(`UPDATE payment SET captured_at = NOW() WHERE payment_collection_id = $1`, [pcId]);
      }
      
      console.log(`Order ${orderId} updated to completed, payment_status=captured, method=${paymentMethod}, status=Đã nhận`);
    }
    
    await new Promise(r => setTimeout(r, 1000));
  }
  
  await client.end();
  console.log('Done creating 5 orders');
}

run().catch(console.error);
