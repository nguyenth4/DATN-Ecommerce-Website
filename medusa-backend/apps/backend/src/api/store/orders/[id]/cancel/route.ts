import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

/**
 * POST /store/orders/:id/cancel
 * Cancels an order and restores the inventory for all items.
 * Body: { items: Array<{ id: string (variantId), qty: number }> }
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params;
    const payload = req.body as any;
    console.log(`[Cancel API] Canceling order: ${id}`);

    const productModuleService = req.scope.resolve(Modules.PRODUCT);
    const orderService = req.scope.resolve(Modules.ORDER);

    // Prevent cancellation if order is not pending
    if (orderService) {
      try {
        const order = await orderService.retrieveOrder(id);
        const customStatus = order?.metadata?.custom_status;
        if (order && (order.status !== "pending" || (customStatus && customStatus !== "pending"))) {
          return res.status(400).json({ error: "Chỉ có thể hủy đơn hàng đang ở trạng thái chờ duyệt (pending)." });
        }
        
        const { cancelReason, refundDestination, refundInfo } = payload;
        
        const db = req.scope.resolve("__pg_connection__") as any;
        if (db) {
          const currentMetadata = order?.metadata || {};
          const newMetadata = {
            ...currentMetadata,
            ...(cancelReason && { cancel_reason: cancelReason }),
            ...(refundDestination && { refund_destination: refundDestination, cancel_requested: true }),
            ...(refundInfo && { refund_info: refundInfo }),
          };
          
          await db.raw(`
            UPDATE "order" 
            SET status = 'canceled', metadata = ?::jsonb, updated_at = NOW() 
            WHERE id = ?
          `, [JSON.stringify(newMetadata), id]);
          console.log(`[Cancel API] Order ${id} status updated to canceled with metadata`);
        }
      } catch (err) {
        console.warn(`[Cancel API] Could not retrieve/update order ${id} status:`, err);
      }
    }

    // Prefer items from request body; fallback to in-memory pending orders cache
    let items: Array<{ id: string; qty: number }> = [];

    if (Array.isArray(payload?.items) && payload.items.length > 0) {
      items = payload.items;
    } else {
      // Attempt to retrieve from global pending orders cache (set during checkout)
      const pendingOrders: Map<string, any> = (global as any).__pendingOrders;
      if (pendingOrders && pendingOrders.has(id)) {
        items = pendingOrders.get(id)?.items || [];
      }
    }

    if (!items || items.length === 0) {
      console.warn(`[Cancel API] No items found for order ${id}. Cannot restore inventory.`);
      return res.status(200).json({
        message: "Order cancellation recorded. No inventory to restore.",
        orderId: id,
      });
    }

    // ─── Restore Inventory ───────────────────────────────────────────────────
    const results: Array<{ variantId: string; restored: number; newStock: number }> = [];

    if (productModuleService) {
      for (const item of items) {
        if (item.id && item.qty) {
          try {
            const variant = (await productModuleService.retrieveProductVariant(item.id)) as any;
            if (variant && typeof variant.inventory_quantity === "number") {
              const newQuantity = variant.inventory_quantity + item.qty;
              await productModuleService.updateProductVariants(item.id, {
                inventory_quantity: newQuantity,
              } as any);
              console.log(
                `[Cancel API] Restored ${item.qty} to variant ${item.id}. New stock: ${newQuantity}`
              );
              results.push({ variantId: item.id, restored: item.qty, newStock: newQuantity });
            }
          } catch (invErr) {
            console.error(
              `[Cancel API] Failed to restore inventory for variant ${item.id}:`,
              invErr
            );
          }
        }
      }
    }

    // Remove from pending orders cache
    const pendingOrders: Map<string, any> = (global as any).__pendingOrders;
    if (pendingOrders) {
      pendingOrders.delete(id);
    }

    // Emit order.canceled event
    const eventBus = req.scope.resolve(Modules.EVENT_BUS);
    await eventBus.emit({
      name: "order.canceled",
      data: { id },
    });

    return res.status(200).json({
      message: "Order canceled and inventory restored successfully.",
      orderId: id,
      restoredItems: results,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Cancel order failed";
    console.error("[Cancel API] Error:", error);
    return res.status(500).json({ error: message });
  }
}
