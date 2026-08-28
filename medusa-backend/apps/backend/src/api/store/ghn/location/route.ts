import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const token = process.env.GHN_TOKEN;
  // Use the master-data endpoint which is slightly different from the v2 base URL
  // GHN_API_URL is typically https://online-gateway.ghn.vn/shiip/public-api/v2
  // But master data is https://online-gateway.ghn.vn/shiip/public-api/master-data
  const baseUrl = process.env.GHN_API_URL 
    ? process.env.GHN_API_URL.replace('/v2', '/master-data') 
    : "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data";

  if (!token) {
    return res.status(500).json({ error: "GHN_TOKEN missing" });
  }

  // Extract type: province, district, ward
  const type = req.query.type as string;
  const parent_id = req.query.parent_id as string;
  
  if (!['province', 'district', 'ward'].includes(type)) {
    return res.status(400).json({ error: "Invalid location type" });
  }

  let url = `${baseUrl}/${type}`;
  
  try {
    const headers = {
      Token: token,
      "Content-Type": "application/json"
    };
    
    // For GET request in GHN master data, they usually accept POST or GET with query params, 
    // but the safest and most standard for GHN is GET with query params or headers.
    // wait, GHN documentation says:
    // District requires province_id (int)
    // Ward requires district_id (int)
    if (type === 'district' && parent_id) {
       url += `?province_id=${parent_id}`;
    }
    if (type === 'ward' && parent_id) {
       url += `?district_id=${parent_id}`;
    }

    const ghnRes = await fetch(url, { method: "GET", headers });
    
    // Fallback if GET fails with 405 Method Not Allowed (some GHN APIs are POST only)
    if (ghnRes.status === 405 || ghnRes.status === 404) {
      const body: any = {};
      if (type === 'district' && parent_id) body.province_id = parseInt(parent_id);
      if (type === 'ward' && parent_id) body.district_id = parseInt(parent_id);
      
      const postRes = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
      });
      const data = await postRes.json();
      return res.status(postRes.status).json(data);
    }
    
    const data = await ghnRes.json();
    return res.status(ghnRes.status).json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch GHN location";
    return res.status(500).json({ error: message });
  }
}
