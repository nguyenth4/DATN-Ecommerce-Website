import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import WalletModuleService from "../../../modules/wallet/service"
import { WALLET_MODULE } from "../../../modules/wallet"

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { customer, items, paymentMethod, use_wallet, customer_id } = req.body as any
  
  // Calculate total from items (mock calculation for demo)
  const total = items.reduce((acc: number, item: any) => acc + (item.price * item.qty), 0)
  
  const walletService: WalletModuleService = req.scope.resolve(WALLET_MODULE)
  const customerId = customer_id || "cus_demo_123"
  
  let amountToPay = total
  let walletDeducted = 0

  if (use_wallet) {
    const wallet = await walletService.getWalletByCustomerId(customerId)
    const walletBalance = Number(wallet.balance)
    
    if (walletBalance >= total) {
      // Fully paid by wallet
      walletDeducted = total
      amountToPay = 0
    } else {
      // Partially paid by wallet
      walletDeducted = walletBalance
      amountToPay = total - walletBalance
    }

    if (walletDeducted > 0) {
      await walletService.deductBalance(customerId, walletDeducted, `Thanh toán cho đơn hàng ${Date.now()}`)
    }
  }

  // Create order logic here in Medusa (skipped for demo)

  res.json({
    success: true,
    message: "Order placed successfully",
    total_amount: total,
    wallet_deducted: walletDeducted,
    amount_to_pay: amountToPay,
    paymentMethod: amountToPay === 0 ? "wallet" : paymentMethod,
    // Return a dummy payment URL if VNPay/MoMo is selected and amount_to_pay > 0
    paymentUrl: (amountToPay > 0 && paymentMethod !== 'cod') ? "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?dummy" : null
  })
}
