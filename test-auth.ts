import Medusa from '@medusajs/js-sdk';

const medusa = new Medusa({
  baseUrl: 'http://localhost:9000',
  debug: true,
  auth: {
    type: 'token',
  },
});

async function run() {
  try {
    console.log("Trying to authenticate...");
    const result = await medusa.admin.auth.getToken({
      email: 'admin@medusa-test.com',
      password: 'supersecret',
    });
    console.log("Success:", result);
  } catch (err: any) {
    console.error("Failed:", err.message);
    if (err.response) {
      console.error("Response data:", err.response.data);
    }
  }
}

run();
