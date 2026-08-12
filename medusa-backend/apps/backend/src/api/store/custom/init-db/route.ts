import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const db = req.scope.resolve("__pg_connection__");
    
    // Create wallet table
    await db.raw(`
      CREATE TABLE IF NOT EXISTS wallet (
        id VARCHAR(50) PRIMARY KEY,
        customer_id VARCHAR(50) NOT NULL UNIQUE,
        balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create wallet_transaction table
    await db.raw(`
      CREATE TABLE IF NOT EXISTS wallet_transaction (
        id VARCHAR(50) PRIMARY KEY,
        wallet_id VARCHAR(50) NOT NULL REFERENCES wallet(id) ON DELETE CASCADE,
        amount NUMERIC(15, 2) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('topup', 'deduction', 'refund')),
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    res.json({ message: "Tables created successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
