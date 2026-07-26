import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import * as fs from "fs";
import * as path from "path";

export async function OPTIONS(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const origin = req.headers.origin || "http://localhost:5173";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-publishable-api-key, x-customer-id");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  return res.sendStatus(200);
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const origin = req.headers.origin || "http://localhost:5173";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  try {
    // 1. Get logged-in customer ID
    let customerId = (req as any).auth_context?.actor_id;

    // Fallback: headers hoặc body (hỗ trợ test)
    if (!customerId) {
      customerId = req.headers['x-customer-id'] || (req.body as any).customer_id;
    }

    if (!customerId || typeof customerId !== 'string') {
      return res.status(401).json({ message: "Bạn cần đăng nhập để thực hiện upload avatar." });
    }

    const { avatar } = req.body as any;
    if (!avatar) {
      return res.status(400).json({ message: "Thiếu dữ liệu ảnh (avatar)" });
    }

    // 2. Extract base64 content
    const matches = avatar.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let imageBuffer: Buffer;
    let fileExtension = 'png'; // default

    if (matches && matches.length === 3) {
      const mimeType = matches[1];
      const base64Data = matches[2];
      imageBuffer = Buffer.from(base64Data, 'base64');
      
      if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
        fileExtension = 'jpg';
      } else if (mimeType.includes('webp')) {
        fileExtension = 'webp';
      } else if (mimeType.includes('gif')) {
        fileExtension = 'gif';
      }
    } else {
      // Try parsing as raw base64
      imageBuffer = Buffer.from(avatar, 'base64');
    }

    // 3. Resolve path to frontend public folder
    // process.cwd() is expected to be medusa-backend/backend/apps/backend
    const clientPublicDir = path.resolve(process.cwd(), "../../../../public");
    const uploadDir = path.join(clientPublicDir, "uploads", "avatars");

    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `customer_${customerId}.${fileExtension}`;
    const filePath = path.join(uploadDir, filename);

    // Write file
    await fs.promises.writeFile(filePath, imageBuffer);

    // 4. Update avatar_url in customer metadata
    const db = req.scope.resolve("__pg_connection__");
    const avatarUrl = `/uploads/avatars/${filename}`;

    await db.raw(`
      UPDATE customer 
      SET metadata = COALESCE(metadata, '{}'::jsonb) || ?::jsonb
      WHERE id = ?
    `, [JSON.stringify({ avatar_url: avatarUrl }), customerId]);

    // Fetch updated customer details
    const customerRes = await db.raw(`
      SELECT id, email, first_name, last_name, phone, metadata 
      FROM customer 
      WHERE id = ?
    `, [customerId]);

    const customer = customerRes.rows[0];

    return res.status(200).json({
      message: "Tải lên ảnh đại diện thành công",
      avatar_url: `${avatarUrl}?t=${Date.now()}`,
      customer
    });
  } catch (error: any) {
    console.error("[Upload Avatar Error]:", error);
    return res.status(500).json({ error: error.message || "Lỗi máy chủ khi tải lên ảnh" });
  }
}
