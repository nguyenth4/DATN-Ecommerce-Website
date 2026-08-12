import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const token = process.env.GHN_API_TOKEN || process.env.GHN_TOKEN;
  const shopId = process.env.GHN_SHOP_ID;
  const apiUrl = process.env.GHN_API_URL || "https://dev-online-gateway.ghn.vn/shiip/public-api/v2";

  if (!token || !shopId) {
    return res.status(500).json({
      error: "GHN credentials not configured (GHN_API_TOKEN/GHN_TOKEN or GHN_SHOP_ID missing)",
    });
  }

  try {
    const ghnRes = await fetch(`${apiUrl}/shipping-order/soc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Token: token,
        ShopId: shopId,
      },
      body: JSON.stringify(req.body),
    });

    const data = await ghnRes.json();
    return res.status(ghnRes.status).json(data);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch GHN order fee";
    return res.status(500).json({ error: message });
  }
}
