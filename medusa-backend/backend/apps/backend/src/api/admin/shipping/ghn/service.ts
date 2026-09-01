// src/api/admin/shipping/ghn/service.ts
/**
 * Service to create a shipping order with GHN.
 * Uses a real token and shop ID from environment variables.
 */
export async function createGhnShipping(order: any) {
  const token = process.env.GHN_API_TOKEN || process.env.GHN_TOKEN || "FAKE_GHN_TOKEN"
  const shopId = process.env.GHN_SHOP_ID
  const apiUrl = process.env.GHN_API_URL || "https://online-gateway.ghn.vn/shiip/public-api/v2"

  // 1. Resolve recipient details
  const toName = order.metadata?.full_name || 
    [order.shipping_address?.first_name, order.shipping_address?.last_name].filter(Boolean).join(" ") || 
    "Khách Hàng"

  const toPhone = order.metadata?.phone || order.shipping_address?.phone || "0987654321"

  const toAddress = order.shipping_address?.address_1 || "Địa chỉ khách nhận"
  
  // 2. Resolve Ward and District IDs (mandatory for GHN)
  // Check metadata first, then fall back to the address fields, or sandbox default
  const toWardCode = String(order.shipping_address?.metadata?.ward_code || order.shipping_address?.ward || "20308")
  const toDistrictId = parseInt(order.shipping_address?.metadata?.district_id || order.shipping_address?.district) || 1444

  // 3. Build flat payload required by GHN API
  const payload = {
    payment_type_id: 2, // 2: Buyer pays shipping fee, 1: Seller pays
    note: "Đơn hàng từ Sprylo",
    required_note: "KHONGCHOXEMHANG",
    to_name: toName,
    to_phone: toPhone,
    to_address: toAddress,
    to_ward_code: toWardCode,
    to_district_id: toDistrictId,
    weight: 500, // Total weight in grams
    length: 10,
    width: 10,
    height: 10,
    service_type_id: 2, // E-commerce delivery service
    items: (order.items || []).map((item: any) => ({
      name: item.title || "Sản phẩm",
      quantity: item.quantity || 1,
      price: item.unit_price || 0,
      weight: 200
    }))
  }

  const url = `${apiUrl}/shipping-order/create`
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Token: token,
      ...(shopId ? { ShopId: shopId } : {}),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)

    if (errorBody?.code_message === "CREATE_ORDER_FAIL_BY_EXCEED_LIMIT") {
      throw new Error(
        "GHN đang giới hạn tài khoản này tối đa 3 đơn tạo mới. Hãy hủy hoặc hoàn tất đơn thử nghiệm trên GHN, hoặc dùng tài khoản GHN khác trước khi giao đơn này.",
      )
    }

    throw new Error(
      `GHN shipping creation failed: ${errorBody?.message || response.statusText}`,
    )
  }

  const data = await response.json()
  // GHN returns data inside { data: { order_code, label, total_price } }
  const result = data?.data || {}
  const fee = result?.total_price || (order.metadata?.shipping_fee ? parseInt(order.metadata.shipping_fee) : 0)
  return {
    orderId: result?.order_code || "",
    trackingNumber: result?.label || result?.order_code || "",
    fee,
  }
}
