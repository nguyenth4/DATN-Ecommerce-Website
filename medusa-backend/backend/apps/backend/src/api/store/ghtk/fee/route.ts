// src/api/store/ghtk/fee/route.ts
import { MedusaRequest, MedusaResponse } from "medusa-core-utils";

/**
 * Mock endpoint for GHTK shipping fee calculation.
 * Returns a static fee of 30,000 VND. Replace with real API call when ready.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const staticFee = 30000; // 30k VND
  return res.json({ data: { total: staticFee } });
}

export const config = {
  method: "POST",
  route: "/store/ghtk/fee",
  auth: false,
};
