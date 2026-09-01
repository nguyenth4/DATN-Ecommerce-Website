import { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function updateOrders(
  { container }: { container: MedusaContainer }
) {
  const orderService = container.resolve(Modules.ORDER)
  const [orders] = await orderService.listAndCountOrders(
    {},
    { take: 20, order: { created_at: "DESC" }, relations: ["metadata"] }
  )

  let count = 0;
  for (const order of orders) {
    if (order.status !== "completed" && count < 5) {
      console.log(`Updating order ${order.id}...`)
      await orderService.updateOrders(order.id, {
        status: "completed",
        metadata: {
          ...order.metadata,
          custom_status: "delivered",
        }
      })
      console.log(`Updated order ${order.id} metadata`)
      count++;
    }
  }

  if (count === 0) {
    console.log("No orders found.");
  }
}
