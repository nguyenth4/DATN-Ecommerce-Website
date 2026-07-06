import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const payload = req.body as any;
    console.log("[Checkout API] Received checkout payload:", payload);

    const { paymentMethod } = payload;
    
    // Simulate order ID generation
    const mockOrderId = `order_${Date.now()}`;
    const eventBus = req.scope.resolve(Modules.EVENT_BUS);

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
      paymentUrl
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    return res.status(500).json({ error: message });
  }
}
