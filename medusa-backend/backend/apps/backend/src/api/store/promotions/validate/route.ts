import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const { code, items } = req.body as any

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Thông tin không hợp lệ. Vui lòng cung cấp danh sách sản phẩm."
      })
    }

    const db = req.scope.resolve("__pg_connection__")

    let promotionsToValidate: any[] = []

    if (code && code.trim() !== "") {
      // 1. Fetch promotion by code (standard or automatic)
      const promoRes = await db.raw(`
        SELECT p.*, am.id as app_method_id, am.type as app_method_type, am.value as app_method_value, am.allocation, am.max_quantity, am.currency_code
        FROM promotion p
        LEFT JOIN promotion_application_method am ON p.id = am.promotion_id
        WHERE UPPER(p.code) = UPPER(?) AND p.deleted_at IS NULL AND p.status = 'active'
      `, [code.trim()])

      if (promoRes.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Mã khuyến mãi không tồn tại hoặc đã hết hạn."
        })
      }
      promotionsToValidate = promoRes.rows
    } else {
      // 2. Fetch all active automatic promotions
      const promoRes = await db.raw(`
        SELECT p.*, am.id as app_method_id, am.type as app_method_type, am.value as app_method_value, am.allocation, am.max_quantity, am.currency_code
        FROM promotion p
        LEFT JOIN promotion_application_method am ON p.id = am.promotion_id
        WHERE p.is_automatic = true AND p.deleted_at IS NULL AND p.status = 'active'
      `)
      promotionsToValidate = promoRes.rows
    }

    if (promotionsToValidate.length === 0) {
      return res.json({
        success: false,
        message: code ? "Mã khuyến mãi không hợp lệ." : "Không có chương trình khuyến mãi tự động nào."
      })
    }

    // Fetch target rules for application methods
    const appMethodIds = promotionsToValidate.map((p: any) => p.app_method_id).filter(Boolean)
    const rulesMap: Record<string, any[]> = {}
    
    if (appMethodIds.length > 0) {
      const rulesRes = await db.raw(`
        SELECT r.id, r.attribute, r.operator, rv.value as rule_value, amtr.application_method_id
        FROM application_method_target_rules amtr
        JOIN promotion_rule r ON amtr.promotion_rule_id = r.id
        JOIN promotion_rule_value rv ON r.id = rv.promotion_rule_id
        WHERE amtr.application_method_id = ANY(?) AND r.deleted_at IS NULL AND rv.deleted_at IS NULL
      `, [appMethodIds])
      
      rulesRes.rows.forEach((rule: any) => {
        if (!rulesMap[rule.application_method_id]) {
          rulesMap[rule.application_method_id] = []
        }
        rulesMap[rule.application_method_id].push(rule)
      })
    }

    // Fetch product collection details for all items in order to check rules
    const productIds = items.map((i: any) => i.productId).filter(Boolean)
    const productCollections: Record<string, string> = {}
    
    if (productIds.length > 0) {
      const prodRes = await db.raw(`
        SELECT id, collection_id FROM product WHERE id = ANY(?)
      `, [productIds])
      prodRes.rows.forEach((row: any) => {
        productCollections[row.id] = row.collection_id
      })
    }

    const results: Array<{ promo: any, discountAmount: number }> = []

    for (const promo of promotionsToValidate) {
      // Validate campaign dates if associated
      if (promo.campaign_id) {
        const campaignRes = await db.raw(`
          SELECT * FROM promotion_campaign WHERE id = ? AND deleted_at IS NULL
        `, [promo.campaign_id])
        if (campaignRes.rows.length > 0) {
          const campaign = campaignRes.rows[0]
          const now = new Date()
          if (campaign.starts_at && new Date(campaign.starts_at) > now) {
            continue
          }
          if (campaign.ends_at && new Date(campaign.ends_at) < now) {
            continue
          }
        }
      }

      // Query rules from pre-fetched map
      const rules = rulesMap[promo.app_method_id] || []

      // Filter items to find eligible ones
      const eligibleItems = items.filter((item: any) => {
        if (rules.length === 0) return true

        return rules.every((rule: any) => {
          if (rule.attribute === 'items.product.collection_id') {
            const itemCollectionId = productCollections[item.productId]
            if (rule.operator === 'eq') {
              return itemCollectionId === rule.rule_value
            } else if (rule.operator === 'in') {
              const allowedCollections = rule.rule_value.split(',').map((v: string) => v.trim())
              return itemCollectionId && allowedCollections.includes(itemCollectionId)
            }
          }
          return true
        })
      })

      if (eligibleItems.length === 0) {
        continue
      }

      // Calculate discount amount
      let discountAmount = 0
      const totalEligiblePrice = eligibleItems.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0)

      if (promo.app_method_type === 'fixed') {
        const value = Number(promo.app_method_value)
        if (promo.allocation === 'each') {
          let maxQtyToDiscount = promo.max_quantity || 999999
          eligibleItems.forEach((item: any) => {
            const qtyToDiscount = Math.min(item.qty, maxQtyToDiscount)
            discountAmount += value * qtyToDiscount
            maxQtyToDiscount -= qtyToDiscount
          })
        } else {
          discountAmount = Math.min(totalEligiblePrice, value)
        }
      } else if (promo.app_method_type === 'percentage') {
        const percentage = Number(promo.app_method_value)
        if (promo.allocation === 'each') {
          let maxQtyToDiscount = promo.max_quantity || 999999
          eligibleItems.forEach((item: any) => {
            const qtyToDiscount = Math.min(item.qty, maxQtyToDiscount)
            discountAmount += Math.round((item.price * qtyToDiscount) * (percentage / 100))
            maxQtyToDiscount -= qtyToDiscount
          })
        } else {
          discountAmount = Math.round(totalEligiblePrice * (percentage / 100))
        }
      }

      // Cap the discount amount to total price of eligible items
      discountAmount = Math.min(discountAmount, totalEligiblePrice)

      if (discountAmount > 0) {
        results.push({
          promo,
          discountAmount
        })
      }
    }

    if (code && code.trim() !== "") {
      if (results.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Mã khuyến mãi không áp dụng cho bất kỳ sản phẩm nào trong giỏ hàng."
        })
      }

      const { promo, discountAmount } = results[0]
      return res.json({
        success: true,
        code: promo.code,
        promotionId: promo.id,
        discount: discountAmount,
        isAutomatic: promo.is_automatic,
        message: `Áp dụng thành công mã giảm giá ${promo.code}.`
      })
    } else {
      if (results.length === 0) {
        return res.json({
          success: false,
          message: "Không có khuyến mãi tự động nào phù hợp."
        })
      }

      // Sort to find the one with the maximum discount amount
      results.sort((a, b) => b.discountAmount - a.discountAmount)
      const { promo, discountAmount } = results[0]

      return res.json({
        success: true,
        code: promo.code,
        promotionId: promo.id,
        discount: discountAmount,
        isAutomatic: true,
        message: `Đã tự động áp dụng chương trình khuyến mãi ${promo.code}.`
      })
    }

  } catch (error: any) {
    console.error("[Validate Promotion Error]:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi hệ thống khi xác thực mã giảm giá."
    })
  }
}
