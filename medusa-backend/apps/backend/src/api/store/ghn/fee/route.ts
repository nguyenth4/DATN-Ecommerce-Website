import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

const ghnLocationCache: Record<string, { districtId: number; wardCode: string }> = {};

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

async function resolveGhnLocation(provinceName: string, wardName: string, token: string) {
  const cacheKey = `${cleanName(provinceName)}:${cleanName(wardName)}`;
  if (ghnLocationCache[cacheKey]) {
    return ghnLocationCache[cacheKey];
  }

  // 1. Fetch Provinces
  const provRes = await fetch("https://online-gateway.ghn.vn/shiip/public-api/master-data/province", {
    headers: { Token: token }
  });
  const provData = (await provRes.json()) as any;
  const matchedProv = provData.data?.find((p: any) => 
    cleanName(p.ProvinceName) === cleanName(provinceName) ||
    p.NameExtension?.some((ext: string) => cleanName(ext) === cleanName(provinceName))
  );

  if (!matchedProv) {
    throw new Error(`Province not found in GHN: ${provinceName}`);
  }

  // 2. Fetch Districts
  const distRes = await fetch("https://online-gateway.ghn.vn/shiip/public-api/master-data/district", {
    method: "POST",
    headers: { 
      Token: token,
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
        headers: { Token: token }
      });
      const data = await res.json() as any;
      return { districtId: d.DistrictID, districtName: d.DistrictName, wards: data.data || [] };
    } catch {
      return { districtId: d.DistrictID, districtName: d.DistrictName, wards: [] };
    }
  });

  const districtWardsList = await Promise.all(wardPromises);

  // Search for the ward name
  let matchedDistrictId: number | null = null;
  let matchedWardCode: string | null = null;

  // Try exact cleaned name match
  for (const dw of districtWardsList) {
    const found = dw.wards.find((w: any) => 
      cleanName(w.WardName) === cleanName(wardName) ||
      w.NameExtension?.some((ext: string) => cleanName(ext) === cleanName(wardName))
    );
    if (found) {
      matchedDistrictId = dw.districtId;
      matchedWardCode = found.WardCode;
      break;
    }
  }

  // Fallback 1: If ward name matches the district name (e.g. Cái Răng is district in GHN, but user got Phường Cái Răng)
  if (!matchedWardCode) {
    const matchedDist = districts.find((d: any) => 
      cleanName(d.DistrictName) === cleanName(wardName) ||
      d.NameExtension?.some((ext: string) => cleanName(ext) === cleanName(wardName))
    );
    if (matchedDist) {
      matchedDistrictId = matchedDist.DistrictID;
      const dw = districtWardsList.find(x => x.districtId === matchedDist.DistrictID);
      if (dw && dw.wards.length > 0) {
        matchedWardCode = dw.wards[0].WardCode;
      }
    }
  }

  // Fallback 2: Best effort substring match
  if (!matchedWardCode) {
    for (const dw of districtWardsList) {
      const found = dw.wards.find((w: any) => 
        cleanName(w.WardName).includes(cleanName(wardName)) ||
        cleanName(wardName).includes(cleanName(w.WardName))
      );
      if (found) {
        matchedDistrictId = dw.districtId;
        matchedWardCode = found.WardCode;
        break;
      }
    }
  }

  // Fallback 3: Hard fallback to first district and ward of the province
  if (!matchedWardCode && districts.length > 0) {
    matchedDistrictId = districts[0].DistrictID;
    const dw = districtWardsList.find(x => x.districtId === districts[0].DistrictID);
    if (dw && dw.wards.length > 0) {
      matchedWardCode = dw.wards[0].WardCode;
    }
  }

  if (matchedDistrictId && matchedWardCode) {
    const result = { districtId: matchedDistrictId, wardCode: matchedWardCode };
    ghnLocationCache[cacheKey] = result;
    return result;
  }

  throw new Error(`Could not resolve GHN location for ${provinceName}, ${wardName}`);
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const token = process.env.GHN_API_TOKEN || process.env.GHN_TOKEN;
  const shopId = process.env.GHN_SHOP_ID;
  const apiUrl = process.env.GHN_API_URL || "https://online-gateway.ghn.vn/shiip/public-api/v2";

  if (!token || !shopId) {
    return res.status(500).json({
      error: "GHN credentials not configured (GHN_API_TOKEN/GHN_TOKEN or GHN_SHOP_ID missing)",
    });
  }

  const body = req.body as any;

  let to_district_id = body?.to_district_id;
  let to_ward_code = body?.to_ward_code;
  let resolved_district_id: number | undefined;
  let resolved_ward_code: string | undefined;

  const province_name = body?.province_name;
  const ward_name = body?.ward_name;

  if (province_name && ward_name) {
    try {
      const resolved = await resolveGhnLocation(province_name, ward_name, token);
      to_district_id = resolved.districtId;
      to_ward_code = resolved.wardCode;
      resolved_district_id = resolved.districtId;
      resolved_ward_code = resolved.wardCode;
      console.log(`[GHN Fee] Resolved ${province_name}, ${ward_name} -> District: ${to_district_id}, Ward: ${to_ward_code}`);
    } catch (err: any) {
      console.error(`[GHN Fee] Failed to resolve location name:`, err.message);
      to_district_id = 1442;
      to_ward_code = "21211";
    }
  } else {
    to_district_id = 1442;
    to_ward_code = "21211";
  }

  try {
    const payload = {
      ...body,
      to_district_id: parseInt(to_district_id) || 1442,
      to_ward_code: (to_ward_code || "21211").toString(),
    };

    // Remove storefront-only properties so GHN doesn't complain
    delete (payload as any).province_name;
    delete (payload as any).ward_name;

    const ghnRes = await fetch(`${apiUrl}/shipping-order/fee`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Token: token,
        ShopId: shopId,
      },
      body: JSON.stringify(payload),
    });

    const data = (await ghnRes.json()) as any;
    if (data && data.code === 200 && data.data) {
      data.data.resolved_district_id = resolved_district_id;
      data.data.resolved_ward_code = resolved_ward_code;
    }
    return res.status(ghnRes.status).json(data);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to calculate GHN fee";
    return res.status(500).json({ error: message });
  }
}
