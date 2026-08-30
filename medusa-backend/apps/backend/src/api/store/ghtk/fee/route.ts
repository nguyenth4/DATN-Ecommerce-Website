import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const token = process.env.GHTK_API_TOKEN;

  if (!token) {
    return res.status(400).json({ error: "GHTK_API_TOKEN is not configured" });
  }

  try {
    const body = req.body as any;
    
    // GHTK expects parameters in query string for fee calculation, but we receive them in POST body
    const params = new URLSearchParams({
      pick_province: "Hồ Chí Minh",
      pick_district: "Quận 1",
      province: body.province_name || "Hồ Chí Minh",
      district: body.district_name || "Quận 1",
      weight: (body.weight || 200).toString(),
      deliver_option: "none"
    });

    if (body.ward_name) {
      params.append("ward", body.ward_name);
    }

    if (body.insurance_value) {
      params.append("value", body.insurance_value.toString());
    }

    const apiUrl = `https://services.giaohangtietkiem.vn/services/shipment/fee?${params.toString()}`;

    const ghtkRes = await fetch(apiUrl, {
      method: "GET", // GHTK fee API uses GET
      headers: {
        "Token": token,
      },
    });

    const data = await ghtkRes.json();
    return res.status(ghtkRes.status).json(data);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to calculate GHTK fee";
    return res.status(500).json({ error: message });
  }
}
