import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const query = req.query as any;
    console.log("[VNPay Callback] Received query:", query);

    const orderId = query.vnp_TxnRef;
    const responseCode = query.vnp_ResponseCode;
    
    // responseCode == '00' means success in VNPay
    if (responseCode === '00' && orderId) {
      console.log(`[VNPay Callback] Payment success for order: ${orderId}. Updating payment_status to 'paid'.`);
      
      const eventBus = req.scope.resolve(Modules.EVENT_BUS);
      await eventBus.emit({
        name: "order.placed",
        data: { id: orderId, payment_status: "paid", method: "vnpay" },
      });
      
      return res.redirect(302, "http://localhost:5173/order-success");
    } else {
      console.log(`[VNPay Callback] Payment failed or canceled for order: ${orderId}`);
      return res.redirect(302, "http://localhost:5173/checkout");
    }
  } catch (error) {
    console.error("[VNPay Callback] Error:", error);
    return res.redirect(302, "http://localhost:5173/checkout");
  }
}
