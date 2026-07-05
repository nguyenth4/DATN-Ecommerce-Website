// src/api/admin/orders/controller.ts
import { MedusaRequest } from "@medusajs/framework/http"
import { Modules, MedusaContainer } from "@medusajs/framework/utils"
import { IOrderModuleService, IInventoryService } from "@medusajs/framework/types"

/**
 * List orders with optional pagination and status filter.
 */
export async function listOrders({ limit = 20, offset = 0, status }: { limit: number; offset: number; status?: string }) {
  const container = (global as any).container as MedusaContainer
  const orderService: IOrderModuleService = container.resolve(Modules.ORDER)
  const query: any = {
    skip: offset,
    take: limit,
  }
  if (status) query.status = status
  const [orders, count] = await orderService.listAndCount(query)
  return { orders, count }
}

/** Retrieve a single order by ID */
export async function getOrder(id: string) {
  const container = (global as any).container as MedusaContainer
  const orderService: IOrderModuleService = container.resolve(Modules.ORDER)
  const order = await orderService.retrieveOrder(id, { relations: ["items", "shipping_address", "billing_address"] })
  return order
}

/**
 * Update order status. Handles inventory decrement and shipping order creation
 * if the new status is "fulfilled" (or the enum value that represents fulfillment).
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: string,
  shippingMethod?: string
) {
  const container = (global as any).container as MedusaContainer
  const manager = container.resolve("manager")
  const orderService: IOrderModuleService = container.resolve(Modules.ORDER)
  const inventoryService: IInventoryService = container.resolve(Modules.INVENTORY)

  // Use a transaction to keep all steps atomic
  return await manager.transaction(async (transactionManager: any) => {
    // Load the order fresh inside the transaction
    const order = await orderService.retrieveOrder(orderId, { relations: ["items"] })

    // Update status
    await orderService.update(orderId, { status: newStatus })

    // If the order is being fulfilled, handle inventory & shipping
    if (newStatus === "fulfilled") {
      // --- Inventory decrement (only if not already done) ---
      if (order.fulfillment_status !== "fulfilled") {
        for (const item of order.items) {
          // Adjust inventory for the variant of each line item
          await inventoryService.adjustQuantity(item.variant_id, -item.quantity)
        }
      }

      // --- Shipping integration ---
      if (shippingMethod) {
        let shippingResult: any = null
        if (shippingMethod.toLowerCase() === "ghn") {
          const { createGhnShipping } = await import("../shipping/ghn/service")
          shippingResult = await createGhnShipping(order)
        } else if (shippingMethod.toLowerCase() === "ghtk") {
          const { createGhtkShipping } = await import("../shipping/ghtk/service")
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
          await orderService.update(orderId, { metadata })
        }
      }
    }
    // Return the freshly updated order
    const updated = await orderService.retrieveOrder(orderId, { relations: ["items"] })
    return updated
  })
}
