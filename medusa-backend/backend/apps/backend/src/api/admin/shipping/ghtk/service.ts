// src/api/admin/shipping/ghtk/service.ts
/**
 * Service to create a shipping order with GHTK (placeholder implementation).
 * Uses a fake token (FAKE_GHTK_TOKEN) – replace with a real token later.
 */
export async function createGhtkShipping(order: any) {
  const token = "FAKE_GHTK_TOKEN"
  // Minimal payload for GHTK sandbox – adapt as needed for real integration
  const payload = {
    order_id: order.id,
    // Simplified address fields
    pick_name: "Store",
    pick_tel: "0123456789",
    pick_address: "123 Store St",
    pick_province: "01",
    pick_district: "001",
    pick_ward: "00001",
    name: order.shipping_address?.first_name || "Customer",
    tel: order.shipping_address?.phone || "0987654321",
    address: order.shipping_address?.address_1 || "Customer Addr",
    province: order.shipping_address?.province || "01",
    district: order.shipping_address?.district || "001",
    ward: order.shipping_address?.ward || "00001",
    height: 10,
    length: 10,
    weight: 500,
    width: 10,
    value: 100000, // placeholder value of goods
  }

  const url = "https://sandbox-api.ghn.co/v2/shipping-order/create"
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`GHTK shipping creation failed: ${err}`)
  }

  const data = await response.json()
  // Assume GHTK returns an object with order_code, tracking_no, and fee
  const result = data?.data || {}
  return {
    orderId: result?.order_code || "",
    trackingNumber: result?.tracking_no || "",
    fee: result?.price || 0,
  }
}
