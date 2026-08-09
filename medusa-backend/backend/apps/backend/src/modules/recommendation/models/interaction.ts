import { model } from "@medusajs/framework/utils"

export const Interaction = model.define("interaction", {
  id: model.id().primaryKey(),
  customer_id: model.text().nullable(),
  session_id: model.text().nullable(),
  product_id: model.text(),
  interaction_type: model.enum(["VIEW", "CART", "PURCHASE"]),
})
