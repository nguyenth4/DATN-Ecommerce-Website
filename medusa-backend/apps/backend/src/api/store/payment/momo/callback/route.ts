import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const query = req.query as any;
    console.log("[MoMo Callback] Received query:", query);

    const orderId = query.orderId;
    const resultCode = query.resultCode;
    
    // resultCode == 0 means success in MoMo
    if (resultCode == 0 && orderId) {
      console.log(`[MoMo Callback] Payment success for order: ${orderId}. Updating payment_status to 'paid'.`);
      
      const eventBus = req.scope.resolve(Modules.EVENT_BUS);
      await eventBus.emit({
        name: "order.placed",
        data: { id: orderId, payment_status: "paid", method: "momo" },
      });
      
      return res.redirect(302, "http://localhost:5173/order-success");
    } else {
      console.log(`[MoMo Callback] Payment failed or canceled for order: ${orderId}`);
      return res.redirect(302, "http://localhost:5173/checkout");
    }
  } catch (error) {
    console.error("[MoMo Callback] Error:", error);
    return res.redirect(302, "http://localhost:5173/checkout");
  }
}
