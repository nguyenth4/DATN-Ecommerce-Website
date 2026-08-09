import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { RECOMMENDATION_MODULE } from "../../../modules/recommendation"
import RecommendationModuleService from "../../../modules/recommendation/service"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const recommendationModuleService: RecommendationModuleService = req.scope.resolve(RECOMMENDATION_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  
  const customer_id = req.user?.customer_id
  const session_id = req.query.session_id as string | undefined

  // Lấy danh sách product_id được gợi ý từ module
  const recommendedProductIds = await recommendationModuleService.getPersonalizedRecommendations(
    customer_id, 
    session_id
  )

  if (!recommendedProductIds || recommendedProductIds.length === 0) {
    return res.json({ products: [] })
  }

  // Sử dụng Medusa Query để lấy thông tin chi tiết của các product này
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "handle", "thumbnail", "variants.*", "variants.prices.*"],
    filters: {
      id: recommendedProductIds
    }
  })

  res.json({ products })
}
