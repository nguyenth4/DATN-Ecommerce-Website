import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

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
      
      if (isWallet) {
        console.log(`[Checkout API] Deducted from customer wallet for order: ${mockOrderId}`);
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

    if (paymentMethod === 'vnpay') {
      // Mock VNPay URL
      paymentUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_TxnRef=${mockOrderId}&vnp_ReturnUrl=${encodeURIComponent(`${baseUrl}/vnpay/callback`)}`;
    } else if (paymentMethod === 'momo') {
      // Mock MoMo URL
      paymentUrl = `https://test-payment.momo.vn/v2/gateway/api/create?orderId=${mockOrderId}&redirectUrl=${encodeURIComponent(`${baseUrl}/momo/callback`)}`;
    } else if (paymentMethod === 'zalopay') {
      // Mock ZaloPay URL
      paymentUrl = `https://sb-openapi.zalopay.vn/v2/create?app_trans_id=${mockOrderId}&callback_url=${encodeURIComponent(`${baseUrl}/zalopay/callback`)}`;
    } else {
      // Fallback or unknown payment method
      paymentUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_TxnRef=${mockOrderId}`;
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
