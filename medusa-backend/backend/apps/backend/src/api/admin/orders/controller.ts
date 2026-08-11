import { MedusaRequest } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { IOrderModuleService, IInventoryService } from "@medusajs/framework/types"

/**
 * List orders with optional pagination and status filter.
 */
export async function listOrders(scope: any, { limit = 20, offset = 0, status }: { limit: number; offset: number; status?: string }) {
  const orderService: IOrderModuleService = scope.resolve(Modules.ORDER)
  const filters: any = {}
  if (status) filters.status = status
  const config = {
    skip: offset,
    take: limit,
  }
  const [orders, count] = await orderService.listAndCountOrders(filters, config)
  return { orders, count, offset, limit }
}

/** Retrieve a single order by ID */
export async function getOrder(scope: any, id: string) {
  const orderService: IOrderModuleService = scope.resolve(Modules.ORDER)
  const order = await orderService.retrieveOrder(id, { relations: ["items", "shipping_address", "billing_address"] })
  return { order }
}

/**
 * Update order status. Handles inventory decrement and shipping order creation
 * if the new status is "fulfilled" (or the enum value that represents fulfillment).
 */
export async function updateOrderStatus(
  scope: any,
  orderId: string,
  newStatus: string,
  shippingMethod?: string
) {
  const orderService: IOrderModuleService = scope.resolve(Modules.ORDER)
  const inventoryService: IInventoryService = scope.resolve(Modules.INVENTORY)

  // Load the order fresh
  const order = await orderService.retrieveOrder(orderId, { relations: ["items"] })

  // Update status
  await orderService.updateOrders(orderId, { status: newStatus as any })

  // If the order is being fulfilled, handle inventory & shipping
  if (newStatus === "fulfilled") {
    // --- Inventory decrement (only if not already done) ---
    if ((order as any).fulfillment_status !== "fulfilled") {
      for (const item of (order as any).items || []) {
        if (item.variant_id) {
          await inventoryService.adjustInventory(item.variant_id, "", -item.quantity)
        }
      }
    }

    // --- Shipping integration ---
    if (shippingMethod) {
      let shippingResult: any = null
      if (shippingMethod.toLowerCase() === "ghn") {
        const { createGhnShipping } = await import("../shipping/ghn/service.js")
        shippingResult = await createGhnShipping(order)
      } else if (shippingMethod.toLowerCase() === "ghtk") {
        const { createGhtkShipping } = await import("../shipping/ghtk/service.js")
        shippingResult = await createGhtkShipping(order)
      }
      if (shippingResult) {
        // Store shipping metadata in order.metadata (do not create new columns)
        const metadata = {
          shipping_provider: shippingMethod.toLowerCase(),
          shipping_order_id: shippingResult.orderId,
          tracking_number: shippingResult.trackingNumber,
          shipping_fee: shippingResult.fee,
        }
        await orderService.updateOrders(orderId, { metadata })
      }
    }
  }
  // Return the freshly updated order
  const updated = await orderService.retrieveOrder(orderId, { relations: ["items"] })
  return { order: updated }
}
