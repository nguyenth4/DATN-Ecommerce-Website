async function run() {
  try {
    const res = await fetch('http://localhost:9000/auth/user/emailpass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@medusa-test.com', password: 'supersecret' })
    });
    
    const data = await res.text();
    console.log("Status:", res.status);
    console.log("Body:", data);
  } catch(e) {
    console.error(e);
  }
}
run();
