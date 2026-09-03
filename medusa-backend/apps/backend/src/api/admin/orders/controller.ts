import { MedusaRequest } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { IOrderModuleService, IInventoryService } from "@medusajs/framework/types"
import { Resend } from "resend"
import { createGhnShipping } from "../shipping/ghn/service"
import { createGhtkShipping } from "../shipping/ghtk/service"

/**
 * List orders with optional pagination and status filter.
 */
export async function listOrders(scope: any, { limit = 20, offset = 0, status }: { limit: number; offset: number; status?: string }) {
  const query = scope.resolve("query")
  const filters: any = {}
  if (status) filters.status = status

  const { data: orders, metadata: queryMetadata } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "status",
      "summary.current_order_total",
      "summary.original_order_total",
      "metadata",
      "shipping_methods"
    ],
    filters,
    pagination: {
      skip: offset,
      take: limit,
      order: {
        created_at: "DESC"
      }
    }
  })

  const mappedOrders = orders.map((o: any) => ({
    ...o,
    total: o.summary?.current_order_total ?? o.summary?.original_order_total ?? 0,
    shipping_method: o.shipping_methods?.[0]?.name ?? "-"
  }))

  return { orders: mappedOrders, count: queryMetadata.count, offset, limit }
}

/** Retrieve a single order by ID */
export async function getOrder(scope: any, id: string) {
  const orderService: IOrderModuleService = scope.resolve(Modules.ORDER)
  const order = await orderService.retrieveOrder(id, { relations: ["items", "shipping_address", "billing_address"] })
  return { order }
}

/**
 * Update order status. Maps custom Vietnamese states to Medusa standard states 
 * using metadata.custom_status. Handles inventory logic & shipping integrations.
 */
