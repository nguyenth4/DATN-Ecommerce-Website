import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const db = req.scope.resolve("__pg_connection__");

    // Lấy tất cả đánh giá kết hợp với tên sản phẩm và ảnh thumbnail sản phẩm
    const reviewsRes = await db.raw(`
      SELECT 
        r.id, 
        r.user_id, 
        r.product_id, 
        r.rating, 
        r.comment, 
        r.created_at, 
        r.user_name,
        r.images,
        COALESCE(p.title, r.product_id) as product_title,
        p.thumbnail as product_thumbnail
      FROM reviews r
      LEFT JOIN product p ON p.id = r.product_id OR ('prod_' || p.title) = r.product_id OR r.product_id ILIKE '%' || p.title || '%'
      ORDER BY r.created_at DESC
    `);

    // Thống kê tổng hợp
    const statsRes = await db.raw(`
      SELECT 
        COUNT(*) as total_reviews,
        COALESCE(AVG(rating), 0) as avg_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star_count
      FROM reviews
    `);

    const reviews = Array.isArray(reviewsRes) ? reviewsRes : (reviewsRes.rows || []);
    const statsArray = Array.isArray(statsRes) ? statsRes : (statsRes.rows || []);
    const stats = statsArray[0] || { total_reviews: 0, avg_rating: 0, five_star_count: 0 };

    res.status(200).json({
      reviews,
      stats: {
        total_reviews: parseInt(stats.total_reviews) || 0,
        avg_rating: stats.avg_rating ? parseFloat(parseFloat(stats.avg_rating).toFixed(1)) : 0,
        five_star_count: parseInt(stats.five_star_count) || 0,
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: "Thiếu review id" });
    }

    const db = req.scope.resolve("__pg_connection__");

    const deleteRes = await db.raw(`
      DELETE FROM reviews WHERE id = ? RETURNING *
    `, [id]);

    const deletedRow = Array.isArray(deleteRes) ? deleteRes[0] : (deleteRes.rows ? deleteRes.rows[0] : null);

    if (!deletedRow) {
      return res.status(404).json({ message: "Không tìm thấy đánh giá" });
    }

    res.status(200).json({
      message: "Xóa đánh giá thành công",
      deleted: deletedRow
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function OPTIONS(
  req: MedusaRequest,
  res: MedusaResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.status(200).send();
}
