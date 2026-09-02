import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

const locationCache: Record<string, string> = {};

function cleanName(name: string) {
  if (!name) return "";
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^(thanh\s+pho|tinh|quan|huyen|phuong|xa|thi\s+tran|thi\s+xa)\s+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeProvinceForGhtk(province: string) {
  if (!province) return "";
  const cleaned = province.trim();
  if (cleaned.match(/^(Thành phố|Thành Phố|TP\.|TP)\s*Hồ\s*Chí\s*Minh$/i)) {
    return "TP. Hồ Chí Minh";
  }
  if (cleaned.match(/^(Thành phố|Thành Phố|TP\.|TP)\s*Hà\s*Nội$/i)) {
    return "Hà Nội";
  }
  if (cleaned.match(/^(Thành phố|Thành Phố|TP\.|TP)\s*Đà\s*Nẵng$/i)) {
    return "Đà Nẵng";
  }
  if (cleaned.match(/^(Thành phố|Thành Phố|TP\.|TP)\s*Hải\s*Phòng$/i)) {
    return "Hải Phòng";
  }
  if (cleaned.match(/^(Thành phố|Thành Phố|TP\.|TP)\s*Cần\s*Thơ$/i)) {
    return "Cần Thơ";
  }
  return cleaned;
}

const VOLUMETRIC_WEIGHT_DIVISOR = 5000;

function calculateChargeableWeight(body: Record<string, unknown>) {
  const actualWeight = Number(body.weight) || 200;
  const length = Number(body.length) || 0;
  const width = Number(body.width) || 0;
  const height = Number(body.height) || 0;
  const volumetricWeight =
    length > 0 && width > 0 && height > 0
      ? Math.ceil((length * width * height * 1000) / VOLUMETRIC_WEIGHT_DIVISOR)
      : 0;

  return Math.max(actualWeight, volumetricWeight);
}

// Resolve correct District Name for GHTK from province and ward names
async function resolveDistrictName(provinceName: string, wardName: string, ghnToken: string): Promise<string | null> {
  const cacheKey = `${cleanName(provinceName)}:${cleanName(wardName)}`;
  if (locationCache[cacheKey]) {
    return locationCache[cacheKey];
  }

  try {
    // 1. Fetch Provinces
    const provRes = await fetch("https://online-gateway.ghn.vn/shiip/public-api/master-data/province", {
      headers: { Token: ghnToken }
    });
    const provData = (await provRes.json()) as any;
    const matchedProv = provData.data?.find((p: any) => 
      cleanName(p.ProvinceName) === cleanName(provinceName) ||
      p.NameExtension?.some((ext: string) => cleanName(ext) === cleanName(provinceName))
    );

    if (!matchedProv) return null;

    // 2. Fetch Districts
    const distRes = await fetch("https://online-gateway.ghn.vn/shiip/public-api/master-data/district", {
      method: "POST",
      headers: { 
        Token: ghnToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ province_id: matchedProv.ProvinceID })
    });
    const distData = (await distRes.json()) as any;
    const districts = distData.data || [];

    // 3. Search wards across districts in parallel
    const wardPromises = districts.map(async (d: any) => {
      try {
        const res = await fetch(`https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${d.DistrictID}`, {
          headers: { Token: ghnToken }
        });
        const data = await res.json() as any;
        return { districtName: d.DistrictName, wards: data.data || [] };
      } catch {
        return { districtName: d.DistrictName, wards: [] };
      }
    });

    const districtWardsList = await Promise.all(wardPromises);

    // Search for the ward name
    // Try exact cleaned name match
    for (const dw of districtWardsList) {
      const found = dw.wards.find((w: any) => 
        cleanName(w.WardName) === cleanName(wardName) ||
        w.NameExtension?.some((ext: string) => cleanName(ext) === cleanName(wardName))
      );
      if (found) {
        locationCache[cacheKey] = dw.districtName;
        return dw.districtName;
      }
    }

    // Fallback 1: If ward name matches the district name
    const matchedDist = districts.find((d: any) => 
      cleanName(d.DistrictName) === cleanName(wardName) ||
      d.NameExtension?.some((ext: string) => cleanName(ext) === cleanName(wardName))
    );
    if (matchedDist) {
      locationCache[cacheKey] = matchedDist.DistrictName;
      return matchedDist.DistrictName;
    }

    // Fallback 2: Substring match
    for (const dw of districtWardsList) {
      const found = dw.wards.find((w: any) => 
        cleanName(w.WardName).includes(cleanName(wardName)) ||
        cleanName(wardName).includes(cleanName(w.WardName))
      );
      if (found) {
        locationCache[cacheKey] = dw.districtName;
        return dw.districtName;
      }
    }
  } catch (err) {
    console.error("[GHTK Fee] Error resolving district name:", err);
  }
  return null;
}

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
    
    let provinceName = body.province_name || "Hồ Chí Minh";
    let districtName = body.district_name || "Quận 1";
    const wardName = body.ward_name;

    const ghnToken = process.env.GHN_API_TOKEN || process.env.GHN_TOKEN;
    if (ghnToken && provinceName && wardName) {
      const resolvedDistrict = await resolveDistrictName(provinceName, wardName, ghnToken);
      if (resolvedDistrict) {
        districtName = resolvedDistrict;
        console.log(`[GHTK Fee] Resolved district name: ${districtName} for province ${provinceName}, ward ${wardName}`);
      }
    }

    const ghtkProvince = normalizeProvinceForGhtk(provinceName);
    const chargeableWeight = calculateChargeableWeight(body);

    // GHTK expects parameters in query string for fee calculation, but we receive them in POST body
    const params = new URLSearchParams({
      pick_province: process.env.GHTK_PICK_PROVINCE || "TP. Hồ Chí Minh",
      pick_district: process.env.GHTK_PICK_DISTRICT || "Quận 1",
      province: ghtkProvince || "Hồ Chí Minh",
      district: districtName || "Quận 1",
      weight: chargeableWeight.toString(),
      deliver_option: "none"
    });

    if (wardName) {
      params.append("ward", wardName);
    }

    if (body.insurance_value) {
      params.append("value", body.insurance_value.toString());
    }

    const apiUrl = `https://services.giaohangtietkiem.vn/services/shipment/fee?${params.toString()}`;
    console.log(
      `[GHTK Fee] Requesting fee with actual weight ${body.weight || 200}g, ` +
        `volumetric dimensions ${body.length || 0}x${body.width || 0}x${body.height || 0}cm, ` +
        `chargeable weight ${chargeableWeight}g, insurance ${body.insurance_value || 0}đ`,
    );

    const ghtkRes = await fetch(apiUrl, {
      method: "GET",
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
