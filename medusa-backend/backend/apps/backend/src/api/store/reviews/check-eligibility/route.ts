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

    const db = req.scope.resolve("__pg_connection__");

    // Retrieve customer details if customerId provided
    let customerEmail = "";
    let customerFullName = "";
    try {
      const cRes = await db.raw(`SELECT email, first_name, last_name FROM customer WHERE id = ? LIMIT 1`, [customerId]);
      if (cRes.rows[0]) {
        customerEmail = cRes.rows[0].email || "";
        customerFullName = `${cRes.rows[0].last_name || ''} ${cRes.rows[0].first_name || ''}`.trim();
      }
    } catch (_) {}

    // 1. Kiểm tra xem tài khoản này đã từng đánh giá sản phẩm này chưa, nếu có lấy chi tiết review
    const reviewCheck = await db.raw(`
      SELECT r.id, r.rating, r.comment, r.created_at
      FROM reviews r
      LEFT JOIN product p ON p.id = r.product_id OR ('prod_' || p.title) = r.product_id OR r.product_id ILIKE '%' || p.title || '%'
      WHERE (
        r.user_id = ? OR 
        r.user_id = ? OR 
        ( ? != '' AND r.user_id = ? ) OR
        ( ? != '' AND r.user_name ILIKE '%' || ? || '%' )
      )
      AND (
        r.product_id = ? OR 
        p.id = ? OR
        ? ILIKE '%' || COALESCE(p.title, '') || '%' OR
        (COALESCE(p.title, '') != '' AND COALESCE(p.title, '') ILIKE '%' || ? || '%')
      )
      ORDER BY r.id DESC
      LIMIT 1
    `, [
      customerId, customerEmail, customerEmail, customerEmail, customerFullName, customerFullName,
      product_id, product_id, product_id, product_id
    ]);

    const existingReview = reviewCheck.rows[0] || null;
    if (existingReview) {
      return res.status(200).json({ 
        isEligible: false, 
        alreadyReviewed: true,
        existingReview: {
          id: existingReview.id,
          rating: existingReview.rating,
          comment: existingReview.comment,
          created_at: existingReview.created_at
        },
        message: "Bạn đã gửi đánh giá cho sản phẩm này rồi." 
      });
    }

    if (isBypassed) {
      return res.status(200).json({ isEligible: true, alreadyReviewed: false, message: "Bypassed" });
    }

    // 2. Kiểm tra xem khách hàng đã từng mua sản phẩm này chưa
    const purchaseRes = await db.raw(`
      SELECT EXISTS (
        SELECT 1 
        FROM "order" o
        LEFT JOIN order_item oi ON oi.order_id = o.id
        LEFT JOIN order_line_item oli ON oli.id = oi.item_id
        LEFT JOIN product_variant pv ON pv.id = oli.variant_id
        LEFT JOIN product p ON p.id = oli.product_id OR p.id = pv.product_id
        WHERE (o.customer_id = ? OR o.email = ? OR ( ? != '' AND o.email = ? ))
          AND (
            oli.product_id = ? OR 
            pv.product_id = ? OR 
            oli.variant_id = ? OR
            p.id = ? OR
            ? ILIKE '%' || COALESCE(p.title, oli.title, '') || '%' OR
            COALESCE(p.title, oli.title, '') ILIKE '%' || ? || '%'
          )
      ) AS is_eligible
    `, [customerId, customerId, customerEmail, customerEmail, product_id, product_id, product_id, product_id, product_id, product_id]);

    const isEligible = purchaseRes.rows[0]?.is_eligible || false;
    
    return res.status(200).json({ isEligible, alreadyReviewed: false });
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
