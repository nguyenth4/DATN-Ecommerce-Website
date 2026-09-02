import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import jwt from "jsonwebtoken";

export async function OPTIONS(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const origin = req.headers.origin || "http://localhost:5173";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-publishable-api-key");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  return res.sendStatus(200);
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const origin = req.headers.origin || "http://localhost:5173";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Không tìm thấy token xác thực." });
    }

    const token = authHeader.split(" ")[1];
    let decoded: any = null;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecret");
    } catch {
      return res.status(401).json({ message: "Token xác thực không hợp lệ hoặc đã hết hạn." });
    }

    const authIdentityId = decoded.auth_identity_id;
    if (!authIdentityId) {
      return res.status(401).json({ message: "Không tìm thấy auth_identity_id trong token." });
    }

    const db = req.scope.resolve("__pg_connection__");
    const providerIdentityRes = await db.raw(`
      SELECT id, user_metadata, provider FROM provider_identity WHERE auth_identity_id = ?
    `, [authIdentityId]);

    if (providerIdentityRes.rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy Provider Identity trong database." });
    }

    const providerIdentity = providerIdentityRes.rows[0];
    const metadata = providerIdentity.user_metadata || {};
    const email = metadata.email || "";
    const avatarUrl = metadata.picture || metadata.avatar_url || metadata.avatar || metadata.photo || "";
    let customer: any = null;
    let newToken: string | null = null;

    if (email) {
      const customerRes = await db.raw(`
        SELECT id, email, first_name, last_name, phone, metadata
        FROM customer
        WHERE LOWER(email) = ?
        LIMIT 1
      `, [email.toLowerCase()]);

      if (customerRes.rows.length > 0) {
        customer = customerRes.rows[0];

        if (avatarUrl) {
          await db.raw(`
            UPDATE customer
            SET metadata = COALESCE(metadata, '{}'::jsonb) || ?::jsonb
            WHERE id = ?
          `, [JSON.stringify({ avatar_url: avatarUrl }), customer.id]);
          customer.metadata = { ...(customer.metadata || {}), avatar_url: avatarUrl };
          customer.avatar_url = avatarUrl;
        }

        await db.raw(`
          UPDATE auth_identity
          SET app_metadata = COALESCE(app_metadata, '{}'::jsonb) || ?::jsonb
          WHERE id = ?
        `, [JSON.stringify({ customer_id: customer.id }), authIdentityId]);

        newToken = jwt.sign(
          {
            auth_identity_id: authIdentityId,
            actor_id: customer.id,
            actor_type: "customer",
            domain: "store",
          },
          process.env.JWT_SECRET || "supersecret",
          { expiresIn: "1d" }
        );
      }
    }

    return res.status(200).json({
      auth_identity: {
        id: authIdentityId,
        user_metadata: metadata,
        provider: providerIdentity.provider,
      },
      customer,
      token: newToken,
    });
  } catch (error: any) {
    console.error("[Get Auth Identity Error]:", error);
    return res.status(500).json({ error: error.message || "Lỗi máy chủ khi lấy thông tin xác thực" });
  }
}