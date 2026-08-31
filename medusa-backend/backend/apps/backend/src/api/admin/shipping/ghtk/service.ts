// src/api/admin/shipping/ghtk/service.ts
/**
 * Service to simulate a shipping order with GHTK for testing purposes.
 */
export async function createGhtkShipping(order: any) {
  // Generate a mock tracking number and return success
  const trackingNumber = `GHTK_${Math.floor(100000000 + Math.random() * 900000000)}`
  const fee = order.metadata?.shipping_fee ? parseInt(order.metadata.shipping_fee) : 30000
  return {
    orderId: `ghtk_order_${order.id}`,
    trackingNumber,
    fee,
  }
}
