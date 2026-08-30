import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const db = req.scope.resolve("__pg_connection__")

    // Fetch all active promotions (both automatic and manual) that are within valid campaign dates and usage limits
    const promoRes = await db.raw(`
      SELECT p.*, 
             am.id as app_method_id, 
             am.type as app_method_type, 
             am.value as app_method_value, 
             am.allocation, 
             am.max_quantity, 
             am.currency_code
      FROM promotion p
      LEFT JOIN promotion_application_method am ON p.id = am.promotion_id
      LEFT JOIN promotion_campaign c ON p.campaign_id = c.id
      WHERE p.deleted_at IS NULL 
        AND p.status = 'active'
        AND (c.id IS NULL OR (
          (c.starts_at IS NULL OR c.starts_at <= NOW()) AND 
          (c.ends_at IS NULL OR c.ends_at >= NOW())
        ))
        AND (p.limit IS NULL OR p.used < p.limit)
      ORDER BY p.created_at DESC
    `)

    const appMethodIds = promoRes.rows.map((p: any) => p.app_method_id).filter(Boolean);
    const targetRulesMap: Record<string, any[]> = {};

    if (appMethodIds.length > 0) {
      const rulesRes = await db.raw(`
        SELECT amtr.application_method_id, r.attribute, r.operator, rv.value as rule_value,
               col.title as collection_title,
               prod.title as product_title
        FROM application_method_target_rules amtr
        JOIN promotion_rule r ON amtr.promotion_rule_id = r.id
        JOIN promotion_rule_value rv ON r.id = rv.promotion_rule_id
        LEFT JOIN product_collection col ON r.attribute = 'items.product.collection_id' AND rv.value = col.id
        LEFT JOIN product prod ON r.attribute = 'items.product.id' AND rv.value = prod.id
        WHERE amtr.application_method_id = ANY(?) AND r.deleted_at IS NULL AND rv.deleted_at IS NULL
      `, [appMethodIds])

      rulesRes.rows.forEach((rule: any) => {
        if (!targetRulesMap[rule.application_method_id]) {
          targetRulesMap[rule.application_method_id] = [];
        }
        targetRulesMap[rule.application_method_id].push({
          attribute: rule.attribute,
          operator: rule.operator,
          value: rule.rule_value,
          collection_title: rule.collection_title,
          product_title: rule.product_title
        });
      });
    }

    const promotions = promoRes.rows.map((promo: any) => ({
      ...promo,
      target_rules: targetRulesMap[promo.app_method_id] || []
    }));

    return res.json({
      success: true,
      promotions
    })
  } catch (error: any) {
    console.error("[Get Promotions Error]:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi hệ thống khi lấy danh sách mã giảm giá."
    })
  }
}
