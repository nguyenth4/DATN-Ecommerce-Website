import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import crypto from "crypto"

export const AUTHENTICATE = false

// ─── Build ZALOPAY Payment URL (HMAC-SHA256) ──────────────────────────────────
async function buildZalopayUrl(
  orderId: string,
  amount: number, // VND
  orderInfo: string
): Promise<string | null> {
  const appId = parseInt(process.env.ZALOPAY_APP_ID || "2554")
  const key1 = process.env.ZALOPAY_KEY1 || "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn"
  const endpoint = process.env.ZALOPAY_ENDPOINT || "https://sb-openapi.zalopay.vn/v2/create"
  const redirectUrl = `${process.env.STORE_FRONTEND_URL || "http://localhost:5174"}/checkout/zalopay_return`
  const callbackUrl = `${process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"}/payment/zalopay/callback`

  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }))
  const pad = (n: number) => n.toString().padStart(2, "0")
  const dateStr = now.getFullYear().toString().slice(2) + pad(now.getMonth() + 1) + pad(now.getDate())
  const transID = Math.floor(Math.random() * 1_000_000)
  const appTransId = `${dateStr}_${transID}`
  const appTime = Date.now()

  const embedData = JSON.stringify({
    redirecturl: redirectUrl,
    medusa_order_id: orderId,
  })
  const items = JSON.stringify([])

  const dataStr = `${appId}|${appTransId}|DATN_User|${amount}|${appTime}|${embedData}|${items}`
  const mac = crypto.createHmac("sha256", key1).update(dataStr).digest("hex")

  const orderPayload: any = {
    app_id: appId,
    app_trans_id: appTransId,
    app_user: "DATN_User",
    app_time: appTime,
    item: items,
    embed_data: embedData,
    amount: amount,
    description: orderInfo.substring(0, 256),
    bank_code: "",
    mac: mac,
  }

  if (callbackUrl.includes("localhost")) {
    orderPayload.callback_url = "https://webhook.site/6fb55db0-945c-4e14-9b67-fdbe707b6abb"
  } else {
    orderPayload.callback_url = callbackUrl
  }

  try {
    console.log(`[Payment-Link ZaloPay] Creating order: app_trans_id=${appTransId}, orderId=${orderId}, amount=${amount}`)
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    })
    const result = (await response.json()) as any
    console.log("[Payment-Link ZaloPay API] Create order response:", result)
    if (result && result.return_code === 1 && result.order_url) {
      if (!(global as any).__zalopayOrders) {
        (global as any).__zalopayOrders = new Map()
      }
      (global as any).__zalopayOrders.set(appTransId, { medusaOrderId: orderId })
      return result.order_url
    }
    console.error("[Payment-Link ZaloPay API] Failed:", result?.return_message)
  } catch (err) {
    console.error("[Payment-Link ZaloPay API] Error creating order:", err)
  }

  return null
}

/**
 * POST /store/orders/:id/payment-link
 * Generates a new payment URL (ZaloPay/VNPay) for retrying payment on an existing order.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params
    const db = req.scope.resolve("__pg_connection__") as any

    if (!db) {
      return res.status(500).json({ error: "Database connection unavailable" })
    }

    // Fetch order details supporting both Medusa order ID (order_01...) and numeric display_id (e.g. 151)
    const isNumericId = /^\d+$/.test(id)
    const orderRes = isNumericId
      ? await db.raw(`SELECT id, display_id, metadata, status FROM "order" WHERE display_id = ?`, [parseInt(id)])
      : await db.raw(`SELECT id, display_id, metadata, status FROM "order" WHERE id = ?`, [id])

    if (!orderRes.rows.length) {
      return res.status(404).json({ error: "Không tìm thấy đơn hàng" })
    }

    const order = orderRes.rows[0]
    const orderId = order.id
    const metadata = order.metadata || {}

    if (order.status === "canceled" || metadata.custom_status === "canceled" || metadata.custom_status === "refunded") {
      return res.status(400).json({ error: "Đơn hàng này đã bị hủy hoặc hoàn tiền, không thể thanh toán lại." })
    }

    // Calculate total amount from order_summary or order_item
    let amountToPay = 0
    const summaryRes = await db.raw(`SELECT totals FROM order_summary WHERE order_id = ?`, [orderId])
    if (summaryRes.rows.length > 0 && summaryRes.rows[0].totals?.current_order_total) {
      amountToPay = Number(summaryRes.rows[0].totals.current_order_total)
    } else {
      const itemsRes = await db.raw(`SELECT unit_price, quantity FROM order_item WHERE order_id = ?`, [orderId])
      const itemsTotal = itemsRes.rows.reduce((sum: number, item: any) => sum + Number(item.unit_price) * Number(item.quantity), 0)
      const shippingFee = Number(metadata.shipping_fee || 35000)
      amountToPay = itemsTotal + shippingFee
    }

    if (amountToPay <= 0) {
      return res.status(400).json({ error: "Số tiền cần thanh toán không hợp lệ." })
    }

    const paymentMethod = (metadata.payment_method || "zalopay").toLowerCase()
    let paymentUrl: string | null = null

    if (paymentMethod === "vnpay") {
      try {
        const { VNPay } = require("vnpay")
        const vnpayHost = process.env.VNPAY_HOST || "https://sandbox.vnpayment.vn"
        const tmnCode = process.env.VNPAY_TMN_CODE || "VNPAY_TMN_CODE_PLACEHOLDER"
        const secureSecret = process.env.VNPAY_SECURE_SECRET || "VNPAY_SECURE_SECRET_PLACEHOLDER"
        const returnUrl = process.env.VNPAY_RETURN_URL || "http://localhost:5174/checkout/vnpay_return"

        const vnpay = new VNPay({
          vnpayHost,
          tmnCode,
          secureSecret,
          testMode: true,
        })

        const ipAddr = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1") as string

        paymentUrl = vnpay.buildPaymentUrl({
          vnp_Amount: amountToPay,
          vnp_IpAddr: ipAddr.split(",")[0],
          vnp_TxnRef: `${orderId}_${Date.now().toString().slice(-4)}`,
          vnp_OrderInfo: `Thanh toan lai don hang #${order.display_id || orderId}`,
          vnp_OrderType: "other",
          vnp_ReturnUrl: returnUrl,
        })
      } catch (err: any) {
        console.error("[Retry Payment VNPay Error]:", err.message)
      }
    } else {
      // Default to ZaloPay
      try {
        paymentUrl = await buildZalopayUrl(orderId, amountToPay, `Thanh toan lai don hang #${order.display_id || orderId}`)
      } catch (err: any) {
        console.error("[Retry Payment ZaloPay Error]:", err.message)
      }
    }

    if (!paymentUrl) {
      return res.status(500).json({ error: "Không thể tạo liên kết thanh toán. Vui lòng thử lại sau." })
    }

    return res.json({
      success: true,
      paymentUrl,
      orderId: orderId,
    })
  } catch (error: any) {
    console.error("[Payment-Link Route Error]:", error)
    return res.status(500).json({ error: error.message || "Lỗi tạo liên kết thanh toán." })
  }
}
