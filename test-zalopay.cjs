const crypto = require('crypto');

async function testZaloPay() {
  const config = {
    app_id: process.env.ZALOPAY_APP_ID || "2553",
    key1: process.env.ZALOPAY_KEY1 || "Pc94W2rvqAee8DhF2rBegigwkgho0AcZ",
    endpoint: process.env.ZALOPAY_ENDPOINT || "https://sb-openapi.zalopay.vn/v2/create",
    callback_url: process.env.ZALOPAY_RETURN_URL || "http://localhost:9000/store/payment/zalopay/callback"
  };

  const embed_data = { redirecturl: config.callback_url };
  const items = [];
  const transID = Math.floor(Math.random() * 1000000);
  const app_trans_id = `${new Date().toISOString().slice(2, 4)}${new Date().toISOString().slice(5, 7)}${new Date().toISOString().slice(8, 10)}_${transID}`;

  const order = {
    app_id: config.app_id,
    app_trans_id: app_trans_id,
    app_user: "DATN_User",
    app_time: Date.now(),
    item: JSON.stringify(items),
    embed_data: JSON.stringify(embed_data),
    amount: 50000,
    description: "Thanh toan don hang test",
    bank_code: "",
    mac: ""
  };

  const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
  order.mac = crypto.createHmac('sha256', config.key1).update(data).digest('hex');

  // Convert to x-www-form-urlencoded
  const formParams = new URLSearchParams();
  for (const key in order) {
    formParams.append(key, order[key]);
  }

  try {
    const res = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formParams.toString()
    });
    const result = await res.json();
    console.log("ZaloPay response:", result);
  } catch (error) {
    console.error("Zalopay create order error:", error);
  }
}

testZaloPay();
