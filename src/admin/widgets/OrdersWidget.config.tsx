// src/admin/widgets/OrdersWidget.config.tsx
import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { OrdersWidget } from "./OrdersWidget";

/**
 * Register the OrdersWidget in the Medusa Admin dashboard.
 * The `zone` determines where the widget appears.
 * "dashboard" means it will be placed on the main dashboard page.
 */
export default defineWidgetConfig({
  zone: "dashboard",
  widget: OrdersWidget,
});
