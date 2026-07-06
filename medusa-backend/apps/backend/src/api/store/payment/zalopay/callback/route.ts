import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const query = req.query as any;
    console.log("[ZaloPay Callback] Received query:", query);

    // Normally ZaloPay callback is a POST to the server, and a GET redirect to frontend.
    // Here we are handling the GET redirect to verify and redirect user.
    const appTransId = query.apptransid || query.app_trans_id;
    const status = query.status;
    
    if (appTransId) {
      console.log(`[ZaloPay Callback] Payment success for order: ${appTransId}. Updating payment_status to 'paid'.`);
      
      const eventBus = req.scope.resolve(Modules.EVENT_BUS);
      await eventBus.emit({
        name: "order.placed",
        data: { id: appTransId, payment_status: "paid", method: "zalopay" },
      });
      
      return res.redirect(302, "http://localhost:5173/order-success");
    }
    
    return res.redirect(302, "http://localhost:5173/checkout");
  } catch (error) {
    console.error("[ZaloPay Callback] Error:", error);
    return res.redirect(302, "http://localhost:5173/checkout");
  }
}
