import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { product_id } = req.query;

    if (!product_id || typeof product_id !== 'string') {
      return res.status(400).json({ message: "Thiếu product_id" });
    }

    const db = req.scope.resolve("__pg_connection__");

    // Lấy tất cả reviews
    const reviewsRes = await db.raw(`
      SELECT id, user_id, product_id, rating, comment, created_at, user_name
      FROM reviews
      WHERE product_id = ?
      ORDER BY created_at DESC
    `, [product_id]);

    // Tính điểm trung bình và tổng số
    const statsRes = await db.raw(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as total_count
      FROM reviews
      WHERE product_id = ?
    `, [product_id]);

    const reviews = reviewsRes.rows || [];
    const stats = statsRes.rows[0] || { avg_rating: 0, total_count: 0 };
    
    const avgRating = stats.avg_rating ? parseFloat(parseFloat(stats.avg_rating).toFixed(1)) : 0;
    const totalCount = parseInt(stats.total_count) || 0;

    res.status(200).json({
      reviews,
      average_rating: avgRating,
      total_count: totalCount
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { product_id, rating, comment } = req.body as any;

    if (!product_id || typeof product_id !== 'string') {
      return res.status(400).json({ message: "Thiếu product_id" });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: "Rating phải là số từ 1 đến 5" });
    }

    // Lấy customer_id
    let customerId = (req as any).auth_context?.actor_id;

    // Fallback: headers hoặc body (hỗ trợ storefront test khi chưa tích hợp auth hoàn chỉnh)
    if (!customerId) {
      customerId = req.headers['x-customer-id'] || (req.body as any).customer_id;
    }

    if (!customerId || typeof customerId !== 'string') {
      return res.status(401).json({ message: "Bạn cần đăng nhập để thực hiện đánh giá." });
    }

    const db = req.scope.resolve("__pg_connection__");

    // Lấy thông tin customer để lấy tên
    const customerRes = await db.raw(`
      SELECT first_name, last_name, email FROM customer WHERE id = ?
    `, [customerId]);

    if (customerRes.rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng trong hệ thống." });
    }

    const customer = customerRes.rows[0];
    const firstName = customer.first_name || "";
    const lastName = customer.last_name || "";
    const fullName = `${lastName} ${firstName}`.trim() || customer.email || "Khách hàng";

    // Kiểm tra bỏ qua điều kiện mua hàng (developer bypass)
    const bypassHeader = req.headers['x-bypass-purchase'];
    const bypassQuery = req.query.bypass_purchase;
    const isBypassed = bypassHeader === 'true' || bypassQuery === 'true';

    if (!isBypassed) {
      // Kiểm tra xem đã mua hàng chưa
      const purchaseRes = await db.raw(`
        SELECT EXISTS (
          SELECT 1 
          FROM "order" o
          JOIN order_item oi ON oi.order_id = o.id
          JOIN order_line_item oli ON oli.id = oi.item_id
          WHERE o.customer_id = ? 
            AND oli.product_id = ?
            AND o.status = 'completed'
        ) AS has_purchased
      `, [customerId, product_id]);

      const hasPurchased = purchaseRes.rows[0]?.has_purchased || false;
      if (!hasPurchased) {
        return res.status(403).json({ 
          message: "Chỉ khách hàng đã mua sản phẩm này mới có thể viết đánh giá." 
        });
      }
    }

    // Insert review mới
    const insertRes = await db.raw(`
      INSERT INTO reviews (user_id, product_id, rating, comment, user_name, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
      RETURNING id, user_id, product_id, rating, comment, created_at, user_name
    `, [customerId, product_id, numRating, comment || "", fullName]);

    const newReview = insertRes.rows[0];

    // Tính toán lại rating trung bình và tổng số đánh giá của product
    const statsRes = await db.raw(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as total_count
      FROM reviews
      WHERE product_id = ?
    `, [product_id]);

    const stats = statsRes.rows[0];
    const avgRating = stats.avg_rating ? parseFloat(parseFloat(stats.avg_rating).toFixed(1)) : 0;
    const totalCount = parseInt(stats.total_count) || 0;

    // Cập nhật rating và review_count vào metadata của product
    await db.raw(`
      UPDATE product 
      SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
        'rating', ?::numeric, 
        'review_count', ?::integer
      )
      WHERE id = ?
    `, [avgRating, totalCount, product_id]);

    res.status(201).json({
      message: "Gửi đánh giá thành công",
      review: newReview,
      product_stats: {
        average_rating: avgRating,
        total_count: totalCount
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
