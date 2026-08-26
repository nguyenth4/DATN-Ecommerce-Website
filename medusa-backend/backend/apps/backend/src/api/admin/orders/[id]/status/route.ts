import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { updateOrderStatus } from "../../controller";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params as any;
    const { status, shipping_method } = req.body as any;

    let adminName = "System Admin";
    const actorId = (req as any).auth_context?.actor_id;

    if (actorId) {
      try {
        const userService = req.scope.resolve(Modules.USER);
        const user = await userService.retrieveUser(actorId);
        adminName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email || "Admin";
      } catch (err) {
        console.error("Failed to retrieve admin user details for status confirmation logging:", err);
      }
    }

    const updated = await updateOrderStatus(req.scope, id, status, shipping_method, adminName);
    res.json(updated);
  } catch (err: any) {
    console.error("POST /admin/orders/:id/status error:", err);
    res.status(400).json({ message: err?.message || "Internal server error" });
  }
}
