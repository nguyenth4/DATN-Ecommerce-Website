import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import WalletModuleService from "../../../../modules/wallet/service"
import { WALLET_MODULE } from "../../../../modules/wallet"

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const customerId = (req.body as any).customer_id || "cus_demo_123"
  const amount = (req.body as any).amount || 10000000 // default 10M
  
  const walletService: WalletModuleService = req.scope.resolve(WALLET_MODULE)
  
  try {
    const wallet = await walletService.addBalance(customerId, amount, "deposit", "Nạp tiền demo (Admin/Hệ thống)")
    res.json({ wallet, message: `Thành công nạp ${amount} vào ví.` })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}
