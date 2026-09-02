import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import crypto from 'crypto';

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-publishable-api-key, x-customer-id");
  return res.status(200).send();
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-publishable-api-key, x-customer-id");

  try {
    const { amount, customer_id } = req.body as any;

    if (!amount || !customer_id) {
      return res.status(400).json({ error: "Thiếu amount hoặc customer_id" });
    }

    const tmnCode = process.env.VNPAY_TMN_CODE || "CGPNVLJA";
    const hashSecret = process.env.VNPAY_SECURE_SECRET || process.env.VNPAY_HASH_SECRET || "RAOEXHYVSDDIIENYWSLDIIZTANXUXZFJ";
    const vnpUrl = process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    
    // Use the backend's ngrok URL or localhost if not available
    const callbackUrl = process.env.VNPAY_TOPUP_CALLBACK_URL || `${process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'}/payment/vnpay-wallet-callback`;

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const vnpCreateDate =
      now.getFullYear().toString() +
      pad(now.getMonth() + 1) +
      pad(now.getDate()) +
      pad(now.getHours()) +
      pad(now.getMinutes()) +
      pad(now.getSeconds());

    const expireTime = new Date(now.getTime() + 15 * 60 * 1000);
    const vnpExpireDate =
      expireTime.getFullYear().toString() +
      pad(expireTime.getMonth() + 1) +
      pad(expireTime.getDate()) +
      pad(expireTime.getHours()) +
      pad(expireTime.getMinutes()) +
      pad(expireTime.getSeconds());

    // Generate a unique transaction reference for topup
    const txnRef = `topup-${customer_id}-${Date.now()}`;

    const params: Record<string, string> = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode,
      vnp_Amount: (amount * 100).toString(),
      vnp_CreateDate: vnpCreateDate,
      vnp_CurrCode: "VND",
      vnp_IpAddr: req.socket?.remoteAddress || "127.0.0.1",
      vnp_Locale: "vn",
      vnp_OrderInfo: `Nap tien vao vi KH ${customer_id}`,
      vnp_OrderType: "topup",
      vnp_ReturnUrl: callbackUrl,
      vnp_TxnRef: txnRef,
      vnp_ExpireDate: vnpExpireDate,
    };

    const sortedKeys = Object.keys(params).sort();
    const signData = sortedKeys.map((k) => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, "+")}`).join("&");

    const hmac = crypto.createHmac("sha512", hashSecret);
    const secureHash = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    const paymentUrl = `${vnpUrl}?${signData}&vnp_SecureHash=${secureHash}`;

    console.log(`[Topup API] Creating VNPAY topup order: txnRef=${txnRef}, amount=${amount}`);

    return res.status(200).json({ paymentUrl, txnRef });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
