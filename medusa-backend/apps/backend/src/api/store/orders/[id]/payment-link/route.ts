import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import crypto from "crypto";
import { buildZalopayUrl } from "../../../../../utils/zalopay";

function buildVnpayUrl(
  orderId: string,
  amount: number, // VND (số nguyên)
  orderInfo: string,
  ipAddr: string
): string {
  const tmnCode = process.env.VNPAY_TMN_CODE || "CGPNVLJA";
  const hashSecret = process.env.VNPAY_SECURE_SECRET || process.env.VNPAY_HASH_SECRET || "RAOEXHYVSDDIIENYWSLDIIZTANXUXZFJ";
  const vnpUrl = process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
  const returnUrl = process.env.VNPAY_RETURN_URL || "http://localhost:9000/payment/vnpay/callback";

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

  const params: Record<string, string> = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Amount: (amount * 100).toString(),
    vnp_CreateDate: vnpCreateDate,
    vnp_CurrCode: "VND",
    vnp_IpAddr: ipAddr,
    vnp_Locale: "vn",
    vnp_OrderInfo: orderInfo.substring(0, 255),
    vnp_OrderType: "other",
    vnp_ReturnUrl: returnUrl,
    vnp_TxnRef: orderId,
    vnp_ExpireDate: vnpExpireDate,
  };

  const sortedKeys = Object.keys(params).sort();
  const signData = sortedKeys.map((k) => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, "+")}`).join("&");

  const hmac = crypto.createHmac("sha512", hashSecret);
  const secureHash = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  const queryString = sortedKeys.map((k) => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, "+")}`).join("&");
  return `${vnpUrl}?${queryString}&vnp_SecureHash=${secureHash}`;
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params;
    const body = req.body as { payment_method?: string };
    
    const orderService = req.scope.resolve(Modules.ORDER);
    const order = await orderService.retrieveOrder(id, { relations: ["items", "summary", "metadata"] });
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.payment_status === "paid" || order.payment_status === "captured") {
      return res.status(400).json({ error: "Order is already paid" });
    }

    const paymentMethod = body.payment_method || order.metadata?.payment_method;
    const totalAmount = Number(order.summary?.raw_current_order_total?.value || order.total || 0);

    let paymentUrl = null;

    if (paymentMethod === "vnpay") {
      const orderInfo = `Thanh toan don hang ${order.display_id || order.id}`;
      const ipAddr =
        req.headers["x-forwarded-for"] ||
        req.socket?.remoteAddress ||
        "127.0.0.1";
        
      paymentUrl = buildVnpayUrl(order.id, totalAmount, orderInfo, ipAddr as string);
      
    } else if (paymentMethod === "zalopay") {
      const orderInfo = `Thanh toán ZaloPay cho đơn hàng ${order.display_id || order.id}`;
      const zalopayResult = await buildZalopayUrl(order.id, totalAmount, orderInfo);
      
      if (zalopayResult) {
        paymentUrl = zalopayResult.order_url;
        
        // Save to global map for callback
        (global as any).__zalopayOrders = (global as any).__zalopayOrders || new Map();
        (global as any).__zalopayOrders.set(zalopayResult.app_trans_id, {
          medusaOrderId: order.id,
          createdAt: Date.now()
        });
      }
    } else {
      return res.status(400).json({ error: "Unsupported payment method for retry" });
    }

    if (!paymentUrl) {
      return res.status(500).json({ error: "Failed to generate payment URL" });
    }

    return res.status(200).json({ paymentUrl });
  } catch (err: any) {
    console.error("Retry Payment Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
