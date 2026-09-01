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
    // Manually parse and verify JWT from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Không tìm thấy token xác thực." });
    }

    const token = authHeader.split(" ")[1];
    let decoded: any = null;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecret");
    } catch (err) {
      return res.status(401).json({ message: "Token xác thực không hợp lệ hoặc đã hết hạn." });
    }

    const authIdentityId = decoded.auth_identity_id;
    if (!authIdentityId) {
      return res.status(401).json({ message: "Không tìm thấy auth_identity_id trong token." });
    }

    const db = req.scope.resolve("__pg_connection__");
    
    // 1. Query provider_identity to get user_metadata
    const providerIdentityRes = await db.raw(`
      SELECT id, user_metadata, provider FROM provider_identity WHERE auth_identity_id = ?
    `, [authIdentityId]);

    if (providerIdentityRes.rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy Provider Identity trong database." });
    }

    const providerIdentity = providerIdentityRes.rows[0];
    const metadata = providerIdentity.user_metadata || {};
    const email = metadata.email || "";
    const googleAvatar = metadata.picture || metadata.avatar_url || metadata.avatar || metadata.photo || "";

    let customer: any = null;
    let newToken: string | null = null;

    // 2. Check if a customer with this email already exists
    if (email) {
      const customerRes = await db.raw(`
        SELECT id, email, first_name, last_name, phone, metadata 
        FROM customer 
        WHERE LOWER(email) = ?
        LIMIT 1
      `, [email.toLowerCase()]);

      if (customerRes.rows.length > 0) {
        customer = customerRes.rows[0];
        
        // Update customer avatar in database metadata if Google avatar is available
        if (googleAvatar) {
          try {
            await db.raw(`
              UPDATE customer 
              SET metadata = COALESCE(metadata, '{}'::jsonb) || ?::jsonb
              WHERE id = ?
            `, [JSON.stringify({ avatar_url: googleAvatar }), customer.id]);

            customer.metadata = { ...(customer.metadata || {}), avatar_url: googleAvatar };
            customer.avatar_url = googleAvatar;
          } catch (e) {
            console.error("[Custom AuthIdentity API] Error updating customer Google avatar:", e);
          }
        }

        // 3. Link Google auth_identity to the existing customer
        const appMetadata = {
          customer_id: customer.id
        };

        await db.raw(`
          UPDATE auth_identity 
          SET app_metadata = COALESCE(app_metadata, '{}'::jsonb) || ?::jsonb
          WHERE id = ?
        `, [JSON.stringify(appMetadata), authIdentityId]);

        // 4. Generate a new JWT token containing the actor_id (customer_id)
        const tokenPayload = {
          auth_identity_id: authIdentityId,
          actor_id: customer.id,
          actor_type: "customer",
          domain: "store"
        };

        newToken = jwt.sign(
          tokenPayload, 
          process.env.JWT_SECRET || "supersecret", 
          { expiresIn: "1d" }
        );

        console.log(`[Custom AuthIdentity API] Linked auth_identity ${authIdentityId} to existing customer ${customer.id}`);
      }
    }
    
    return res.status(200).json({
      auth_identity: {
        id: authIdentityId,
        user_metadata: metadata,
        provider: providerIdentity.provider
      },
      customer,
      token: newToken
    });
  } catch (error: any) {
    console.error("[Get Auth Identity Error]:", error);
    return res.status(500).json({ error: error.message || "Lỗi máy chủ khi lấy thông tin xác thực" });
  }
}
