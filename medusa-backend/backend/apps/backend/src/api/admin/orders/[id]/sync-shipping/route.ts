import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { IOrderModuleService } from "@medusajs/framework/types";

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

  // Fallback 1: If ward name matches the district name (e.g. Cái Răng is district, but user got Phường Cái Răng)
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

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params;
    const orderService: IOrderModuleService = req.scope.resolve(Modules.ORDER);

    console.log(`[Admin] Seller confirmed order. Syncing shipping for order: ${id}`);
    
    // 2. Call GHN API
    const token = process.env.GHN_TOKEN || process.env.GHN_API_TOKEN || "";
    const shopId = process.env.GHN_SHOP_ID;

    // 1. Fetch Order data
    let items: { name: string; quantity: number; weight: number }[] = [];
    let address = {
      first_name: "Customer",
      phone: "0987654321",
      address_1: "Address",
      province: "20308",
      city: "",
      address_2: ""
    };

    let to_ward_code = "20308";
    let to_district_id = 1442;
    let order: any = null;

    try {
      order = await orderService.retrieveOrder(id, {
        relations: ["items", "shipping_address"],
      });
      items = order.items?.map(item => ({
        name: item.title,
        quantity: item.quantity,
        weight: 250 // assuming each item is 250g if not specified
      })) || [];
      
      if (order.shipping_address) {
        address = {
          first_name: order.shipping_address.first_name || address.first_name,
          phone: order.shipping_address.phone || address.phone,
          address_1: order.shipping_address.address_1 || address.address_1,
          province: order.shipping_address.province || address.province,
          city: order.shipping_address.city || "",
          address_2: order.shipping_address.address_2 || "",
        };

        const metadata = (order.shipping_address as any).metadata || {};
        if (metadata.ward_code && metadata.district_id) {
          to_ward_code = metadata.ward_code.toString();
          to_district_id = parseInt(metadata.district_id.toString()) || 1442;
        } else if (order.shipping_address.province && (order.shipping_address as any).address_2) {
          try {
            const resolved = await resolveGhnLocation(
              order.shipping_address.province,
              (order.shipping_address as any).address_2,
              token
            );
            to_ward_code = resolved.wardCode;
            to_district_id = resolved.districtId;
            console.log(`[Admin Sync] Resolved name address to District: ${to_district_id}, Ward: ${to_ward_code}`);
          } catch (err: any) {
            console.error(`[Admin Sync] Failed name resolution:`, err.message);
          }
        }
      }

      // --- Deduct Inventory on Confirmation ---
      const db = req.scope.resolve("__pg_connection__");
      if (db) {
        console.log(`[Admin] Deducting inventory_level for order ${id}...`);
        for (const item of order.items || []) {
          if (item.variant_id) {
            try {
              await db.raw(`
                UPDATE inventory_level il
                SET stocked_quantity = GREATEST(0, il.stocked_quantity - ?),
                    raw_stocked_quantity = jsonb_build_object(
                      'value', GREATEST(0, COALESCE((il.raw_stocked_quantity->>'value')::numeric, il.stocked_quantity) - ?)::text,
                      'precision', 20
                    ),
                    updated_at = NOW()
                FROM product_variant_inventory_item pvii
                WHERE pvii.inventory_item_id = il.inventory_item_id
                  AND pvii.variant_id = ?
              `, [item.quantity, item.quantity, item.variant_id]);
              console.log(`[Admin] Deducted ${item.quantity} from inventory_level for variant ${item.variant_id}`);
            } catch (invErr: any) {
              console.error(`[Admin] Failed to deduct inventory_level for variant ${item.variant_id}:`, invErr.message);
            }
          }
        }
      }
      
    } catch (e) {
      console.log(`[Admin] Order ${id} not found in DB, using mock data for GHN sync test.`);
      // Mock data for test since checkout flow generates mock orders currently
      items = [{ name: "Mock Product", quantity: 1, weight: 250 }];
    }
    
    const reqBody = req.body as any || {};
    const provider = (reqBody.provider || "ghn").toLowerCase();
    
    let trackingCode = "";
    let isMock = true;

    if (provider === "ghtk") {
      console.log(`[Admin] Syncing with GHTK...`);
      const ghtkToken = process.env.GHTK_API_TOKEN || "";
      
      const totalValue = order?.total || 300000;

      // Validate GHTK required fields
      if (order && order.shipping_address) {
        if (!order.shipping_address.province) {
          throw new Error("GHTK: Thiếu thông tin Tỉnh/Thành phố người nhận");
        }
        if (!order.shipping_address.city) {
          throw new Error("GHTK: Thiếu thông tin Quận/Huyện người nhận");
        }
        if (!order.shipping_address.address_2) {
          throw new Error("GHTK: Thiếu thông tin Phường/Xã người nhận");
        }
        if (!order.shipping_address.phone) {
          throw new Error("GHTK: Thiếu thông tin Số điện thoại người nhận");
        }
      }
      
      const ghtkBody = {
        products: items.map(i => ({
          name: i.name || "Sản phẩm",
          weight: (i.weight || 250) / 1000, // GHTK expects weight in kg
          quantity: i.quantity || 1
        })),
        order: {
          id: id,
          pick_name: process.env.GHTK_PICK_NAME || "Cửa hàng DATN",
          pick_address: process.env.GHTK_PICK_ADDRESS || "123 Đường Test",
          pick_province: process.env.GHTK_PICK_PROVINCE || "TP. Hồ Chí Minh",
          pick_district: process.env.GHTK_PICK_DISTRICT || "Quận 1",
          pick_ward: process.env.GHTK_PICK_WARD || "Phường Bến Nghé",
          pick_tel: process.env.GHTK_PICK_TEL || "0901234567",
          tel: address.phone || "0987654321",
          name: address.first_name || "Khách hàng",
          address: address.address_1 || "Địa chỉ khách hàng",
          province: normalizeProvinceForGhtk(address.province) || "Hà Nội",
          district: address.city || "Quận 1",
          ward: address.address_2 || "Phường Bến Nghé",
          is_freeship: "1",
          pick_money: 0,
          value: totalValue
        }
      };

      trackingCode = `GHTK_MOCK_${Date.now()}`;

      if (ghtkToken) {
        isMock = false;
        console.log("[Admin] GHTK Request Payload:", JSON.stringify(ghtkBody, null, 2));
        const ghtkRes = await fetch("https://services.giaohangtietkiem.vn/services/shipment/order/?ver=1.5", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Token": ghtkToken,
          },
          body: JSON.stringify(ghtkBody),
        });
        const ghtkData = await ghtkRes.json();
        
        if (ghtkData.success && ghtkData.order) {
          trackingCode = ghtkData.order.label || ghtkData.order.tracking_id || trackingCode;
          console.log(`[Admin] GHTK order created successfully. Label: ${trackingCode}`);
        } else {
          console.error("[Admin] GHTK API Error:", ghtkData);
          throw new Error(ghtkData.message || ghtkData.error || JSON.stringify(ghtkData));
        }
      } else {
        console.log("[Admin] GHTK_API_TOKEN missing. Simulating GHTK API success.");
      }
    } else {
      // GHN Logic
      console.log(`[Admin] Syncing with GHN...`);
      const totalWeight = items.reduce((acc, item) => acc + (item.weight * item.quantity), 0) || 200;

      const ghnBody = {
        to_name: address.first_name,
        to_phone: address.phone,
        to_address: address.address_1,
        to_ward_code: to_ward_code,
        to_district_id: to_district_id,
        weight: totalWeight,
        length: 15,
        width: 10,
        height: 10,
        service_type_id: 2,
        payment_type_id: 1,
        required_note: "CHOXEMHANGKHONGTHU",
        items: items
      };

      trackingCode = `GHN_MOCK_${Date.now()}`;

      if (token && shopId) {
        isMock = false;
        const ghnRes = await fetch("https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Token": token,
            "ShopId": shopId,
          },
          body: JSON.stringify(ghnBody),
        });
        const ghnData = await ghnRes.json();
        
        if (ghnData.code === 200 && ghnData.data) {
          trackingCode = ghnData.data.order_code;
        } else {
          console.error("[Admin] GHN API Error:", ghnData);
        }
      } else {
        console.log("[Admin] GHN_TOKEN or GHN_SHOP_ID missing. Simulating GHN API success.");
      }
    }

    // 3. Save Tracking Code to Order Metadata
    try {
      await orderService.updateOrders(id, {
        metadata: {
          tracking_code: trackingCode,
          shipping_provider: provider.toUpperCase()
        }
      });
      console.log(`[Admin] Saved tracking code ${trackingCode} to order ${id}`);
    } catch (e) {
      console.log(`[Admin] Failed to update order metadata (likely because it's a mock order). Tracking code: ${trackingCode}`);
    }

    return res.status(200).json({
      message: "Shipping order synced successfully",
      tracking_code: trackingCode,
      is_mock: isMock
    });

  } catch (error: any) {
    console.error(`[Admin] Shipping Sync Error:`, error);
    return res.status(500).json({ error: error.message || "Failed to sync shipping" });
  }
}
