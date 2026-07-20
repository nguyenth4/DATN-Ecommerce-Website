import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    // 1. Get logged-in customer ID
    let customerId = (req as any).auth_context?.actor_id;

    // Fallback: headers hoặc body (hỗ trợ test)
    if (!customerId) {
      customerId = req.headers['x-customer-id'] || (req.body as any).customer_id;
    }

    if (!customerId || typeof customerId !== 'string') {
      return res.status(401).json({ message: "Bạn cần đăng nhập để thực hiện cập nhật thông tin." });
    }

    const { first_name, last_name, phone, email, gender, dob } = req.body as any;

    if (!first_name || !last_name) {
      return res.status(400).json({ message: "Họ và Tên là trường bắt buộc." });
    }

    const db = req.scope.resolve("__pg_connection__");

    // 2. Fetch current customer details to check if email changed
    const currentCustomerRes = await db.raw(`
      SELECT email FROM customer WHERE id = ?
    `, [customerId]);

    if (currentCustomerRes.rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy thông tin khách hàng." });
    }

    const oldEmail = currentCustomerRes.rows[0].email;

    // 3. If email changed, check if it's already in use
    if (email && email.toLowerCase() !== oldEmail?.toLowerCase()) {
      const emailCheck = await db.raw(`
        SELECT id FROM customer WHERE LOWER(email) = ? AND id != ?
      `, [email.toLowerCase(), customerId]);

      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ message: "Email này đã được sử dụng bởi một tài khoản khác." });
      }
    }

    // 4. Update customer details (standard fields & metadata)
    const updatedMetadata = {
      gender: gender || "Nam",
      dob: dob || "1998-05-15"
    };

    await db.raw(`
      UPDATE customer 
      SET first_name = ?, last_name = ?, phone = ?, email = ?, 
          metadata = COALESCE(metadata, '{}'::jsonb) || ?::jsonb
      WHERE id = ?
    `, [first_name, last_name, phone || "", email || "", JSON.stringify(updatedMetadata), customerId]);

    // 5. Sync email change with authentication tables dynamically
    if (email && email.toLowerCase() !== oldEmail?.toLowerCase()) {
      // Find what tables exist in database
      const tablesCheck = await db.raw(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name IN ('auth_user', 'auth_identity');
      `);

      const hasAuthUser = tablesCheck.rows.some((r: any) => r.table_name === 'auth_user');
      if (hasAuthUser) {
        await db.raw(`
          UPDATE auth_user 
          SET email = ? 
          WHERE LOWER(email) = ?
        `, [email.toLowerCase(), oldEmail.toLowerCase()]);
      }

      const hasAuthIdentity = tablesCheck.rows.some((r: any) => r.table_name === 'auth_identity');
      if (hasAuthIdentity) {
        const colsCheck = await db.raw(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = 'auth_identity' AND column_name = 'identifier';
        `);
        const hasIdentifier = colsCheck.rows.length > 0;
        if (hasIdentifier) {
          await db.raw(`
            UPDATE auth_identity 
            SET identifier = ? 
            WHERE LOWER(identifier) = ?
          `, [email.toLowerCase(), oldEmail.toLowerCase()]);
        }
      }
    }

    // 6. Fetch updated customer details to return
    const customerRes = await db.raw(`
      SELECT id, email, first_name, last_name, phone, metadata 
      FROM customer 
      WHERE id = ?
    `, [customerId]);

    const customer = customerRes.rows[0];

    return res.status(200).json({
      message: "Cập nhật thông tin cá nhân thành công",
      customer
    });
  } catch (error: any) {
    console.error("[Update Profile Error]:", error);
    return res.status(500).json({ error: error.message || "Lỗi máy chủ khi cập nhật thông tin" });
  }
}
