import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const db = req.scope.resolve("__pg_connection__");
    
    // Check tables
    const tablesRes = await db.raw("SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%review%'");
    const columnsRes = await db.raw("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'reviews'");

    res.json({
      tables: tablesRes.rows,
      columns: columnsRes.rows
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
