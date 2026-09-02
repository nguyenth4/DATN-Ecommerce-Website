export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-publishable-api-key, x-customer-id");
  return res.status(200).send();
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-publishable-api-key, x-customer-id");

  try {
    let customerId = (req as any).auth_context?.actor_id;

    if (!customerId) {
      customerId = req.headers['x-customer-id'] || (req.query as any).customer_id;
    }

    if (!customerId || typeof customerId !== 'string') {
      return res.status(401).json({ message: "Vui lòng đăng nhập để xem ví." });
    }

    const db = req.scope.resolve("__pg_connection__");

    // Fetch wallet
    const walletRes = await db.raw(`
      SELECT id, customer_id, balance, created_at, updated_at
      FROM wallet
      WHERE customer_id = ?
    `, [customerId]);

    let wallet = walletRes.rows[0];

    // Auto-create wallet if it doesn't exist
    if (!wallet) {
      const walletId = `wallet_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const newWalletRes = await db.raw(`
        INSERT INTO wallet (id, customer_id, balance)
        VALUES (?, ?, 0)
        RETURNING id, customer_id, balance, created_at, updated_at
      `, [walletId, customerId]);
      wallet = newWalletRes.rows[0];
    }

    // Fetch transactions
    const txRes = await db.raw(`
      SELECT id, amount, type, description, created_at
      FROM wallet_transaction
      WHERE wallet_id = ?
      ORDER BY created_at DESC
    `, [wallet.id]);

    wallet.transactions = txRes.rows || [];

    res.status(200).json({
      wallet
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
