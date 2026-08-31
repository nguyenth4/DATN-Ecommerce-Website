import { AbstractFulfillmentProviderService, MedusaError } from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"
import axios from "axios"

type GhtkFulfillmentOptions = {
  api_token: string;
}

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

async function resolveDistrictName(provinceName: string, wardName: string, ghnToken: string): Promise<string | null> {
  const cacheKey = `${cleanName(provinceName)}:${cleanName(wardName)}`;
  if (locationCache[cacheKey]) {
    return locationCache[cacheKey];
  }

  try {
    const provRes = await axios.get("https://online-gateway.ghn.vn/shiip/public-api/master-data/province", {
      headers: { Token: ghnToken }
    });
    const matchedProv = provRes.data?.data?.find((p: any) => 
      cleanName(p.ProvinceName) === cleanName(provinceName) ||
      p.NameExtension?.some((ext: string) => cleanName(ext) === cleanName(provinceName))
    );

    if (!matchedProv) return null;

    const distRes = await axios.post("https://online-gateway.ghn.vn/shiip/public-api/master-data/district", 
      { province_id: matchedProv.ProvinceID },
      {
        headers: { 
          Token: ghnToken,
          "Content-Type": "application/json"
        }
      }
    );
    const districts = distRes.data?.data || [];

    const wardPromises = districts.map(async (d: any) => {
      try {
        const res = await axios.get(`https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${d.DistrictID}`, {
          headers: { Token: ghnToken }
        });
        return { districtName: d.DistrictName, wards: res.data?.data || [] };
      } catch {
        return { districtName: d.DistrictName, wards: [] };
      }
    });

    const districtWardsList = await Promise.all(wardPromises);

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

    const matchedDist = districts.find((d: any) => 
      cleanName(d.DistrictName) === cleanName(wardName) ||
      d.NameExtension?.some((ext: string) => cleanName(ext) === cleanName(wardName))
    );
    if (matchedDist) {
      locationCache[cacheKey] = matchedDist.DistrictName;
      return matchedDist.DistrictName;
    }

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
    console.error("[GHTK Module] Error resolving district name:", err);
  }
  return null;
}

export default class GhtkFulfillmentProviderService extends AbstractFulfillmentProviderService {
  static identifier = "ghtk"

  protected logger_: Logger
  protected options_: GhtkFulfillmentOptions

  constructor({ logger }: { logger: Logger }, options: GhtkFulfillmentOptions) {
    super()
    this.logger_ = logger
    this.options_ = options || {} as GhtkFulfillmentOptions

    if (!this.options_.api_token) {
      this.options_.api_token = process.env.GHTK_API_TOKEN as string;
    }
  }

  getIdentifier(): string {
    return GhtkFulfillmentProviderService.identifier
  }

  async getFulfillmentOptions(): Promise<any[]> {
    return [
      { id: "ghtk-economy", name: "Giao Hàng Tiết Kiệm (Tiêu Chuẩn)", is_return: false }
    ]
  }

  async validateFulfillmentData(optionData: any, data: any, context: any): Promise<any> {
    return { ...data }
  }

  async validateOption(data: any): Promise<boolean> {
    return true
  }

  async canCalculate(data: any): Promise<boolean> {
    return true
  }

  async calculatePrice(optionData: any, data: any, context: any): Promise<any> {
    try {
      const provinceName = context.shipping_address?.province;
      const wardName = context.shipping_address?.address_2;
      let districtName = context.shipping_address?.city;

      if (!provinceName || !wardName) {
        return { price: 30000 };
      }

      const ghnToken = process.env.GHN_API_TOKEN || process.env.GHN_TOKEN;
      if (ghnToken && (!districtName || districtName === "Toàn khu vực")) {
        const resolved = await resolveDistrictName(provinceName, wardName, ghnToken);
        if (resolved) {
          districtName = resolved;
        }
      }

      const ghtkProvince = normalizeProvinceForGhtk(provinceName);
      
      // Limit insurance value to max 5,000,000đ (5 million) like GHN to keep fees reasonable
      const originalValue = context.total || 0;
      const insuranceValue = originalValue > 5000000 ? 5000000 : originalValue;

      let totalWeight = 0;
      if (context.items) {
        for (const item of context.items) {
          totalWeight += (item.variant?.weight || 250) * item.quantity;
        }
      }
      if (totalWeight <= 0) totalWeight = 200;

      const params = new URLSearchParams({
        pick_province: process.env.GHTK_PICK_PROVINCE || "TP. Hồ Chí Minh",
        pick_district: process.env.GHTK_PICK_DISTRICT || "Quận 1",
        province: ghtkProvince || "Hồ Chí Minh",
        district: districtName || "Quận 1",
        weight: totalWeight.toString(),
        deliver_option: "none"
      });

      if (wardName) {
        params.append("ward", wardName);
      }

      if (insuranceValue > 0) {
        params.append("value", insuranceValue.toString());
      }

      const token = this.options_.api_token || process.env.GHTK_API_TOKEN;
      if (!token) {
        return { price: 30000 };
      }

      const response = await axios.get(`https://services.giaohangtietkiem.vn/services/shipment/fee?${params.toString()}`, {
        headers: {
          "Token": token
        }
      });

      if (response.data && response.data.success && response.data.fee) {
        return { price: response.data.fee.fee };
      }

      return { price: 30000 };
    } catch (error: any) {
      this.logger_.error(`[GHTK Module] Lỗi tính phí: ${error.message}`);
      return { price: 30000 };
    }
  }

  async createFulfillment(data: any, items: any, order: any, fulfillment: any): Promise<any> {
    return {}
  }

  async cancelFulfillment(fulfillment: any): Promise<any> {
    return {}
  }
  
  async createReturnFulfillment(fulfillment: any): Promise<any> {
    return {}
  }
}
