import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import scrypt from "scrypt-kdf";

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

    // Fallback support (headers or body) for testing
    if (!customerId) {
      customerId = req.headers['x-customer-id'] || (req.body as any).customer_id;
    }

    if (!customerId || typeof customerId !== 'string') {
      return res.status(401).json({ message: "Bạn cần đăng nhập để thực hiện đổi mật khẩu." });
    }

    const { oldPassword, newPassword } = req.body as any;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Vui lòng nhập mật khẩu cũ và mật khẩu mới." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 8 ký tự." });
    }

    const db = req.scope.resolve("__pg_connection__");

    // 2. Fetch current customer details to get their email
    const customerRes = await db.raw(`
      SELECT email FROM customer WHERE id = ?
    `, [customerId]);

    if (customerRes.rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy thông tin khách hàng." });
    }

    const email = customerRes.rows[0].email;
    if (!email) {
      return res.status(400).json({ message: "Tài khoản không có địa chỉ email hợp lệ." });
    }

    // 3. Find the emailpass provider identity
    const providerIdentityRes = await db.raw(`
      SELECT id, provider_metadata FROM provider_identity 
      WHERE provider = 'emailpass' AND LOWER(entity_id) = LOWER(?)
    `, [email]);

    if (providerIdentityRes.rows.length === 0) {
      return res.status(400).json({ 
        message: "Tài khoản này không đăng nhập bằng email/mật khẩu (có thể là đăng nhập qua mạng xã hội)." 
      });
    }

    const providerIdentity = providerIdentityRes.rows[0];
    const passwordHash = providerIdentity.provider_metadata?.password;

    if (!passwordHash) {
      return res.status(400).json({ message: "Không tìm thấy mật khẩu hiện tại trong hệ thống." });
    }

    // 4. Verify old password using scrypt-kdf
    let isMatch = false;
    try {
      const buf = Buffer.from(passwordHash, "base64");
      isMatch = await scrypt.verify(buf, oldPassword);
    } catch (err: any) {
      console.error("[Password Verification Error]:", err);
      return res.status(500).json({ message: "Lỗi hệ thống khi xác thực mật khẩu." });
    }

    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng." });
    }

    // 5. Hash new password using scrypt-kdf
    let newHash = "";
    try {
      const hashConfig = { logN: 15, r: 8, p: 1 };
      const newHashBuffer = await scrypt.kdf(newPassword, hashConfig);
      newHash = newHashBuffer.toString("base64");
    } catch (err: any) {
      console.error("[Password Hashing Error]:", err);
      return res.status(500).json({ message: "Lỗi hệ thống khi tạo mã băm mật khẩu mới." });
    }

    // 6. Update provider_metadata in database
    const updatedMetadata = {
      ...(providerIdentity.provider_metadata || {}),
      password: newHash
    };

    await db.raw(`
      UPDATE provider_identity 
      SET provider_metadata = ?::jsonb 
      WHERE id = ?
    `, [JSON.stringify(updatedMetadata), providerIdentity.id]);

    return res.status(200).json({
      message: "Đổi mật khẩu thành công."
    });
  } catch (error: any) {
    console.error("[Change Password Route Error]:", error);
    return res.status(500).json({ message: error.message || "Lỗi máy chủ khi đổi mật khẩu." });
  }
}
