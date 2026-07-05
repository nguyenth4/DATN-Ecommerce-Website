// src/api/admin/orders/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { listOrders, getOrder, updateOrderStatus } from "./controller";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { limit = 20, offset = 0, status } = req.query as any;
  const result = await listOrders({ limit: Number(limit), offset: Number(offset), status });
  res.json(result);
}

export async function GET_BY_ID(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params as any;
  const order = await getOrder(id);
  res.json(order);
}

export async function PATCH_BY_ID(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params as any;
  const { status, shipping_method } = req.body as any;
  const updated = await updateOrderStatus(id, status, shipping_method);
  res.json(updated);
}
