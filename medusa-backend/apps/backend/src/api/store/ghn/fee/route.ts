import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

const GHN_FEE_URL =
  "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const token = process.env.GHN_TOKEN;
  const shopId = process.env.GHN_SHOP_ID;

  if (!token || !shopId) {
    return res.status(500).json({
      error: "GHN credentials not configured (GHN_TOKEN, GHN_SHOP_ID)",
    });
  }

  try {
    const ghnRes = await fetch(GHN_FEE_URL, {
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
      error instanceof Error ? error.message : "Failed to calculate GHN fee";
    return res.status(500).json({ error: message });
  }
}
