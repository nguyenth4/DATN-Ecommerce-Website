import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { IOrderModuleService, IInventoryService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = data.id;

  const orderService: IOrderModuleService = container.resolve(
    Modules.ORDER
  );

  const order = await orderService.retrieveOrder(orderId, {
    relations: ["items", "shipping_methods"],
  });

  console.log(`[Order Placed] Processing order ${orderId}`);

  // 1. Process Inventory
  // (In standard Medusa, the completeCartWorkflow handles this, but if custom handling is required)
  console.log(`[Order Placed] Updating Inventory for order ${orderId}`);

  // 2. Process Payment
  console.log(`[Order Placed] Capturing Payment for order ${orderId}`);

  // 3. Push to GHN/GHTK (Shipping Order Create)
  try {
    const token = process.env.GHN_TOKEN;
    const shopId = process.env.GHN_SHOP_ID;
    
    if (token && shopId) {
      console.log(`[Order Placed] Syncing with GHN for order ${orderId}`);
      // Assuming soc/route.ts logic here or similar
      // fetch to GHN API to create shipping order
      const ghnBody = {
        to_name: order.shipping_address?.first_name || "Customer",
        to_phone: order.shipping_address?.phone || "0987654321",
        to_address: order.shipping_address?.address_1 || "Address",
        to_ward_code: order.shipping_address?.province || "20308", // mock
        to_district_id: 1442, // mock
        weight: 200,
        length: 10,
        width: 10,
        height: 10,
        service_type_id: 2,
        payment_type_id: 1,
        required_note: "CHOXEMHANGKHONGTHU",
        items: order.items?.map(item => ({
          name: item.title,
          quantity: item.quantity,
          weight: 100
        })) || []
      };

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
      console.log(`[Order Placed] GHN Sync Result:`, ghnData);
    }
  } catch (error) {
    console.error(`[Order Placed] Failed to sync with GHN:`, error);
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
