import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    // Stub implementation to prevent frontend errors
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function OPTIONS(
  req: MedusaRequest,
  res: MedusaResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-bypass-purchase");
  res.status(200).send();
}
