import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-publishable-api-key, x-customer-id");
  return res.status(200).send();
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-publishable-api-key, x-customer-id");

  try {
    let customerId = (req as any).auth_context?.actor_id;

    if (!customerId) {
      customerId = req.headers['x-customer-id'] || (req.body as any).customer_id;
    }

    if (!customerId || typeof customerId !== 'string') {
      return res.status(401).json({ message: "Vui lòng đăng nhập để nạp tiền." });
    }

    const { amount } = req.body as any;
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ message: "Số tiền nạp không hợp lệ." });
    }

    const db = req.scope.resolve("__pg_connection__");

    // Lấy ví (nếu chưa có thì báo lỗi, vì thông thường vào trang Account gọi GET đã tạo ví rồi)
    const walletRes = await db.raw(`
      SELECT id, balance
      FROM wallet
      WHERE customer_id = ?
    `, [customerId]);

    let wallet = walletRes.rows[0];

    if (!wallet) {
      // Auto create if not exist
      const walletId = `wallet_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const newWalletRes = await db.raw(`
        INSERT INTO wallet (id, customer_id, balance)
        VALUES (?, ?, 0)
        RETURNING id, balance
      `, [walletId, customerId]);
      wallet = newWalletRes.rows[0];
    }

    // Cộng tiền vào ví
    await db.raw(`
      UPDATE wallet
      SET balance = balance + ?, raw_balance = jsonb_build_object('value', (balance + ?)::text, 'precision', 20), updated_at = NOW()
      WHERE id = ?
    `, [numAmount, numAmount, wallet.id]);

    // Tạo giao dịch topup
    const txId = `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    await db.raw(`
      INSERT INTO wallet_transaction (id, wallet_id, amount, raw_amount, type, description)
      VALUES (?, ?, ?, jsonb_build_object('value', ?::text, 'precision', 20), 'topup', ?)
    `, [txId, wallet.id, numAmount, numAmount.toString(), `Nạp ${numAmount.toLocaleString('vi-VN')}đ vào ví`]);

    // Lấy lại ví mới nhất kèm giao dịch
    const updatedWalletRes = await db.raw(`
      SELECT id, customer_id, balance, created_at, updated_at
      FROM wallet
      WHERE id = ?
    `, [wallet.id]);

    const finalWallet = updatedWalletRes.rows[0];

    const txRes = await db.raw(`
      SELECT id, amount, type, description, created_at
      FROM wallet_transaction
      WHERE wallet_id = ?
      ORDER BY created_at DESC
    `, [wallet.id]);

    finalWallet.transactions = txRes.rows || [];

    res.status(200).json({
      message: "Nạp tiền thành công",
      wallet: finalWallet
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
