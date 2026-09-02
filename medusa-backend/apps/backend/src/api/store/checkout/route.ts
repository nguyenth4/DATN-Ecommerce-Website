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
  const hashSecret = process.env.VNPAY_SECURE_SECRET || process.env.VNPAY_HASH_SECRET || "RAOEXHYVSDDIIENYWSLDIIZTANXUXZFJ";
  const vnpUrl = process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
  const returnUrl = process.env.VNPAY_RETURN_URL || "http://localhost:9000/payment/vnpay/callback";

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
      // 1. Kiểm tra tồn kho của tất cả sản phẩm trước khi trừ
      for (const item of items) {
        if (item.id && item.qty) {
          try {
            const variant = (await productModuleService.retrieveProductVariant(item.id)) as any;
            if (variant && variant.manage_inventory !== false && typeof variant.inventory_quantity === "number") {
              if (item.qty > variant.inventory_quantity) {
                return res.status(400).json({
                  message: `Sản phẩm ${item.name || 'chọn'} không đủ số lượng! Chỉ còn ${variant.inventory_quantity} trong kho.`
                });
              }
            }
          } catch (invErr) {
            console.error(`[Checkout API] Lỗi kiểm tra tồn kho variant ${item.id}:`, invErr);
          }
        }
      }

      // 2. Trừ tồn kho nếu tất cả đều hợp lệ
      console.log(`[Checkout API] Đang trừ kho cho ${items.length} mặt hàng...`);
      for (const item of items) {
        if (item.id && item.qty) {
          try {
            const variant = (await productModuleService.retrieveProductVariant(item.id)) as any;
            if (variant && typeof variant.inventory_quantity === "number") {
              const newQuantity = Math.max(0, variant.inventory_quantity - item.qty);
              await productModuleService.updateProductVariants(item.id, {
                inventory_quantity: newQuantity,
              } as any);
              console.log(
                `[Checkout API] Đã trừ ${item.qty} cho variant ${item.id}. Tồn kho mới: ${newQuantity}`
              );
            }
          } catch (invErr) {
            console.error(
              `[Checkout API] Lỗi trừ kho variant ${item.id}:`,
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
      customer: payload.customer,
      customer_id: payload.customer_id,
      address: payload.address,
      addressComponents: payload.addressComponents,
      shippingMethod: payload.shippingMethod,
      shippingFee: payload.shippingFee,
      totalAmount: payload.totalAmount,
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
            await db.raw(`UPDATE wallet SET balance = balance - ?, raw_balance = jsonb_build_object('value', (balance - ?)::text, 'precision', 20), updated_at = NOW() WHERE id = ?`, [amount, amount, wallet.id]);
            const txId = `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            await db.raw(`
              INSERT INTO wallet_transaction (id, wallet_id, amount, raw_amount, type, description)
              VALUES (?, ?, ?, jsonb_build_object('value', ?::text, 'precision', 20), 'deduction', ?)
            `, [txId, wallet.id, amount, amount.toString(), `Thanh toán đơn hàng ${mockOrderId}`]);
            console.log(`[Checkout API] Wallet deducted successfully.`);
          } else {
            return res.status(400).json({ error: "Số dư ví không đủ để thanh toán." });
          }
        } catch (dbErr: any) {
          console.error("[Checkout API] Wallet deduction error:", dbErr);
          return res.status(500).json({ error: "Lỗi trừ tiền ví: " + dbErr.message });
        }
      }
      


      // ─── INSERT INTO MEDUSA DB ───────────────────────────
      try {
        const orderService = req.scope.resolve(Modules.ORDER);
        const createdOrders = await orderService.createOrders([{
          currency_code: "VND",
          email: payload.customer?.email || "guest@example.com",
          customer_id: payload.customer_id || undefined,
          metadata: { 
            external_id: mockOrderId,
            payment_method: paymentMethod,
            shipping_method: payload.shippingMethod,
            customer_name: payload.customer?.fullName,
            customer_phone: payload.customer?.phoneNumber
          },
          items: items.map((i: any) => ({
            title: i.name || "Unknown item",
            unit_price: i.price || 0,
            quantity: i.qty || 1,
            variant_title: i.variant || "",
            thumbnail: i.img || "",
            variant_id: i.id || "", // this is actually variant id
          })),
        }]);
        
        if (isWallet && createdOrders && createdOrders.length > 0) {
          const medusaOrderId = createdOrders[0].id;
          try {
            const { createOrderPaymentCollectionWorkflow, markPaymentCollectionAsPaid } = require("@medusajs/core-flows");
            
            const { result: paymentCollections } = await createOrderPaymentCollectionWorkflow(req.scope).run({
              input: {
                order_id: medusaOrderId,
                amount: payload.totalAmount || 0,
              }
            });
            
            if (paymentCollections && paymentCollections.length > 0) {
              await markPaymentCollectionAsPaid(req.scope).run({
                input: {
                  order_id: medusaOrderId,
                  payment_collection_id: paymentCollections[0].id,
                }
              });
              
              // In Medusa 2.0, marking the payment collection as paid is enough
              // The order's payment_status is computed dynamically or updated by events
              
              console.log(`[Checkout API] Marked Medusa order ${medusaOrderId} as Paid for Wallet!`);
            }
          } catch (updateErr: any) {
            console.warn(`[Checkout API] Could not mark order as paid for ${medusaOrderId}:`, updateErr.message);
          }
        }
        
        console.log(`[Checkout API] Successfully created Medusa order for ${mockOrderId}`);

        // Emit order placed event to trigger GHN sync and Emails
        await eventBus.emit({
          name: "order.placed",
          data: { id: mockOrderId, payment_status: status, method: paymentMethod },
        });
      } catch (err) {
        console.error(`[Checkout API] Failed to create Medusa order for ${mockOrderId}:`, err);
      }

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
    const totalAmount: number = payload.totalAmount || payload.total || 0;

    if (paymentMethod === 'vnpay') {
      // ✅ Tạo URL VNPAY thật với chữ ký HMAC-SHA512
      const orderInfo = `Thanh toan don hang ${mockOrderId}`;
      paymentUrl = buildVnpayUrl(mockOrderId, totalAmount, orderInfo, clientIp);
      console.log(`[Checkout API] ✅ VNPAY URL generated for order ${mockOrderId}, amount: ${totalAmount}`);
    } else if (paymentMethod === 'momo') {
      // Mock MoMo URL
      paymentUrl = `https://test-payment.momo.vn/v2/gateway/api/create?orderId=${mockOrderId}&redirectUrl=${encodeURIComponent(`${baseUrl}/momo/callback`)}`;
    } else if (paymentMethod === 'zalopay') {
      // ✅ Với ZaloPay: tạo Medusa order TRƯỚC để có orderId thật,
      //    rồi mới gọi ZaloPay và lưu mapping app_trans_id → medusaOrderId
      let medusaOrderId: string | null = null;
      try {
        const orderService = req.scope.resolve(Modules.ORDER);
        const createdOrders = await orderService.createOrders([{
          currency_code: "VND",
          email: payload.customer?.email || "guest@example.com",
          customer_id: payload.customer_id || undefined,
          metadata: {
            external_id: mockOrderId,
            payment_method: 'zalopay',
            shipping_method: payload.shippingMethod,
            shipping_fee: payload.shippingFee,
            customer_name: payload.customer?.fullName,
            customer_phone: payload.customer?.phoneNumber,
            payment_status: 'pending',
          },
          items: items.map((i: any) => ({
            title: i.name || "Unknown item",
            unit_price: i.price || 0,
            quantity: i.qty || 1,
            variant_title: i.variant || "",
            thumbnail: i.img || "",
            variant_id: i.id || "",
          })),
        }]);
        medusaOrderId = createdOrders?.[0]?.id || null;
        console.log(`[Checkout API] ✅ Medusa order created for ZaloPay: ${medusaOrderId}`);
      } catch (err) {
        console.error('[Checkout API] Failed to pre-create Medusa order for ZaloPay:', err);
      }

      const finalOrderId = medusaOrderId || mockOrderId;
      const orderInfo = `Thanh toan don hang ${finalOrderId}`;
      const zalopayResult = await buildZalopayUrl(finalOrderId, totalAmount, orderInfo);
      if (zalopayResult) {
        paymentUrl = zalopayResult.order_url;
        // Lưu mapping: app_trans_id → medusaOrderId để callback tra cứu
        (global as any).__zalopayOrders = (global as any).__zalopayOrders || new Map();
        (global as any).__zalopayOrders.set(zalopayResult.app_trans_id, {
          medusaOrderId: finalOrderId,
          mockOrderId,
          totalAmount,
          items,
          customer: payload.customer,
          customer_id: payload.customer_id,
          shippingMethod: payload.shippingMethod,
        });
        // Cập nhật pending cache với medusaOrderId
        if ((global as any).__pendingOrders) {
          (global as any).__pendingOrders.set(finalOrderId, (global as any).__pendingOrders.get(mockOrderId));
        }
        console.log(`[Checkout API] ✅ ZaloPay URL: ${paymentUrl}, app_trans_id: ${zalopayResult.app_trans_id}`);
      } else {
        console.error('[Checkout API] ZaloPay URL generation failed');
      }
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
