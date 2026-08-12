const fetch = require('node-fetch-commonjs');

async function main() {
  const res = await fetch('http://localhost:9000/auth/customer/google', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': 'pk_a2f0825ab169a70b98f5a520693ca5e8e633f36c1b5dabd5548326c5451c4e6d'
    },
    body: JSON.stringify({ callback_url: 'http://localhost:5173/auth/callback?_type=google' })
  });

  const data = await res.json();
  console.log('Response status:', res.status);
  console.log('Response body:', JSON.stringify(data, null, 2));
}

main().catch(console.error);
