import { MedusaRequest } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { IOrderModuleService, IInventoryService } from "@medusajs/framework/types"

/**
 * List orders with optional pagination and status filter.
 */
export async function listOrders(scope: any, { limit = 20, offset = 0, status }: { limit: number; offset: number; status?: string }) {
  const query = scope.resolve("query")
  const filters: any = {}
  if (status) filters.status = status

  const { data: orders, metadata: queryMetadata } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "status",
      "summary.current_order_total",
      "summary.original_order_total",
      "metadata",
      "shipping_methods"
    ],
    filters,
    pagination: {
      skip: offset,
      take: limit,
      order: {
        created_at: "DESC"
      }
    }
  })

  const mappedOrders = orders.map((o: any) => ({
    ...o,
    total: o.summary?.current_order_total ?? o.summary?.original_order_total ?? 0,
    shipping_method: o.shipping_methods?.[0]?.name ?? "-"
  }))

  return { orders: mappedOrders, count: queryMetadata.count, offset, limit }
}

/** Retrieve a single order by ID */
export async function getOrder(scope: any, id: string) {
  const orderService: IOrderModuleService = scope.resolve(Modules.ORDER)
  const order = await orderService.retrieveOrder(id, { relations: ["items", "shipping_address", "billing_address"] })
  return { order }
}

/**
 * Update order status. Maps custom Vietnamese states to Medusa standard states 
 * using metadata.custom_status. Handles inventory logic & shipping integrations.
 */
export async function updateOrderStatus(
  scope: any,
  orderId: string,
  newStatus: string, // pending, confirmed, preparing, shipping, delivered, completed, canceled
  shippingMethod?: string,
  adminName?: string
) {
  const orderService: IOrderModuleService = scope.resolve(Modules.ORDER)
  const inventoryService: IInventoryService = scope.resolve(Modules.INVENTORY)

  // Load the order fresh
  const order = await orderService.retrieveOrder(orderId, { relations: ["items"] })

  // Map to native Medusa status (pending by default)
  let medusaStatus: string = "pending"
  if (newStatus === "completed") medusaStatus = "completed"
  if (newStatus === "canceled") medusaStatus = "canceled"

  // Merge with existing metadata
  const existingMetadata = (order as any).metadata || {}
  const metadata: Record<string, any> = {
    ...existingMetadata,
    custom_status: newStatus
  }

  // If status is confirmed, log the time and the admin who confirmed it
  if (newStatus === "confirmed") {
    metadata.confirmed_at = new Date().toISOString()
    metadata.confirmed_by = adminName || "System Admin"

    // Log the confirmation in the Admin timeline (Hoạt động) by inserting an order_change record
    try {
      const db = scope.resolve("__pg_connection__")
      
      const generateMedusaId = (prefix: string) => {
        const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        let result = ""
        for (let i = 0; i < 18; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return `${prefix}_01${result}`
      }

      const changeId = generateMedusaId("orch")
      const currentVersion = (order as any).version || 1

      await db.raw(`
        INSERT INTO order_change (
          id, order_id, version, description, status, change_type, created_by, requested_at, confirmed_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW(), NOW())
      `, [
        changeId,
        orderId,
        currentVersion,
        `Đơn hàng đã được xác nhận bởi ${adminName || "System Admin"}`,
        "confirmed",
        "edit",
        adminName || "System Admin"
      ])
    } catch (err: any) {
      console.error("[updateOrderStatus] Failed to log order change in timeline:", err.message)
    }
  }

  // Update base status and metadata
  await orderService.updateOrders(orderId, { 
    status: medusaStatus as any, 
    metadata 
  })

  // 1. Process Inventory and Shipping when transitioning to "shipping" (or "preparing")
  // For safety, we track inventory_deducted flag in metadata to prevent double deductions.
  if (newStatus === "shipping" || newStatus === "preparing") {
    // Inventory decrement
    if (!existingMetadata.inventory_deducted) {
      for (const item of (order as any).items || []) {
        if (item.variant_id) {
          await inventoryService.adjustInventory(item.variant_id, "", -item.quantity)
        }
      }
      metadata.inventory_deducted = true
      await orderService.updateOrders(orderId, { metadata })
    }

    // Shipping integration (GHN / GHTK) - Only trigger if requested and not yet created
    if (newStatus === "shipping" && shippingMethod && !existingMetadata.tracking_number) {
      let shippingResult: any = null
      if (shippingMethod.toLowerCase() === "ghn") {
        const { createGhnShipping } = await import("../shipping/ghn/service.js")
        shippingResult = await createGhnShipping(order)
      } else if (shippingMethod.toLowerCase() === "ghtk") {
        const { createGhtkShipping } = await import("../shipping/ghtk/service.js")
        shippingResult = await createGhtkShipping(order)
      }

      if (shippingResult) {
        metadata.shipping_provider = shippingMethod.toLowerCase()
        metadata.shipping_order_id = shippingResult.orderId
        metadata.tracking_number = shippingResult.trackingNumber
        metadata.shipping_fee = shippingResult.fee
        
        await orderService.updateOrders(orderId, { metadata })
      }
    }
  }

  // 2. Process Cancellation (Restock inventory if already deducted)
  if (newStatus === "canceled") {
    if (existingMetadata.inventory_deducted) {
      for (const item of (order as any).items || []) {
        if (item.variant_id) {
          await inventoryService.adjustInventory(item.variant_id, "", item.quantity)
        }
      }
      metadata.inventory_deducted = false
      await orderService.updateOrders(orderId, { metadata })
    }
  }

  // Return the freshly updated order
  const updated = await orderService.retrieveOrder(orderId, { relations: ["items"] })
  return { order: updated }
}
