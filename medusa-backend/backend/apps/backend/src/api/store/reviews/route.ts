import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

// ─── Danh sách từ cấm (tiếng Việt + tiếng Anh) ───────────────────────────────
const BANNED_WORDS: string[] = [
  // Tiếng Việt thô tục
  "đụ", "địt", "lồn", "cặc", "buồi", "đéo", "đmm", "vcl", "vkl", "clm",
  "đcm", "dmm", "đml", "dm", "đb", "vl", "cl", "con địt", "con lồn",
  "thằng chó", "con chó", "mẹ mày", "bố mày", "cút", "đồ ngu",
  "thằng ngu", "con ngu", "mày ngu", "óc lợn", "đần", "khốn", "khốn nạn",
  "vô lại", "mất dạy", "vô học", "đồ chó", "chó chết",
  // Tiếng Anh
  "fuck", "shit", "bitch", "asshole", "bastard", "damn", "cunt",
  "dick", "cock", "pussy", "whore", "slut", "nigger", "faggot",
  "motherfucker", "bullshit", "wtf", "stfu",
];

// ─── Hàm kiểm duyệt nội dung bình luận ───────────────────────────────────────
function moderateComment(comment: string): { passed: boolean; reason?: string } {
  const trimmed = comment.trim();

  // 1. Kiểm tra độ dài tối thiểu
  const noSpaces = trimmed.replace(/\s+/g, "");
  if (noSpaces.length < 10) {
    return {
      passed: false,
      reason: "Bình luận quá ngắn, vui lòng viết chi tiết hơn (ít nhất 10 ký tự).",
    };
  }

  // 2. Kiểm tra từ ngữ thô tục / không phù hợp
  const lowerComment = trimmed.toLowerCase();
  for (const word of BANNED_WORDS) {
    // Tìm từ cấm theo ranh giới từ (hoặc substring trong tiếng Việt)
    if (lowerComment.includes(word.toLowerCase())) {
      return {
        passed: false,
        reason: "Bình luận chứa ngôn ngữ không phù hợp, vui lòng chỉnh sửa lại.",
      };
    }
  }

  // 3. Kiểm tra spam ký tự lặp (cùng ký tự chiếm >65% nội dung)
  const chars = noSpaces.split("");
  const charCounts: Record<string, number> = {};
  for (const c of chars) {
    charCounts[c] = (charCounts[c] || 0) + 1;
  }
  const maxCharCount = Math.max(...Object.values(charCounts));
  if (chars.length > 5 && maxCharCount / chars.length > 0.65) {
    return {
      passed: false,
      reason: "Bình luận không hợp lệ (nội dung bị lặp ký tự quá nhiều).",
    };
  }

  // 4. Kiểm tra chứa URL / đường dẫn
  const urlPattern = /https?:\/\/|www\.|\.com|\.net|\.org|\.vn|\.io|\.xyz/i;
  if (urlPattern.test(trimmed)) {
    return {
      passed: false,
      reason: "Bình luận không được chứa đường dẫn hoặc liên kết.",
    };
  }

  // 5. Kiểm tra toàn chữ hoa bất thường (>70% ký tự chữ cái là chữ hoa)
  const letters = trimmed.replace(/[^a-zA-ZÀ-ỹ]/g, "");
  if (letters.length > 10) {
    const upperCount = (trimmed.match(/[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯẠ-Ỵ]/g) || []).length;
    if (upperCount / letters.length > 0.70) {
      return {
        passed: false,
        reason: "Vui lòng không viết toàn chữ hoa trong bình luận.",
      };
    }
  }

  return { passed: true };
}


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
    const stats = statsRes.rows[0] || { avg_rating: 5, total_count: 0 };
    
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
          WHERE o.customer_id = ? AND oli.product_id = ?
        ) AS has_purchased
      `, [customerId, product_id]);

      const hasPurchased = purchaseRes.rows[0]?.has_purchased || false;
      if (!hasPurchased) {
        return res.status(403).json({ 
          message: "Chỉ khách hàng đã mua sản phẩm này mới có thể viết đánh giá." 
        });
      }
    }

    // ─── Kiểm duyệt nội dung bình luận ───────────────────────────────────────
    const commentText = (comment || "").toString().trim();

    if (!commentText) {
      return res.status(400).json({ message: "Vui lòng nhập nội dung bình luận." });
    }

    const moderation = moderateComment(commentText);
    if (!moderation.passed) {
      return res.status(422).json({
        message: moderation.reason || "Bình luận không hợp lệ.",
        code: "REVIEW_REJECTED"
      });
    }

    // Insert review mới
    const insertRes = await db.raw(`
      INSERT INTO reviews (user_id, product_id, rating, comment, user_name, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
      RETURNING id, user_id, product_id, rating, comment, created_at, user_name
    `, [customerId, product_id, numRating, commentText, fullName]);

    const newReview = insertRes.rows[0];


    // Tính toán lại rating trung bình và tổng số đánh giá của product
    const statsRes = await db.raw(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as total_count
      FROM reviews
      WHERE product_id = ?
    `, [product_id]);

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
