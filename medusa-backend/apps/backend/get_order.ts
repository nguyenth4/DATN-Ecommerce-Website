import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function getOrder(
  { container }: { container: MedusaContainer }
) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: [order] } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "summary.*",
      "payment_collections.*"
    ],
    filters: {
      id: "order_01M1DMC7FA09WVK89K5K6KF3K0"
    }
  })

  console.log("Order payment_collections:", order.payment_collections)
  console.log("Order summary:", order.summary)
}
