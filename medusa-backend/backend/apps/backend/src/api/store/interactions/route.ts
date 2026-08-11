import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { RECOMMENDATION_MODULE } from "../../../modules/recommendation"
import RecommendationModuleService from "../../../modules/recommendation/service"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const recommendationModuleService: RecommendationModuleService = req.scope.resolve(RECOMMENDATION_MODULE)
  
  const { product_id, interaction_type, session_id } = req.body as any
  const customer_id = (req as any).auth_context?.actor_id // Nếu có dùng auth trung gian

  if (!product_id || !interaction_type) {
    return res.status(400).json({ message: "product_id and interaction_type are required" })
  }

  // Create the interaction
  const interaction = await recommendationModuleService.createInteractions({
    product_id,
    interaction_type,
    customer_id: customer_id || null,
    session_id: session_id || null,
  })

  res.status(200).json({ interaction })
}