export async function updateOrderStatus(
  scope: any,
  orderId: string,
  newStatus: string, // pending, confirmed, preparing, shipping, delivered, completed, canceled
  shippingMethod?: string,
  adminName?: string
) {
  const orderService: IOrderModuleService = scope.resolve(Modules.ORDER)
  const inventoryService: IInventoryService = scope.resolve(Modules.INVENTORY)
  const query = scope.resolve("query")
  const db = scope.resolve("__pg_connection__")


  // Helper to adjust inventory of a variant
  const adjustVariantInventory = async (variantId: string, quantityChange: number) => {
    const { data: variants } = await query.graph({
      entity: "product_variant",
      fields: ["id", "inventory_items.inventory_item_id"],
      filters: { id: variantId }
    })
    const inventoryItemId = variants?.[0]?.inventory_items?.[0]?.inventory_item_id

    if (!inventoryItemId) {
      throw new Error(`Không tìm thấy mã kho (inventory_item_id) cho variant ${variantId}`)
    }

    const { data: levels } = await query.graph({
      entity: "inventory_level",
      fields: ["location_id"],
      filters: { inventory_item_id: inventoryItemId }
    })
    const locationId = levels?.[0]?.location_id

    if (!locationId) {
      throw new Error(`Không tìm thấy địa điểm kho (location_id) cho sản phẩm kho ${inventoryItemId}`)
    }

    await inventoryService.adjustInventory(inventoryItemId, locationId, quantityChange)
    console.log(`[updateOrderStatus] Adjusted inventory for variant ${variantId} (item: ${inventoryItemId}) at location ${locationId} by ${quantityChange}`)
  }

  // Load the order fresh
  const order = await orderService.retrieveOrder(orderId, { relations: ["items", "shipping_address"] })

  // Get current custom status
  const currentStatus = (order as any).metadata?.custom_status || (order as any).status || "pending"

  // Define allowed transitions according to T-95 / T-97 specification
  const ALLOWED_TRANSITIONS: Record<string, string[]> = {
    pending: ["confirmed", "canceled", "completed"],
    confirmed: ["preparing", "shipping", "canceled", "completed"],
    preparing: ["shipping", "canceled", "completed"],
    shipping: ["delivered", "completed", "canceled"],
    delivered: ["completed", "canceled"],
    completed: [],
    canceled: []
  }

  // Check and block invalid status transitions (chống nhảy cóc trạng thái)
  if (currentStatus !== newStatus) {
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || []
    if (!allowed.includes(newStatus)) {
      throw new Error(
        `Không thể chuyển trạng thái từ '${currentStatus}' sang '${newStatus}'. Chuyển trạng thái nhảy cóc là trái quy tắc (T-95/T-97).`
      )
    }
  }

  // Capture COD payment if status transitions to delivered or completed
  if (newStatus === "delivered" || newStatus === "completed") {
    const paymentMethod = (order as any).metadata?.payment_method;
    if (paymentMethod === "cod") {
      const paycolRes = await db.raw(`
        SELECT pc.id, pc.amount, pc.status FROM payment_collection pc
        JOIN order_payment_collection opc ON pc.id = opc.payment_collection_id
        WHERE opc.order_id = ?
      `, [orderId]);

      const paycol = paycolRes.rows[0];
      if (paycol && paycol.status !== 'completed') {
        const existingPaymentRes = await db.raw(`
          SELECT id FROM payment WHERE payment_collection_id = ? LIMIT 1
        `, [paycol.id]);

        if (existingPaymentRes.rows.length === 0) {
          const generateMedusaId = (prefix: string) => {
            const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            let result = "";
            for (let i = 0; i < 18; i++) {
              result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return `${prefix}_01${result}`;
          };

          const paymentSessionId = generateMedusaId('payses');
          const paymentId = generateMedusaId('pay');
          const trxId = generateMedusaId('ordtrx');
          const rawAmountStr = JSON.stringify({ value: paycol.amount.toString(), precision: 20 });

          // 1. Insert into payment_session
          await db.raw(`
            INSERT INTO payment_session (
              id, currency_code, amount, raw_amount, provider_id, 
              data, context, status, authorized_at, payment_collection_id, metadata, created_at, updated_at
            ) VALUES (?, 'vnd', ?, ?, 'cod', '{}', '{}', 'authorized', NOW(), ?, '{}', NOW(), NOW())
          `, [paymentSessionId, paycol.amount, rawAmountStr, paycol.id]);

          // 2. Insert into payment
          await db.raw(`
            INSERT INTO payment (
              id, amount, raw_amount, currency_code, provider_id, 
              created_at, updated_at, captured_at, payment_collection_id, payment_session_id, data, metadata
            ) VALUES (?, ?, ?, 'vnd', 'cod', NOW(), NOW(), NOW(), ?, ?, '{}', '{}')
          `, [paymentId, paycol.amount, rawAmountStr, paycol.id, paymentSessionId]);

          // 3. Insert into order_transaction
          await db.raw(`
            INSERT INTO order_transaction (
              id, order_id, version, amount, raw_amount, currency_code, 
              reference, reference_id, created_at, updated_at
            ) VALUES (?, ?, 1, ?, ?, 'vnd', 'capture', ?, NOW(), NOW())
          `, [trxId, orderId, paycol.amount, rawAmountStr, paymentId]);

          // 4. Update order_summary totals
          const summaryRes = await db.raw(`
            SELECT id, totals FROM order_summary WHERE order_id = ?
          `, [orderId]);
          
          if (summaryRes.rows.length > 0) {
            const summary = summaryRes.rows[0];
            const newTotals = {
              ...summary.totals,
              paid_total: Number(paycol.amount),
              raw_paid_total: { value: paycol.amount.toString(), precision: 20 },
              transaction_total: Number(paycol.amount),
              raw_transaction_total: { value: paycol.amount.toString(), precision: 20 },
              pending_difference: 0,
              raw_pending_difference: { value: '0', precision: 20 }
            };

            await db.raw(`
              UPDATE order_summary 
              SET totals = ?, updated_at = NOW() 
              WHERE id = ?
            `, [JSON.stringify(newTotals), summary.id]);
          }
        }

        const rawAmountStr = JSON.stringify({ value: paycol.amount.toString(), precision: 20 });
        
        await db.raw(`
          UPDATE payment_collection 
          SET status = 'completed',
              captured_amount = ?,
              raw_captured_amount = ?,
              authorized_amount = ?,
              raw_authorized_amount = ?,
              updated_at = NOW()
          WHERE id = ?
        `, [paycol.amount, rawAmountStr, paycol.amount, rawAmountStr, paycol.id]);

        console.log(`[updateOrderStatus] COD Payment captured and status updated to completed for order: ${orderId}`);
      }
    }
  }

  // Map to native Medusa status (pending by default)

  let medusaStatus: string = "pending"
  if (newStatus === "completed") medusaStatus = "completed"
  if (newStatus === "canceled") medusaStatus = "canceled"

  // Merge with existing metadata
  const existingMetadata = (order as any).metadata || {}
  const paymentMethod = existingMetadata.payment_method;
  const isCodAndReceived = paymentMethod === "cod" && (newStatus === "delivered" || newStatus === "completed");

  const metadata: Record<string, any> = {
    ...existingMetadata,
    custom_status: newStatus,
    ...(isCodAndReceived ? { payment_status: "paid" } : {})
  }

  // Save timestamps and actors in metadata
  if (newStatus === "confirmed") {
    metadata.confirmed_at = new Date().toISOString()
    metadata.confirmed_by = adminName || "System Admin"
  } else if (newStatus === "preparing") {
    metadata.preparing_at = new Date().toISOString()
    metadata.preparing_by = adminName || "System Admin"
  } else if (newStatus === "shipping") {
    metadata.shipped_at = new Date().toISOString()
    metadata.shipped_by = adminName || "System Admin"
  } else if (newStatus === "delivered") {
    metadata.delivered_at = new Date().toISOString()
    metadata.delivered_by = adminName || "System Admin"
  } else if (newStatus === "completed") {
    metadata.completed_at = new Date().toISOString()
    metadata.completed_by = adminName || "System Admin"
  } else if (newStatus === "canceled") {
    metadata.canceled_at = new Date().toISOString()
    metadata.canceled_by = adminName || "System Admin"
  }

  // Log the status change in the Admin timeline (Hoạt động) by inserting an order_change record
  if (currentStatus !== newStatus) {
    try {
      const db = scope.resolve("__pg_connection__")
      
      const generateMedusaId = (prefix: string) => {
        const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        let result = ""
        for (let i = 0; i < 11; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        const displayId = (order as any).display_id || 0
        const suffix = `ORD${String(displayId).padStart(4, '0')}`.toUpperCase().slice(-7)
        return `${prefix}_01${result}${suffix}`
      }

      const changeId = generateMedusaId("orch")
      const currentVersion = (order as any).version || 1

      let desc = `Đơn hàng chuyển sang trạng thái ${newStatus} bởi ${adminName || "System Admin"}`
      if (newStatus === "confirmed") {
        desc = `Đơn hàng đã được xác nhận bởi ${adminName || "System Admin"}`
      } else if (newStatus === "preparing") {
        desc = `Đơn hàng đang được đóng gói bởi ${adminName || "System Admin"}`
      } else if (newStatus === "shipping") {
        const providerName = shippingMethod ? shippingMethod.toUpperCase() : (metadata.shipping_provider ? metadata.shipping_provider.toUpperCase() : "đối tác vận chuyển")
        desc = `Đơn hàng đã giao cho đơn vị vận chuyển ${providerName} bởi ${adminName || "System Admin"}`
      } else if (newStatus === "delivered") {
        desc = `Đơn hàng được xác nhận đã giao thành công bởi ${adminName || "System Admin"}`
      } else if (newStatus === "completed") {
        desc = `Đơn hàng đã hoàn thành bởi ${adminName || "System Admin"}`
      } else if (newStatus === "canceled") {
        desc = `Đơn hàng đã bị hủy bởi ${adminName || "System Admin"}`
      }

      await db.raw(`
        INSERT INTO order_change (
          id, order_id, version, description, status, change_type, created_by, requested_at, confirmed_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW(), NOW())
      `, [
        changeId,
        orderId,
        currentVersion,
        desc,
        "confirmed",
        "edit",
        adminName || "System Admin"
      ])
    } catch (err: any) {
      console.error("[updateOrderStatus] Failed to log order change in timeline:", err.message)
    }
  }

  // Sync with native Medusa fulfillment tables to update native status badges
  try {
    const db = scope.resolve("__pg_connection__")
    
    // Generate Medusa style IDs
    const generateMedusaId = (prefix: string) => {
      const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      let result = ""
      for (let i = 0; i < 18; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return `${prefix}_01${result}`
    }

    // Check if there is already a fulfillment for this order
    const existingFulRes = await db.raw(`
      SELECT f.id FROM fulfillment f
      JOIN order_fulfillment of ON of.fulfillment_id = f.id
      WHERE of.order_id = ? AND f.deleted_at IS NULL
      LIMIT 1
    `, [orderId])

    const existingFulfillment = existingFulRes.rows[0]

    if (newStatus === "preparing") {
      if (!existingFulfillment) {
        const fulId = generateMedusaId("ful")
        const ordfulId = generateMedusaId("ordful")
        
        // Insert fulfillment
        await db.raw(`
          INSERT INTO fulfillment (
            id, location_id, packed_at, shipped_at, delivered_at, data, provider_id, shipping_option_id, requires_shipping, created_at, updated_at
          ) VALUES (?, ?, NOW(), null, null, '{}', 'ghn_ghn', 'so_01KZTAE023MBYEW8XY38K1G8RC', true, NOW(), NOW())
        `, [fulId, "sloc_01KYA9MHTRQ63VN0K86QHP37AN"])

        // Link to order
        await db.raw(`
          INSERT INTO order_fulfillment (
            id, order_id, fulfillment_id, created_at, updated_at
          ) VALUES (?, ?, ?, NOW(), NOW())
        `, [ordfulId, orderId, fulId])

        // Add items to fulfillment_item
        for (const item of (order as any).items || []) {
          const fulItemId = generateMedusaId("fulit")
          await db.raw(`
            INSERT INTO fulfillment_item (
              id, title, sku, barcode, quantity, raw_quantity, line_item_id, inventory_item_id, fulfillment_id, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          `, [
            fulItemId,
            item.title || "",
            item.sku || "",
            item.barcode || "",
            Number(item.quantity || 1),
            JSON.stringify({ value: String(item.quantity || 1), precision: 20 }),
            item.id,
            item.variant_id || "",
            fulId
          ])
        }
      }

      // Update order_item quantities for fulfillment
      await db.raw(`
        UPDATE order_item 
        SET 
          fulfilled_quantity = quantity,
          raw_fulfilled_quantity = raw_quantity,
          updated_at = NOW()
        WHERE order_id = ?
      `, [orderId])

    } else if (newStatus === "shipping") {
      if (existingFulfillment) {
        await db.raw(`
          UPDATE fulfillment 
          SET shipped_at = NOW(), updated_at = NOW() 
          WHERE id = ?
        `, [existingFulfillment.id])
      } else {
        const fulId = generateMedusaId("ful")
        const ordfulId = generateMedusaId("ordful")
        
        await db.raw(`
          INSERT INTO fulfillment (
            id, location_id, packed_at, shipped_at, delivered_at, data, provider_id, shipping_option_id, requires_shipping, created_at, updated_at
          ) VALUES (?, ?, NOW(), NOW(), null, '{}', 'ghn_ghn', 'so_01KZTAE023MBYEW8XY38K1G8RC', true, NOW(), NOW())
        `, [fulId, "sloc_01KYA9MHTRQ63VN0K86QHP37AN"])

        await db.raw(`
          INSERT INTO order_fulfillment (
            id, order_id, fulfillment_id, created_at, updated_at
          ) VALUES (?, ?, ?, NOW(), NOW())
        `, [ordfulId, orderId, fulId])

        for (const item of (order as any).items || []) {
          const fulItemId = generateMedusaId("fulit")
          await db.raw(`
            INSERT INTO fulfillment_item (
              id, title, sku, barcode, quantity, raw_quantity, line_item_id, inventory_item_id, fulfillment_id, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          `, [
            fulItemId,
            item.title || "",
            item.sku || "",
            item.barcode || "",
            Number(item.quantity || 1),
            JSON.stringify({ value: String(item.quantity || 1), precision: 20 }),
            item.id,
            item.variant_id || "",
            fulId
          ])
        }
      }

      // Update order_item quantities for shipping
      await db.raw(`
        UPDATE order_item 
        SET 
          fulfilled_quantity = quantity,
          raw_fulfilled_quantity = raw_quantity,
          shipped_quantity = quantity,
          raw_shipped_quantity = raw_quantity,
          updated_at = NOW()
        WHERE order_id = ?
      `, [orderId])

    } else if (newStatus === "delivered" || newStatus === "completed") {
      if (existingFulfillment) {
        await db.raw(`
          UPDATE fulfillment 
          SET shipped_at = COALESCE(shipped_at, NOW()), delivered_at = NOW(), updated_at = NOW() 
          WHERE id = ?
        `, [existingFulfillment.id])
      } else {
        const fulId = generateMedusaId("ful")
        const ordfulId = generateMedusaId("ordful")
        
        await db.raw(`
          INSERT INTO fulfillment (
            id, location_id, packed_at, shipped_at, delivered_at, data, provider_id, shipping_option_id, requires_shipping, created_at, updated_at
          ) VALUES (?, ?, NOW(), NOW(), NOW(), '{}', 'ghn_ghn', 'so_01KZTAE023MBYEW8XY38K1G8RC', true, NOW(), NOW())
        `, [fulId, "sloc_01KYA9MHTRQ63VN0K86QHP37AN"])

        await db.raw(`
          INSERT INTO order_fulfillment (
            id, order_id, fulfillment_id, created_at, updated_at
          ) VALUES (?, ?, ?, NOW(), NOW())
        `, [ordfulId, orderId, fulId])

        for (const item of (order as any).items || []) {
          const fulItemId = generateMedusaId("fulit")
          await db.raw(`
            INSERT INTO fulfillment_item (
              id, title, sku, barcode, quantity, raw_quantity, line_item_id, inventory_item_id, fulfillment_id, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          `, [
            fulItemId,
            item.title || "",
            item.sku || "",
            item.barcode || "",
            Number(item.quantity || 1),
            JSON.stringify({ value: String(item.quantity || 1), precision: 20 }),
            item.id,
            item.variant_id || "",
            fulId
          ])
        }
      }

      // Update order_item quantities for delivery
      await db.raw(`
        UPDATE order_item 
        SET 
          fulfilled_quantity = quantity,
          raw_fulfilled_quantity = raw_quantity,
          shipped_quantity = quantity,
          raw_shipped_quantity = raw_quantity,
          delivered_quantity = quantity,
          raw_delivered_quantity = raw_quantity,
          updated_at = NOW()
        WHERE order_id = ?
      `, [orderId])

    } else if (newStatus === "canceled") {
      if (existingFulfillment) {
        await db.raw(`
          UPDATE fulfillment 
          SET canceled_at = NOW(), updated_at = NOW() 
          WHERE id = ?
        `, [existingFulfillment.id])
      }

      // Restore inventory_level for canceled order
      for (const item of (order as any).items || []) {
        if (item.variant_id) {
          try {
            await db.raw(`
              UPDATE inventory_level il
              SET stocked_quantity = il.stocked_quantity + ?,
                  updated_at = NOW()
              FROM product_variant_inventory_item pvii
              WHERE pvii.inventory_item_id = il.inventory_item_id
                AND pvii.variant_id = ?
            `, [Number(item.quantity || 1), item.variant_id]);
            console.log(`[updateOrderStatus] Restored ${item.quantity} to inventory_level for canceled variant ${item.variant_id}`);
          } catch (invErr: any) {
            console.error(`[updateOrderStatus] Error restoring inventory for variant ${item.variant_id}:`, invErr.message);
          }
        }
      }

      // Reset order_item quantities
      await db.raw(`
        UPDATE order_item 
        SET 
          fulfilled_quantity = 0,
          raw_fulfilled_quantity = '{"value": "0", "precision": 20}'::jsonb,
          shipped_quantity = 0,
          raw_shipped_quantity = '{"value": "0", "precision": 20}'::jsonb,
          delivered_quantity = 0,
          raw_delivered_quantity = '{"value": "0", "precision": 20}'::jsonb,
          updated_at = NOW()
        WHERE order_id = ?
      `, [orderId])
    }
  } catch (err: any) {
    console.error("[updateOrderStatus] Failed to sync with native Medusa fulfillment tables:", err.message)
  }

  // If status is delivered, update delivered_at and send email notification
  if (newStatus === "delivered") {
    metadata.delivered_at = new Date().toISOString()

    try {
      const apiKey = process.env.RESEND_API_KEY
      if (apiKey) {
        const resend = new Resend(apiKey)

        const customerName = (order as any).metadata?.full_name || 
          [(order as any).shipping_address?.first_name, (order as any).shipping_address?.last_name].filter(Boolean).join(" ") || 
          "Khách Hàng"

        const customerEmail = (order as any).email

        if (customerEmail) {
          const fromEmail = process.env.RESEND_FROM_EMAIL || 'Sprylo <onboarding@resend.dev>'

          const itemsHtml = ((order as any).items || []).map((item: any) => `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                <div style="font-weight: 600; color: #0f172a;">${item.title}</div>
                <div style="font-size: 0.8rem; color: #64748b;">Số lượng: ${item.quantity}</div>
              </td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 600; color: #0f172a;">
                ${Number(item.unit_price * item.quantity).toLocaleString("vi-VN")} ₫
              </td>
            </tr>
          `).join("")

          const shippingFee = Number((order as any).metadata?.shipping_fee || 0)
          const itemsTotal = ((order as any).items || []).reduce((acc: number, item: any) => acc + (item.unit_price * item.quantity), 0)
          const totalAmount = itemsTotal + shippingFee

          const emailHtml = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Đơn hàng đã giao thành công - Sprylo</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.10);">
          <tr>
            <td style="background:linear-gradient(135deg,#10B981,#059669);padding:36px 40px;text-align:center;">
              <div style="font-size:2rem;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">Sprylo</div>
              <div style="color:rgba(255,255,255,0.9);font-size:1.1rem;margin-top:8px;font-weight: 600;">Giao hàng thành công 🎉</div>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h1 style="font-size:1.3rem;font-weight:700;color:#0f172a;margin:0 0 8px;">
                Cảm ơn bạn đã mua sắm tại Sprylo, ${customerName}!
              </h1>
              <p style="color:#475569;font-size:0.95rem;line-height:1.6;margin:0 0 24px;">
                Đơn hàng <strong>#${(order as any).display_id || order.id}</strong> của bạn đã được giao thành công vào lúc <strong>${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</strong>.
              </p>
              <h3 style="font-size:1rem;font-weight:700;color:#0f172a;margin:24px 0 12px;border-bottom:2px solid #f1f5f9;padding-bottom:8px;">Chi tiết đơn hàng</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                ${itemsHtml}
                <tr>
                  <td style="padding: 12px 0 4px; color: #64748b;">Tạm tính:</td>
                  <td style="padding: 12px 0 4px; text-align: right; color: #0f172a;">${itemsTotal.toLocaleString("vi-VN")} ₫</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Phí vận chuyển:</td>
                  <td style="padding: 4px 0; text-align: right; color: #0f172a;">${shippingFee.toLocaleString("vi-VN")} ₫</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; font-weight: 700; color: #0f172a; border-top: 1px solid #e2e8f0; font-size: 1.1rem;">Tổng thanh toán:</td>
                  <td style="padding: 12px 0; text-align: right; font-weight: 700; color: #10B981; border-top: 1px solid #e2e8f0; font-size: 1.1rem;">${totalAmount.toLocaleString("vi-VN")} ₫</td>
                </tr>
              </table>
              <div style="background:#f8fafc;border-radius:12px;padding:20px;margin-top:24px;border:1px solid #e2e8f0;">
                <h4 style="margin:0 0 8px;color:#0f172a;font-size:0.9rem;font-weight:700;">Địa chỉ nhận hàng:</h4>
                <p style="margin:0;font-size:0.875rem;color:#475569;line-height:1.5;">
                  <strong>${customerName}</strong><br/>
                  SĐT: ${(order as any).metadata?.phone || (order as any).shipping_address?.phone || ""}<br/>
                  Địa chỉ: ${(order as any).metadata?.address || (order as any).shipping_address?.address_1 || ""}
                </p>
              </div>
              <div style="text-align:center;margin:32px 0;">
                <a href="${process.env.STORE_FRONTEND_URL || 'http://localhost:5173'}/account"
                   style="display:inline-block;background:linear-gradient(135deg,#10B981,#059669);color:#ffffff;font-weight:600;font-size:0.95rem;text-decoration:none;padding:14px 36px;border-radius:999px;">
                  Xem chi tiết đơn hàng
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#f1f5f9;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:0.8rem;color:#94a3b8;">
                © 2026 Sprylo. Mọi thắc mắc liên hệ 
                <a href="mailto:s upport@sprylo.vn" style="color:#10B981;">sprylo123@gmail.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
          `

          const { data: resData, error } = await resend.emails.send({
            from: fromEmail,
            to: customerEmail,
            subject: `🎉 Đơn hàng #${(order as any).display_id || order.id} đã được giao thành công!`,
            html: emailHtml,
          })

          if (error) {
            console.error('[updateOrderStatus] Resend error:', error)
          } else {
            console.log(`[updateOrderStatus] Email đã gửi tới ${customerEmail} — ID: ${resData?.id}`)
          }
        } else {
          console.warn('[updateOrderStatus] Không tìm thấy email của customer để gửi thông báo.')
        }
      } else {
        console.warn('[updateOrderStatus] RESEND_API_KEY chưa được cấu hình — bỏ qua gửi email thông báo giao hàng.')
      }
    } catch (err: any) {
      console.error('[updateOrderStatus] Lỗi khi gửi email thông báo giao hàng:', err)
    }
  }

  // Update base status and metadata
  await orderService.updateOrders(orderId, { 
    status: medusaStatus as any, 
    metadata 
  })

  // 1. Process Inventory and Shipping when transitioning to "shipping" (or "preparing")
  // For safety, we track inventory_deducted flag in metadata to prevent double deductions.
  if (newStatus === "shipping" || newStatus === "preparing") {
    // Inventory decrement
    if (!existingMetadata.inventory_deducted) {
      for (const item of (order as any).items || []) {
        if (item.variant_id) {
          await adjustVariantInventory(item.variant_id, -item.quantity)
        }
      }
      metadata.inventory_deducted = true
      await orderService.updateOrders(orderId, { metadata })
    }

      // Shipping integration (GHN / GHTK) - Only trigger if requested and not yet created
      if (newStatus === "shipping" && shippingMethod && !existingMetadata.tracking_number) {
        let shippingResult: any = null
        if (shippingMethod.toLowerCase() === "ghn") {
          shippingResult = await createGhnShipping(order)
        } else if (shippingMethod.toLowerCase() === "ghtk") {
          shippingResult = await createGhtkShipping(order)
        }

        if (shippingResult) {
          metadata.shipping_provider = shippingMethod.toLowerCase()
          metadata.shipping_order_id = shippingResult.orderId
          metadata.tracking_number = shippingResult.trackingNumber
          metadata.shipping_fee = shippingResult.fee
          
          await orderService.updateOrders(orderId, { metadata })
        }
      }
  }

  // 2. Process Cancellation (Restock inventory if already deducted)
  if (newStatus === "canceled") {
    if (existingMetadata.inventory_deducted) {
      for (const item of (order as any).items || []) {
        if (item.variant_id) {
          await adjustVariantInventory(item.variant_id, item.quantity)
        }
      }
      metadata.inventory_deducted = false
      await orderService.updateOrders(orderId, { metadata })
    }
  }

  // Return the freshly updated order
  const updated = await orderService.retrieveOrder(orderId, { relations: ["items"] })
  return { order: updated }
}
