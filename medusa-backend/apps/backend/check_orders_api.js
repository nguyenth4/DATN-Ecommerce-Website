const axios = require('axios');
const fs = require('fs');

async function test() {
  try {
    const res = await axios.post('http://localhost:9000/store/customers/me', {
      email: 'bienlekieu974@gmail.com',
      password: '123'
    }, {
      headers: {
        'x-publishable-api-key': 'pk_a2f0825ab169a70b98f5a520693ca5e8e633f36c1b5dabd5548326c5451c4e6d'
      }
    });
    
    // We get a token
    const token = res.data.token || '';
    // Actually store/customers/me returns { customer } in v2? No, POST auth is different in v2
  } catch (err) {
    console.error(err.message);
  }
}
test();
