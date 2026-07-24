// src/api/admin/orders/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { listOrders, getOrder, updateOrderStatus } from "./controller";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { limit = 20, offset = 0, status } = req.query as any;
    const result = await listOrders(req.scope, { limit: Number(limit), offset: Number(offset), status });
    res.json(result);
  } catch (err: any) {
    console.error("GET /admin/orders error:", err);
    res.status(500).json({ message: err?.message || "Internal server error" });
  }
}

export async function GET_BY_ID(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params as any;
    const order = await getOrder(req.scope, id);
    res.json(order);
  } catch (err: any) {
    console.error("GET /admin/orders/:id error:", err);
    res.status(500).json({ message: err?.message || "Internal server error" });
  }
}

export async function PATCH_BY_ID(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params as any;
    const { status, shipping_method } = req.body as any;
    const updated = await updateOrderStatus(req.scope, id, status, shipping_method);
    res.json(updated);
  } catch (err: any) {
    console.error("PATCH /admin/orders/:id error:", err);
    res.status(500).json({ message: err?.message || "Internal server error" });
  }
}
