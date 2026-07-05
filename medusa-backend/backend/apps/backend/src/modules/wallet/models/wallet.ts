import { model } from "@medusajs/framework/utils"
import { WalletTransaction } from "./wallet-transaction"

export const Wallet = model.define("wallet", {
  id: model.id().primaryKey(),
  customer_id: model.text().unique(),
  balance: model.bigNumber().default(0),
  transactions: model.hasMany(() => WalletTransaction, {
    mappedBy: "wallet",
  }),
})
