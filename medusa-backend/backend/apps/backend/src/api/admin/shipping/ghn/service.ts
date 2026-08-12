// src/api/admin/shipping/ghn/service.ts
/**
 * Service to create a shipping order with GHN (placeholder implementation).
 * Uses a fake token (FAKE_GHN_TOKEN) – replace with a real token later.
 */
export async function createGhnShipping(order: any) {
  const token = process.env.GHN_API_TOKEN || process.env.GHN_TOKEN || "FAKE_GHN_TOKEN"
  const shopId = process.env.GHN_SHOP_ID
  const apiUrl = process.env.GHN_API_URL || "https://online-gateway.ghn.vn/shiip/public-api/v2"

  // Build minimal payload required by GHN API
  const payload = {
    order: {
      order_code: order.id,
      // Simplified address fields – adjust as needed for real integration
      from_name: "Store",
      from_phone: "0123456789",
      from_address: "123 Store St",
      from_province: "01",
      from_district: "001",
      from_ward: "00001",
      to_name: order.shipping_address?.first_name || "Customer",
      to_phone: order.shipping_address?.phone || "0987654321",
      to_address: order.shipping_address?.address_1 || "Customer Addr",
      to_province: order.shipping_address?.province || "01",
      to_district: order.shipping_address?.district || "001",
      to_ward: order.shipping_address?.ward || "00001",
      height: 10,
      length: 10,
      weight: 500,
      width: 10,
    },
    // Additional fields can be added for real integration
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
    const err = await response.text()
    throw new Error(`GHN shipping creation failed: ${err}`)
  }

  const data = await response.json()
  // GHN returns data inside { data: { order_code, ... } }
  const result = data?.data || {}
  return {
    orderId: result?.order_code || "",
    trackingNumber: result?.label ? result.label : "",
    fee: result?.total_price || 0,
  }
}
