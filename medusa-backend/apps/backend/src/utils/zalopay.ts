import crypto from 'crypto';

export async function buildZalopayUrl(orderId: string, amount: number, orderInfo: string) {
  const config = {
    app_id: 2554,
    key1: "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
    endpoint: process.env.ZALOPAY_ENDPOINT || "https://sb-openapi.zalopay.vn/v2/create",
    callback_url: process.env.ZALOPAY_RETURN_URL || "http://localhost:9000/payment/zalopay/callback"
  };

  const embed_data = {
    redirecturl: config.callback_url
  };
  
  const items: any[] = [];
  const transID = Math.floor(Math.random() * 1000000);
  
  // ZaloPay requires YYMMDD based on Vietnam Timezone
  const d = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));
  const yy = d.getFullYear().toString().slice(-2);
  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
  const dd = d.getDate().toString().padStart(2, '0');
  const vnDate = `${yy}${mm}${dd}`;

  const app_trans_id = `${vnDate}_${transID}`;

  const order = {
    app_id: config.app_id,
    app_trans_id: app_trans_id,
    app_user: "DATN_User",
    app_time: Date.now(),
    item: JSON.stringify(items),
    embed_data: JSON.stringify(embed_data),
    amount: amount,
    description: orderInfo,
    bank_code: "",
    mac: ""
  };

  const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
  order.mac = crypto.createHmac('sha256', config.key1).update(data).digest('hex');

  try {
    const res = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(order)
    });
    const result = await res.json();
    if (result.return_code === 1) {
      return result.order_url;
    }
  } catch (error) {
    console.error("Zalopay create order error:", error);
  }
  return null;
}
