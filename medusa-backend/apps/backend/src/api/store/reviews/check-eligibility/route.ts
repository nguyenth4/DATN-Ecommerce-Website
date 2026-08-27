import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const product_id = req.query.product_id as string;
    const customerId = req.query.customer_id as string;
    
    // Developer bypass
    const bypassHeader = req.headers['x-bypass-purchase'];
    const bypassQuery = req.query.bypass_purchase;
    const isBypassed = bypassHeader === 'true' || bypassQuery === 'true';

    if (!product_id || (!customerId && !isBypassed)) {
      return res.status(400).json({ isEligible: false, message: "Missing product_id or customer_id" });
    }

    if (isBypassed) {
      return res.status(200).json({ isEligible: true, message: "Bypassed" });
    }

    const db = req.scope.resolve("__pg_connection__");
    const purchaseRes = await db.raw(`
      SELECT EXISTS (
        SELECT 1 
        FROM "order" o
        JOIN order_item oi ON oi.order_id = o.id
        JOIN order_line_item oli ON oli.id = oi.item_id
        WHERE o.customer_id = ? 
          AND oli.product_id = ?
          AND o.status = 'completed'
      ) AS is_eligible
    `, [customerId, product_id]);

    const isEligible = purchaseRes.rows[0]?.is_eligible || false;
    
    return res.status(200).json({ isEligible });
  } catch (error) {
    console.error("Error in check-eligibility:", error);
    return res.status(500).json({ isEligible: false, error: "Internal server error" });
  }
}

export async function OPTIONS(
  req: MedusaRequest,
  res: MedusaResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-bypass-purchase");
  res.status(200).send();
}
