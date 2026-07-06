import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { IOrderModuleService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function orderCanceledHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = data.id;

  const orderService: IOrderModuleService = container.resolve(
    Modules.ORDER
  );
  
  const productModuleService = container.resolve(
    Modules.PRODUCT
  );

  console.log(`[Order Canceled] Processing rollback for order ${orderId}`);

  try {
    const order = await orderService.retrieveOrder(orderId, {
      relations: ["items"],
    });

    if (order && order.items && productModuleService) {
      console.log(`[Order Canceled] Rolling back inventory for order ${orderId}...`);
      
      for (const item of order.items) {
        if (item.variant_id) {
          try {
            const variant = await productModuleService.retrieveProductVariant(item.variant_id);
            if (variant && typeof variant.inventory_quantity === 'number') {
              // Rollback: increase the inventory by the canceled item quantity
              const newQuantity = variant.inventory_quantity + item.quantity;
              
              await productModuleService.updateProductVariants([
                {
                  id: item.variant_id,
                  inventory_quantity: newQuantity
                }
              ]);
              console.log(`[Order Canceled] Rolled back ${item.quantity} to variant ${item.variant_id}. Restored stock: ${newQuantity}`);
            }
          } catch (invErr) {
            console.error(`[Order Canceled] Failed to rollback inventory for variant ${item.variant_id}:`, invErr);
          }
        }
      }
      
      // Also potentially cancel the GHN shipping order if one exists
      if (order.metadata && order.metadata.tracking_code) {
        console.log(`[Order Canceled] Attempting to cancel GHN shipping order: ${order.metadata.tracking_code}`);
        // Real implementation would call GHN's /switch-status/cancel API here.
      }
      
    }
  } catch (error) {
    console.error(`[Order Canceled] Failed to process rollback:`, error);
  }
}

export const config: SubscriberConfig = {
  event: "order.canceled",
};
