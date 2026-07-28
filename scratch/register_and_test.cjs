const BASE = 'http://localhost:9000';
const PUBLISHABLE_KEY = 'pk_a2f0825ab169a70b98f5a520693ca5e8e633f36c1b5dabd5548326c5451c4e6d';

async function req(method, path, body, token) {
  const headers = { 
    'Content-Type': 'application/json',
    'x-publishable-key': PUBLISHABLE_KEY,
    'x-publishable-api-key': PUBLISHABLE_KEY
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { _raw: text }; }
  
  if (!res.ok) {
    console.error(`❌ ${method} ${path} → ${res.status}:`, json);
    throw new Error(`Request failed: ${res.status}`);
  }
  return json;
}

async function main() {
  const email = `test_${Date.now()}@example.com`;
  const password = 'password123';

  console.log("1. Registering customer auth...");
  const regRes = await req('POST', '/auth/customer/emailpass/register', { email, password });
  const registerToken = regRes.token;
  console.log("Register token obtained:", registerToken);

  console.log("2. Creating customer profile...");
  const custRes = await req('POST', '/store/customers', {
    first_name: 'Antigravity',
    last_name: 'Test',
    email,
    phone: '0912345678'
  }, registerToken);
  console.log("Customer created:", custRes.customer.id);

  console.log("3. Logging in to get customer session token...");
  const loginRes = await req('POST', '/auth/customer/emailpass', { email, password });
  const token = loginRes.token;
  console.log("Customer token obtained:", token);

  console.log("4. Creating Address 1 (set to default)...");
  const addr1 = await req('POST', '/store/customers/me/addresses', {
    first_name: 'Antigravity 1',
    last_name: 'Test',
    phone: '0912345678',
    address_1: 'Address 1',
    city: 'Quận 1',
    province: 'Thành phố Hồ Chí Minh',
    postal_code: '700000',
    country_code: 'vn',
    is_default_shipping: true
  }, token);
  console.log("Address 1 created.");

  console.log("5. Creating Address 2 (not default)...");
  const addr2 = await req('POST', '/store/customers/me/addresses', {
    first_name: 'Antigravity 2',
    last_name: 'Test',
    phone: '0912345678',
    address_1: 'Address 2',
    city: 'Quận 1',
    province: 'Thành phố Hồ Chí Minh',
    postal_code: '700000',
    country_code: 'vn',
    is_default_shipping: false
  }, token);
  console.log("Address 2 created.");

  console.log("6. Fetching addresses before toggle...");
  let profile = await req('GET', '/store/customers/me?fields=*addresses', null, token);
  profile.customer.addresses.forEach(a => {
    console.log(`Address ID: ${a.id}, first_name: ${a.first_name}, is_default_shipping: ${a.is_default_shipping}`);
  });

  console.log("7. Setting Address 2 to default shipping...");
  const targetId = profile.customer.addresses.find(a => a.first_name === 'Antigravity 2').id;
  await req('POST', `/store/customers/me/addresses/${targetId}`, {
    is_default_shipping: true
  }, token);
  console.log("Address 2 set to default.");

  console.log("8. Fetching addresses after toggle...");
  profile = await req('GET', '/store/customers/me?fields=*addresses', null, token);
  profile.customer.addresses.forEach(a => {
    console.log(`Address ID: ${a.id}, first_name: ${a.first_name}, is_default_shipping: ${a.is_default_shipping}`);
  });
}

main().catch(console.error);
