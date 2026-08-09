import { MedusaService } from "@medusajs/framework/utils"
import { Interaction } from "./models/interaction"

class RecommendationModuleService extends MedusaService({
  Interaction,
}) {
  async getPersonalizedRecommendations(customerId?: string, sessionId?: string) {
    // 1. Lấy lịch sử tương tác của người dùng
    // (Trong đồ án, bạn có thể implement thêm thuật toán gợi ý thật ở đây)
    let filters: Record<string, any> = {}
    
    if (customerId) {
      filters.customer_id = customerId
    } else if (sessionId) {
      filters.session_id = sessionId
    } else {
      // Trả về trending nếu không có user
      return [] 
    }

    // Lấy 10 tương tác gần nhất
    const interactions = await this.listInteractions(filters, {
      take: 10,
      order: { created_at: "DESC" }
    })

    if (!interactions || interactions.length === 0) {
      return [] // Trả về trending nếu user chưa có history
    }

    // Lấy danh sách product_id đã xem/mua
    const productIds = Array.from(new Set(interactions.map(i => i.product_id)))
    
    // Gợi ý demo: Tại đây bạn có thể gọi API Product Module để lấy chi tiết sản phẩm 
    // hoặc triển khai thuật toán Collaborative Filtering.
    // Tạm thời mình trả về danh sách product_id để API xử lý tiếp.
    return productIds
  }
}

export default RecommendationModuleService
