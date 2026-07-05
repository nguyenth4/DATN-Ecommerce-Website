import { model } from "@medusajs/framework/utils"
import { Wallet } from "./wallet"

export const WalletTransaction = model.define("wallet_transaction", {
  id: model.id().primaryKey(),
  amount: model.bigNumber(),
  type: model.enum(["payment", "refund", "deposit"]),
  description: model.text().nullable(),
  order_id: model.text().nullable(),
  wallet: model.belongsTo(() => Wallet, {
    mappedBy: "transactions",
  }),
})
