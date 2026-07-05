import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import WalletModuleService from "../../../modules/wallet/service"
import { WALLET_MODULE } from "../../../modules/wallet"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  // In a real scenario, this comes from req.auth_context or req.user.
  // For the DATN demo, we use a fixed customer ID or one from query
  const customerId = (req.query.customer_id as string) || "cus_demo_123"

  const walletService: WalletModuleService = req.scope.resolve(WALLET_MODULE)
  
  try {
    const wallet = await walletService.getWalletByCustomerId(customerId)
    res.json({ wallet })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}
