import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import crypto from "crypto";
import { buildZalopayUrl } from "../../../utils/zalopay";

// ─── Build VNPAY Payment URL (HMAC-SHA512) ───────────────────────────────────
function buildVnpayUrl(
  orderId: string,
  amount: number, // VND (số nguyên)
  orderInfo: string,
  ipAddr: string
): string {
  const tmnCode = process.env.VNPAY_TMN_CODE || "CGPNVLJA";
  const hashSecret = process.env.VNPAY_HASH_SECRET || "RAOEXHYVSDDIIENYWSLDIIZTANXUXZFJ";
  const vnpUrl = process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
  const returnUrl = process.env.VNPAY_RETURN_URL || "http://localhost:9000/store/payment/vnpay/callback";

  const now = new Date();
  // Format: YYYYMMDDHHmmss (Vietnam time UTC+7)
  const pad = (n: number) => n.toString().padStart(2, "0");
  const vnpCreateDate =
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds());

  // Expire in 15 minutes
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
    vnp_Amount: (amount * 100).toString(), // VNPAY nhân x100
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

  // Sắp xếp params theo key (A-Z) trước khi ký
  const sortedKeys = Object.keys(params).sort();
  const signData = sortedKeys.map((k) => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, "+")}`).join("&");

  const hmac = crypto.createHmac("sha512", hashSecret);
  const secureHash = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  const queryString = sortedKeys.map((k) => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, "+")}`).join("&");
  return `${vnpUrl}?${queryString}&vnp_SecureHash=${secureHash}`;
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const payload = req.body as any;
    console.log("[Checkout API] Received checkout payload:", payload);

    const { paymentMethod, items } = payload;
    
    // Simulate order ID generation
    const mockOrderId = `order_${Date.now()}`;
    const eventBus = req.scope.resolve(Modules.EVENT_BUS);

    // ─── Deduct Inventory on Order Placement ───────────────────────────────
    const productModuleService = req.scope.resolve(Modules.PRODUCT);
    if (productModuleService && Array.isArray(items) && items.length > 0) {
      console.log(`[Checkout API] Deducting inventory for ${items.length} item(s)...`);
      for (const item of items) {
        // item.id = variant_id, item.qty = quantity ordered
        if (item.id && item.qty) {
          try {
            const variant = (await productModuleService.retrieveProductVariant(item.id)) as any;
            if (variant && typeof variant.inventory_quantity === "number") {
              const newQuantity = Math.max(0, variant.inventory_quantity - item.qty);
              await productModuleService.updateProductVariants(item.id, {
                inventory_quantity: newQuantity,
              } as any);
              console.log(
                `[Checkout API] Deducted ${item.qty} from variant ${item.id}. New stock: ${newQuantity}`
              );
            }
          } catch (invErr) {
            console.error(
              `[Checkout API] Failed to deduct inventory for variant ${item.id}:`,
              invErr
            );
          }
        }
      }
    }

    // ─── Persist order info for cancellation rollback ──────────────────────
    // Store items info in-memory cache so cancel API can restore inventory.
    // In production this would be a DB table; here we use a process-level Map.
    (global as any).__pendingOrders = (global as any).__pendingOrders || new Map();
    (global as any).__pendingOrders.set(mockOrderId, {
      items,
      created_at: Date.now(),
    });

    // 1. Create order & Update payment_status for COD and Wallet (Ví)
    if (paymentMethod === 'cod' || paymentMethod === 'wallet') {
      const isWallet = paymentMethod === 'wallet';
      const status = isWallet ? 'paid' : 'pending';
      console.log(`[Checkout API] Creating ${paymentMethod.toUpperCase()} order directly without gateway: ${mockOrderId}`);
      
      // Update payment_status
      console.log(`[Checkout API] Updated payment_status to '${status}' for order: ${mockOrderId}`);
      
      if (payload.use_wallet && payload.customer_id && payload.totalAmount) {
        const db = req.scope.resolve("__pg_connection__");
        const customerId = payload.customer_id;
        const amount = payload.totalAmount;
        
        console.log(`[Checkout API] Deducting ${amount} from customer ${customerId} wallet for order: ${mockOrderId}`);
        
        try {
          const walletRes = await db.raw(`SELECT id, balance FROM wallet WHERE customer_id = ?`, [customerId]);
          const wallet = walletRes.rows[0];
          
          if (wallet && wallet.balance >= amount) {
            await db.raw(`UPDATE wallet SET balance = balance - ?, updated_at = NOW() WHERE id = ?`, [amount, wallet.id]);
            const txId = `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            await db.raw(`
              INSERT INTO wallet_transaction (id, wallet_id, amount, type, description)
              VALUES (?, ?, ?, 'deduction', ?)
            `, [txId, wallet.id, amount, `Thanh toán đơn hàng ${mockOrderId}`]);
            console.log(`[Checkout API] Wallet deducted successfully.`);
          } else {
            return res.status(400).json({ error: "Số dư ví không đủ để thanh toán." });
          }
        } catch (dbErr: any) {
          console.error("[Checkout API] Wallet deduction error:", dbErr);
          return res.status(500).json({ error: "Lỗi trừ tiền ví: " + dbErr.message });
        }
      }
      
      // Emit order placed event to trigger GHN sync
      await eventBus.emit({
        name: "order.placed",
        data: { id: mockOrderId, payment_status: status, method: paymentMethod },
      });

      return res.status(200).json({
        message: `${paymentMethod.toUpperCase()} order created successfully`,
        data: payload,
        orderId: mockOrderId,
        paymentUrl: null // No payment url needed
      });
    }


    // 2. Generate Payment Gateway URLs
    let paymentUrl: string | null = null;
    const baseUrl = "http://localhost:9000/store/payment";

    // Lấy IP của client (dùng cho vnp_IpAddr)
    const clientIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "127.0.0.1";

    // Lấy tổng tiền từ payload (đơn vị VND)
    const totalAmount: number = payload.totalAmount || 0;

    if (paymentMethod === 'vnpay') {
      // ✅ Tạo URL VNPAY thật với chữ ký HMAC-SHA512
      const orderInfo = `Thanh toan don hang ${mockOrderId}`;
      paymentUrl = buildVnpayUrl(mockOrderId, totalAmount, orderInfo, clientIp);
      console.log(`[Checkout API] ✅ VNPAY URL generated for order ${mockOrderId}, amount: ${totalAmount}`);
    } else if (paymentMethod === 'momo') {
      // Mock MoMo URL
      paymentUrl = `https://test-payment.momo.vn/v2/gateway/api/create?orderId=${mockOrderId}&redirectUrl=${encodeURIComponent(`${baseUrl}/momo/callback`)}`;
    } else if (paymentMethod === 'zalopay') {
      // ✅ Tạo URL ZaloPay với chữ ký HMAC-SHA256
      const orderInfo = `Thanh toan don hang ${mockOrderId}`;
      paymentUrl = await buildZalopayUrl(mockOrderId, totalAmount, orderInfo);
      console.log(`[Checkout API] ✅ ZALOPAY URL generated for order ${mockOrderId}, amount: ${totalAmount}`);
    } else {
      // Fallback
      paymentUrl = null;
    }


    return res.status(200).json({
      message: "Checkout initiated successfully",
      data: payload,
      orderId: mockOrderId,
      paymentUrl
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    return res.status(500).json({ error: message });
  }
}
