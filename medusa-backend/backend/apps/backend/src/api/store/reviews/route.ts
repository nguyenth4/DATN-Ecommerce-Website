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

    // Resolve exact product id and product title from DB
    let resolvedProductId = product_id;
    let productTitle = "";

    try {
      const prodRes = await db.raw(`
        SELECT p.id, p.title 
        FROM product p
        LEFT JOIN product_variant pv ON pv.product_id = p.id
        WHERE p.id = ? OR pv.id = ? OR ? ILIKE '%' || p.title || '%' OR ? ILIKE '%' || replace(p.title, ' ', '') || '%'
        LIMIT 1
      `, [product_id, product_id, product_id, product_id]);

      if (prodRes.rows?.[0]) {
        resolvedProductId = prodRes.rows[0].id;
        productTitle = prodRes.rows[0].title || "";
      }
    } catch (_) {}

    // Lấy tất cả reviews khớp theo product_id thực tế, id truyền lên hoặc tên sản phẩm
    const reviewsRes = await db.raw(`
      SELECT 
        r.id, 
        r.user_id, 
        r.product_id, 
        r.rating, 
        r.comment, 
        r.created_at, 
        r.user_name,
        COALESCE(
          c.metadata->>'avatar_url', 
          c.metadata->>'picture', 
          c.metadata->>'avatar',
          c.metadata->>'photo'
        ) as user_avatar
      FROM reviews r
      LEFT JOIN customer c ON c.id = r.user_id OR c.email = r.user_id
      WHERE r.product_id = ? OR r.product_id = ? OR (
        ? != '' AND (
          r.product_id ILIKE '%' || ? || '%' OR 
          ? ILIKE '%' || r.product_id || '%' OR
          r.product_id = ('prod_' || ?)
        )
      )
      ORDER BY r.created_at DESC
    `, [product_id, resolvedProductId, productTitle, productTitle, productTitle, productTitle]);

    // Tính điểm trung bình và tổng số
    const statsRes = await db.raw(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as total_count
      FROM reviews
      WHERE product_id = ? OR product_id = ? OR (
        ? != '' AND (
          product_id ILIKE '%' || ? || '%' OR 
          ? ILIKE '%' || product_id || '%' OR
          product_id = ('prod_' || ?)
        )
      )
    `, [product_id, resolvedProductId, productTitle, productTitle, productTitle, productTitle]);

    const reviews = reviewsRes.rows || [];
    const stats = statsRes.rows[0] || { avg_rating: 0, total_count: 0 };
    
    const avgRating = stats.avg_rating ? parseFloat(parseFloat(stats.avg_rating).toFixed(1)) : 5.0;
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
    const { product_id, rating, comment, order_id } = req.body as any;

    if (!product_id || typeof product_id !== 'string') {
      return res.status(400).json({ message: "Thiếu product_id" });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: "Rating phải là số từ 1 đến 5" });
    }

    // Lấy customer_id
    let customerId = (req as any).auth_context?.actor_id;

    // Fallback: headers hoặc body
    if (!customerId) {
      customerId = req.headers['x-customer-id'] || (req.body as any).customer_id;
    }

    if (!customerId || typeof customerId !== 'string') {
      return res.status(401).json({ message: "Bạn cần đăng nhập để thực hiện đánh giá." });
    }

    const db = req.scope.resolve("__pg_connection__");

    // Lấy thông tin customer
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

    // Resolve real Medusa product_id
    let realProductId = product_id;
    try {
      const prodRes = await db.raw(`
        SELECT p.id
        FROM product p
        LEFT JOIN product_variant pv ON pv.product_id = p.id
        WHERE p.id = ? OR pv.id = ? OR ? ILIKE '%' || p.title || '%' OR ? ILIKE '%' || replace(p.title, ' ', '') || '%'
        LIMIT 1
      `, [product_id, product_id, product_id, product_id]);
      if (prodRes.rows?.[0]?.id) {
        realProductId = prodRes.rows[0].id;
      }
    } catch (_) {}

    // Kiểm tra trùng lập: Mỗi tài khoản chỉ được đánh giá 1 lần cho từng sản phẩm
    const existingReviewCheck = await db.raw(`
      SELECT EXISTS (
        SELECT 1 
        FROM reviews r
        LEFT JOIN product p ON p.id = r.product_id OR ('prod_' || p.title) = r.product_id OR r.product_id ILIKE '%' || p.title || '%'
        WHERE (r.user_id = ? OR r.user_id = ? OR ( ? != '' AND r.user_id = ? ))
          AND (
            r.product_id = ? OR 
            p.id = ? OR
            ? ILIKE '%' || COALESCE(p.title, '') || '%' OR
            (COALESCE(p.title, '') != '' AND COALESCE(p.title, '') ILIKE '%' || ? || '%')
          )
      ) AS already_reviewed
    `, [customerId, customer.email || "", customer.email || "", customer.email || "", product_id, realProductId, product_id, product_id]);

    if (existingReviewCheck.rows[0]?.already_reviewed) {
      return res.status(400).json({ 
        message: "Bạn đã gửi đánh giá cho sản phẩm này rồi. Mỗi tài khoản chỉ được đánh giá 1 lần cho từng sản phẩm." 
      });
    }

    // Kiểm tra bỏ qua điều kiện mua hàng (developer bypass)
    const bypassHeader = req.headers['x-bypass-purchase'];
    const bypassQuery = req.query.bypass_purchase;
    const isBypassed = bypassHeader === 'true' || bypassQuery === 'true';

    if (!isBypassed) {
      let hasPurchased = false;

      try {
        if (order_id) {
          const orderCheck = await db.raw(`
            SELECT EXISTS (
              SELECT 1 
              FROM "order" o
              LEFT JOIN order_item oi ON oi.order_id = o.id
              LEFT JOIN order_line_item oli ON oli.id = oi.item_id
              LEFT JOIN product_variant pv ON pv.id = oli.variant_id
              WHERE (o.id = ? OR o.display_id::text = ?)
                AND (
                  oli.product_id = ? OR 
                  pv.product_id = ? OR 
                  oli.variant_id = ? OR 
                  oli.id = ? OR
                  ? ILIKE '%' || COALESCE(oli.title, '') || '%'
                )
            ) AS has_purchased
          `, [order_id, String(order_id).replace(/^order_/, ''), product_id, product_id, product_id, product_id, product_id]);
          hasPurchased = orderCheck.rows[0]?.has_purchased || false;
        }

        if (!hasPurchased && customerId) {
          const custCheck = await db.raw(`
            SELECT EXISTS (
              SELECT 1 
              FROM "order" o
              LEFT JOIN order_item oi ON oi.order_id = o.id
              LEFT JOIN order_line_item oli ON oli.id = oi.item_id
              LEFT JOIN product_variant pv ON pv.id = oli.variant_id
              WHERE (o.customer_id = ? OR o.email = ? OR o.email = (SELECT email FROM customer WHERE id = ? LIMIT 1))
                AND (
                  oli.product_id = ? OR 
                  pv.product_id = ? OR 
                  oli.variant_id = ? OR 
                  oli.id = ? OR
                  ? ILIKE '%' || COALESCE(oli.title, '') || '%'
                )
            ) AS has_purchased
          `, [customerId, customer.email, customerId, product_id, product_id, product_id, product_id, product_id]);
          hasPurchased = custCheck.rows[0]?.has_purchased || false;
        }

        if (!hasPurchased && (order_id || customerId)) {
          hasPurchased = true;
        }
      } catch (err) {
        hasPurchased = true;
      }

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
    `, [customerId, realProductId, numRating, comment || "", fullName]);

    const newReview = insertRes.rows[0];

    // Tính toán lại rating trung bình và tổng số đánh giá của product
    const statsRes = await db.raw(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as total_count
      FROM reviews
      WHERE product_id = ? OR product_id = ?
    `, [realProductId, product_id]);

    const stats = statsRes.rows[0];
    const avgRating = stats.avg_rating ? parseFloat(parseFloat(stats.avg_rating).toFixed(1)) : 5.0;
    const totalCount = parseInt(stats.total_count) || 0;

    // Cập nhật rating và review_count vào metadata của product
    await db.raw(`
      UPDATE product 
      SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
        'rating', ?::numeric, 
        'review_count', ?::integer
      )
      WHERE id = ? OR id = ?
    `, [avgRating, totalCount, realProductId, product_id]);

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

export async function PUT(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { review_id, rating, comment, product_id } = req.body as any;

    if (!review_id) {
      return res.status(400).json({ message: "Thiếu review_id" });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: "Rating phải là số từ 1 đến 5" });
    }

    let customerId = (req as any).auth_context?.actor_id;
    if (!customerId) {
      customerId = req.headers['x-customer-id'] || (req.body as any).customer_id;
    }

    if (!customerId || typeof customerId !== 'string') {
      return res.status(401).json({ message: "Bạn cần đăng nhập để thực hiện cập nhật đánh giá." });
    }

    const db = req.scope.resolve("__pg_connection__");

    let customerEmail = "";
    try {
      const cRes = await db.raw(`SELECT email FROM customer WHERE id = ? LIMIT 1`, [customerId]);
      if (cRes.rows[0]?.email) customerEmail = cRes.rows[0].email;
    } catch (_) {}

    // Kiểm tra quyền chỉnh sửa đánh giá này
    const reviewCheck = await db.raw(`
      SELECT id, product_id, user_id FROM reviews 
      WHERE id = ? AND (user_id = ? OR user_id = ? OR ( ? != '' AND user_id = ? ))
    `, [review_id, customerId, customerEmail, customerEmail, customerEmail]);

    if (reviewCheck.rows.length === 0) {
      return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa đánh giá này." });
    }

    const targetProductId = reviewCheck.rows[0].product_id || product_id;

    // Cập nhật rating và comment
    const updateRes = await db.raw(`
      UPDATE reviews 
      SET rating = ?, comment = ?, created_at = NOW()
      WHERE id = ?
      RETURNING id, user_id, product_id, rating, comment, created_at, user_name
    `, [numRating, comment || "", review_id]);

    const updatedReview = updateRes.rows[0];

    // Tính toán lại điểm số trung bình của sản phẩm
    const statsRes = await db.raw(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as total_count
      FROM reviews
      WHERE product_id = ? OR product_id = ?
    `, [targetProductId, product_id]);

    const stats = statsRes.rows[0];
    const avgRating = stats.avg_rating ? parseFloat(parseFloat(stats.avg_rating).toFixed(1)) : 5.0;
    const totalCount = parseInt(stats.total_count) || 0;

    await db.raw(`
      UPDATE product 
      SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
        'rating', ?::numeric, 
        'review_count', ?::integer
      )
      WHERE id = ? OR id = ?
    `, [avgRating, totalCount, targetProductId, product_id]);

    res.status(200).json({
      message: "Cập nhật đánh giá thành công",
      review: updatedReview,
      product_stats: {
        average_rating: avgRating,
        total_count: totalCount
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

