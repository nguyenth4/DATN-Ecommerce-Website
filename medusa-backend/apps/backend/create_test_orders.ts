import { initialize as initializeMedusa } from "@medusajs/medusa";
import { resolve } from "path";

async function run() {
  const app = await initializeMedusa({
    directory: resolve("/Applications/XAMPP/xamppfiles/htdocs/DATN-Ecommerce-Website/medusa-backend/apps/backend"),
  });
  
  const orderService = app.scope.resolve("orderService");
  const cartService = app.scope.resolve("cartService");
  
  // Find a cart to base the order on, or we can just update existing returned orders back to delivered
  // wait, it's easier to just reset the return_requested flag on order #98 and #96!
  
  const orders = await orderService.list({
    display_id: [98, 96, 95]
  }, {
    relations: ["items"]
  });
  
  for (const o of orders) {
    const metadata = o.metadata || {};
    delete metadata.return_requested;
    delete metadata.return_reason;
    delete metadata.return_refund_info;
    
    await orderService.update(o.id, {
      metadata: metadata,
      status: "completed"
    });
    console.log(`Reset order ${o.display_id} to delivered state without return request.`);
  }
  
  console.log("Done.");
  process.exit(0);
}

run().catch(console.error);
