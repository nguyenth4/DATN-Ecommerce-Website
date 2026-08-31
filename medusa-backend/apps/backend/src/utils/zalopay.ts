import crypto from 'crypto';

/**
 * Tạo ZaloPay payment URL.
 * app_trans_id MUST được lưu lại để map với Medusa orderId khi callback về.
 * Returns: { order_url, app_trans_id } hoặc null nếu lỗi.
 */
export async function buildZalopayUrl(
  medusaOrderId: string,
  amount: number,
  orderInfo: string
): Promise<{ order_url: string; app_trans_id: string } | null> {
  const appId = parseInt(process.env.ZALOPAY_APP_ID || '2554');
  const key1  = process.env.ZALOPAY_KEY1 || 'sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn';
  const endpoint   = process.env.ZALOPAY_ENDPOINT    || 'https://sb-openapi.zalopay.vn/v2/create';
  // redirecturl = nơi ZaloPay redirect user về sau khi thanh toán (FE)
  const redirectUrl = `${process.env.STORE_FRONTEND_URL || 'http://localhost:5174'}/checkout/zalopay_return`;
  // callback_url = ZaloPay POST vào server để xác nhận (BE, không được dùng localhost ngoài sandbox)
  const callbackUrl = process.env.ZALOPAY_CALLBACK_URL || `${process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'}/payment/zalopay/callback`;

  // ZaloPay yêu cầu YYMMDD theo giờ VN
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  const yy = d.getFullYear().toString().slice(-2);
  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
  const dd = d.getDate().toString().padStart(2, '0');
  const vnDate = `${yy}${mm}${dd}`;
  const transID = Math.floor(Math.random() * 1_000_000);
  const app_trans_id = `${vnDate}_${transID}`;

  const embed_data = {
    // redirecturl: sau khi user thanh toán xong, ZaloPay redirect về đây
    redirecturl: redirectUrl,
    // Gửi kèm medusaOrderId để callback có thể map lại
    medusa_order_id: medusaOrderId,
  };

  const orderPayload: Record<string, any> = {
    app_id:       appId,
    app_trans_id: app_trans_id,
    app_user:     'DATN_User',
    app_time:     Date.now(),
    item:         JSON.stringify([]),
    embed_data:   JSON.stringify(embed_data),
    amount:       amount,
    description:  orderInfo.substring(0, 256),
    bank_code:    '',
    callback_url: callbackUrl,
    mac:          '',
  };

  const signStr = [
    orderPayload.app_id,
    orderPayload.app_trans_id,
    orderPayload.app_user,
    orderPayload.amount,
    orderPayload.app_time,
    orderPayload.embed_data,
    orderPayload.item,
  ].join('|');

  orderPayload.mac = crypto.createHmac('sha256', key1).update(signStr).digest('hex');

  try {
    console.log(`[ZaloPay] Creating order: app_trans_id=${app_trans_id}, medusa_order_id=${medusaOrderId}, amount=${amount}`);
    const res = await fetch(endpoint, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(orderPayload),
    });
    const result = await res.json() as any;
    console.log('[ZaloPay] Create order response:', result);

    if (result.return_code === 1 && result.order_url) {
      return { order_url: result.order_url, app_trans_id };
    }
    console.error('[ZaloPay] Non-success return_code:', result.return_code, result.return_message);
  } catch (error) {
    console.error('[ZaloPay] Create order error:', error);
  }
  return null;
}
