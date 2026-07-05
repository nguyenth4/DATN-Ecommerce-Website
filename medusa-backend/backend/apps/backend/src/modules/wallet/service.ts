import { MedusaService } from "@medusajs/framework/utils"
import { Wallet } from "./models/wallet"
import { WalletTransaction } from "./models/wallet-transaction"

class WalletModuleService extends MedusaService({
  Wallet,
  WalletTransaction,
}) {
  
  async getWalletByCustomerId(customerId: string) {
    const wallets = await this.listWallets({
      customer_id: customerId,
    }, {
      relations: ["transactions"],
    })

    if (wallets.length === 0) {
      // Create a new wallet for the customer if one doesn't exist
      const wallet = await this.createWallets({
        customer_id: customerId,
        balance: 0,
      })
      // The return value of createWallets is an object when passed an object in some Medusa versions, 
      // but to be safe we can use listWallets again or retrieve
      const createdWallet = Array.isArray(wallet) ? wallet[0] : wallet
      
      return await this.retrieveWallet(createdWallet.id, {
        relations: ["transactions"],
      })
    }

    return wallets[0]
  }

  async addBalance(customerId: string, amount: number, type: "deposit" | "refund", description?: string, orderId?: string) {
    let wallet = await this.getWalletByCustomerId(customerId)
    
    // Update balance
    const newBalance = Number(wallet.balance) + amount
    await this.updateWallets({
      id: wallet.id,
      balance: newBalance,
    })

    // Create transaction log
    await this.createWalletTransactions({
      wallet_id: wallet.id,
      amount: amount,
      type: type,
      description: description,
      order_id: orderId,
    })

    return this.retrieveWallet(wallet.id, {
      relations: ["transactions"],
    })
  }

  async deductBalance(customerId: string, amount: number, description?: string, orderId?: string) {
    let wallet = await this.getWalletByCustomerId(customerId)
    
    if (Number(wallet.balance) < amount) {
      throw new Error("Số dư ví không đủ")
    }

    // Update balance
    const newBalance = Number(wallet.balance) - amount
    await this.updateWallets({
      id: wallet.id,
      balance: newBalance,
    })

    // Create transaction log
    await this.createWalletTransactions({
      wallet_id: wallet.id,
      amount: amount,
      type: "payment",
      description: description,
      order_id: orderId,
    })

    return this.retrieveWallet(wallet.id, {
      relations: ["transactions"],
    })
  }
}

export default WalletModuleService
