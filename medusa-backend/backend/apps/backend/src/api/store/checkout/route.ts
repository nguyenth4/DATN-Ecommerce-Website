import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import WalletModuleService from "../../../modules/wallet/service"
import { WALLET_MODULE } from "../../../modules/wallet"
import crypto from "crypto"

// ─── Build ZALOPAY Payment URL (HMAC-SHA256) ──────────────────────────────────
async function buildZalopayUrl(
  orderId: string,
  amount: number, // VND
  orderInfo: string
): Promise<string> {
  const appId = parseInt(process.env.ZALOPAY_APP_ID || "2553");
  const key1 = process.env.ZALOPAY_KEY1 || "Pc94W2rvqAee8DhF2rBegigwkgho0AcZ";
  const endpoint = process.env.ZALOPAY_ENDPOINT || "https://sb-openapi.zalopay.vn/v2/create";
  const returnUrl = process.env.ZALOPAY_RETURN_URL || "http://localhost:9000/payment/zalopay/callback";

  // AppTransId format: YYMMDD_orderId (e.g. 260828_order_123456)
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const dateStr =
    now.getFullYear().toString().slice(2) +
    pad(now.getMonth() + 1) +
    pad(now.getDate());
  const cleanOrderRef = orderId.replace(/[^a-zA-Z0-9_]/g, '');
  const appTransId = `${dateStr}_${cleanOrderRef}`;

  const embedData = JSON.stringify({
    redirecturl: `${returnUrl}?apptransid=${appTransId}&amount=${amount}`,
  });
  const items = JSON.stringify([]);
  const appTime = Date.now();

  const data = `${appId}|${appTransId}|demo|${amount}|${appTime}|${embedData}|${items}`;
  const mac = crypto.createHmac("sha256", key1).update(data).digest("hex");

  const orderPayload = {
    app_id: appId,
    app_trans_id: appTransId,
    app_user: "demo",
    app_time: appTime,
    item: items,
    embed_data: embedData,
    amount: amount,
    description: orderInfo.substring(0, 255),
    bank_code: "",
    mac: mac,
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });
    const result = (await response.json()) as any;
    console.log("[ZaloPay API] Create order response:", result);
    if (result && result.return_code === 1 && result.order_url) {
      return result.order_url;
    }
  } catch (err) {
    console.error("[ZaloPay API] Error creating order:", err);
  }

  // Fallback direct redirect to callback URL if sandbox API call fails or for offline test
  return `${returnUrl}?apptransid=${appTransId}&status=1&amount=${amount}`;
}


export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const db = req.scope.resolve("__pg_connection__")
    const { customer, items, paymentMethod, use_wallet, customer_id, address, shippingMethod, note, shippingFee, promo_code } = req.body as any
    
    // Calculate subtotal from items
    const subtotal = items.reduce((acc: number, item: any) => acc + (item.price * item.qty), 0)

    // Calculate discount amount from promo_code if provided
    let discountAmount = 0
    let promotionId: string | null = null

    if (promo_code) {
      try {
        const promoRes = await db.raw(`
          SELECT p.*, am.id as app_method_id, am.type as app_method_type, am.value as app_method_value, am.allocation, am.max_quantity, am.currency_code
          FROM promotion p
          LEFT JOIN promotion_application_method am ON p.id = am.promotion_id
          WHERE UPPER(p.code) = UPPER(?) AND p.deleted_at IS NULL AND p.status = 'active'
        `, [promo_code.trim()])

        if (promoRes.rows.length > 0) {
          const promo = promoRes.rows[0]
          
          let isCampaignActive = true
          if (promo.campaign_id) {
            const campaignRes = await db.raw(`
              SELECT * FROM promotion_campaign WHERE id = ? AND deleted_at IS NULL
            `, [promo.campaign_id])
            if (campaignRes.rows.length > 0) {
              const campaign = campaignRes.rows[0]
              const now = new Date()
              if ((campaign.starts_at && new Date(campaign.starts_at) > now) || (campaign.ends_at && new Date(campaign.ends_at) < now)) {
                isCampaignActive = false
              }
            }
          }

          if (isCampaignActive) {
            promotionId = promo.id

            const rulesRes = await db.raw(`
              SELECT r.id, r.attribute, r.operator, rv.value as rule_value
              FROM application_method_target_rules amtr
              JOIN promotion_rule r ON amtr.promotion_rule_id = r.id
              JOIN promotion_rule_value rv ON r.id = rv.promotion_rule_id
              WHERE amtr.application_method_id = ? AND r.deleted_at IS NULL AND rv.deleted_at IS NULL
            `, [promo.app_method_id])
            const rules = rulesRes.rows

            const productIds = items.map((i: any) => i.productId).filter(Boolean)
            const productCollections: Record<string, string> = {}
            
            if (productIds.length > 0) {
              const prodRes = await db.raw(`
                SELECT id, collection_id FROM product WHERE id = ANY(?)
              `, [productIds])
              prodRes.rows.forEach((row: any) => {
                productCollections[row.id] = row.collection_id
              })
            }

            const eligibleItems = items.filter((item: any) => {
              if (rules.length === 0) return true
              return rules.every((rule: any) => {
                if (rule.attribute === 'items.product.collection_id') {
                  const itemCollectionId = productCollections[item.productId]
                  if (rule.operator === 'eq') {
                    return itemCollectionId === rule.rule_value
                  } else if (rule.operator === 'in') {
                    const allowedCollections = rule.rule_value.split(',').map((v: string) => v.trim())
                    return itemCollectionId && allowedCollections.includes(itemCollectionId)
                  }
                }
                return true
              })
            })

            if (eligibleItems.length > 0) {
              const totalEligiblePrice = eligibleItems.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0)

              if (promo.app_method_type === 'fixed') {
                const value = Number(promo.app_method_value)
                if (promo.allocation === 'each') {
                  let maxQtyToDiscount = promo.max_quantity || 999999
                  eligibleItems.forEach((item: any) => {
                    const qtyToDiscount = Math.min(item.qty, maxQtyToDiscount)
                    discountAmount += value * qtyToDiscount
                    maxQtyToDiscount -= qtyToDiscount
                  })
                } else {
                  discountAmount = Math.min(totalEligiblePrice, value)
                }
              } else if (promo.app_method_type === 'percentage') {
                const percentage = Number(promo.app_method_value)
                if (promo.allocation === 'each') {
                  let maxQtyToDiscount = promo.max_quantity || 999999
                  eligibleItems.forEach((item: any) => {
                    const qtyToDiscount = Math.min(item.qty, maxQtyToDiscount)
                    discountAmount += Math.round((item.price * qtyToDiscount) * (percentage / 100))
                    maxQtyToDiscount -= qtyToDiscount
                  })
                } else {
                  discountAmount = Math.round(totalEligiblePrice * (percentage / 100))
                }
              }
              discountAmount = Math.min(discountAmount, totalEligiblePrice)
            }
          }
        }
      } catch (err: any) {
        console.error("[Checkout Route] Error calculating discount:", err.message)
      }
    }

    // Total includes subtotal + shippingFee - discountAmount
    const total = Math.max(0, subtotal + Number(shippingFee || 0) - discountAmount)
    
    const walletService: WalletModuleService = req.scope.resolve(WALLET_MODULE)
    const customerId = customer_id || null
    
    let amountToPay = total
    let walletDeducted = 0

    if (use_wallet && customerId) {
      try {
        const wallet = await walletService.getWalletByCustomerId(customerId)
        const walletBalance = Number(wallet.balance)
        
        if (walletBalance >= total) {
          // Fully paid by wallet
          walletDeducted = total
          amountToPay = 0
        } else {
          // Partially paid by wallet
          walletDeducted = walletBalance
          amountToPay = total - walletBalance
        }

        if (walletDeducted > 0) {
          await walletService.deductBalance(customerId, walletDeducted, `Thanh toán cho đơn hàng ${Date.now()}`)
        }
      } catch (err: any) {
        console.warn("[Wallet Deduction Error during Checkout]:", err.message)
      }
    }

    // Get region and currency dynamically, prioritizing VND
    const regionRes = await db.raw(`
      SELECT id, currency_code FROM region ORDER BY (currency_code = 'vnd') DESC LIMIT 1
    `)
    const regionId = regionRes.rows[0]?.id || "reg_01KYA9N4JKMFPTANP6M0TKHR34"
    const currencyCode = regionRes.rows[0]?.currency_code || "vnd"

    // Resolve products and variants dynamically to populate all order line item columns
    const variantIds = items.map((item: any) => item.id).filter(Boolean)
    let dbItems: any[] = []
    if (variantIds.length > 0) {
      try {
        const variantDetailsRes = await db.raw(`
          SELECT 
            v.id AS variant_id,
            v.title AS variant_title,
            v.sku AS variant_sku,
            v.barcode AS variant_barcode,
            v.thumbnail AS variant_thumbnail,
            p.id AS product_id,
            p.title AS product_title,
            p.description AS product_description,
            p.subtitle AS product_subtitle,
            p.handle AS product_handle,
            p.is_giftcard AS product_is_giftcard,
            p.discountable AS product_is_discountable
          FROM product_variant v
          JOIN product p ON v.product_id = p.id
          WHERE v.id = ANY(?)
        `, [variantIds])
        dbItems = variantDetailsRes.rows
      } catch (err: any) {
        console.warn("[Checkout Route] Failed to fetch variant details:", err.message)
      }
    }

    // Resolve Order Module Service
    const orderService = req.scope.resolve(Modules.ORDER)

    // Parse customer name into first and last name
    const fullNameInput = (customer?.fullName || "").trim()
    const nameParts = (fullNameInput || "Khách Hàng").trim().split(" ")
    let firstName = nameParts.slice(0, -1).join(" ") || nameParts[0] || "Khách"
    let lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : (fullNameInput ? "" : "Hàng")

    if (customerId) {
      try {
        const customerProfileRes = await db.raw(`
          SELECT first_name, last_name FROM customer WHERE id = ?
        `, [customerId])
        if (customerProfileRes.rows.length > 0) {
          const profile = customerProfileRes.rows[0]
          if ((!firstName || firstName === "Khách") && profile.first_name) {
            firstName = profile.first_name
          }
          if ((!lastName || lastName === "Hàng" || lastName === "") && profile.last_name) {
            lastName = profile.last_name
          }
        }
      } catch (err: any) {
        console.warn("[Checkout Route] Failed to fetch customer profile details:", err.message)
      }
    }

    // Create order in Medusa
    const orderInput = {
      email: customer?.email || "guest@example.com",
      currency_code: currencyCode,
      region_id: regionId,
      customer_id: customerId,
      shipping_address: {
        first_name: firstName,
        last_name: lastName,
        address_1: address || "Địa chỉ mặc định",
        phone: customer?.phoneNumber || "0000000000",
        country_code: "vn"
      },
      items: items.map((item: any) => {
        const detail = dbItems.find((d: any) => d.variant_id === item.id)
        return {
          title: detail?.product_title || item.title || item.name,
          quantity: item.qty,
          unit_price: item.price,
          variant_id: item.id || null,
          product_id: detail?.product_id || null,
          product_title: detail?.product_title || null,
          product_description: detail?.product_description || null,
          product_subtitle: detail?.product_subtitle || null,
          product_handle: detail?.product_handle || null,
          variant_title: detail?.variant_title || null,
          variant_sku: detail?.variant_sku || null,
          variant_barcode: detail?.variant_barcode || null,
          requires_shipping: true,
          is_discountable: detail ? detail.product_is_discountable : true,
          is_giftcard: detail ? detail.product_is_giftcard : false,
          thumbnail: detail?.variant_thumbnail || item.img || null
        }
      }),
      metadata: {
        payment_method: amountToPay === 0 ? "wallet" : paymentMethod,
        shipping_method: shippingMethod || "default",
        shipping_fee: Number(shippingFee || 0).toString(),
        note: note || "",
        use_wallet: use_wallet ? "true" : "false",
        wallet_deducted: walletDeducted.toString(),
        full_name: customer?.fullName || `${firstName} ${lastName}`,
        phone: customer?.phoneNumber || "0000000000",
        address: address || "Địa chỉ mặc định",
        promo_code: promo_code || "",
        discount_amount: discountAmount.toString()
      }
    }

    const createdOrder = await orderService.createOrders(orderInput)
    const orderId = Array.isArray(createdOrder) ? createdOrder[0]?.id : (createdOrder as any)?.id

    // Create payment collection and order link to prevent Medusa Admin dashboard from crashing
    try {
      const generateMedusaId = (prefix: string) => {
        const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        let result = ""
        for (let i = 0; i < 18; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return `${prefix}_01${result}`
      }

      const paycolId = generateMedusaId("paycol")
      const orderPaycolId = generateMedusaId("orderpaycol")
      const isPaid = amountToPay === 0
      const paycolStatus = isPaid ? 'completed' : 'not_paid'
      const amountPaid = isPaid ? total : 0

      const rawAmount = { value: total.toString(), precision: 20 }
      const rawPaid = { value: amountPaid.toString(), precision: 20 }
      const rawZero = { value: '0', precision: 20 }

      await db.raw(`
        INSERT INTO payment_collection (
          id, currency_code, amount, raw_amount, 
          authorized_amount, raw_authorized_amount, 
          captured_amount, raw_captured_amount, 
          refunded_amount, raw_refunded_amount, 
          created_at, updated_at, status, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?)
      `, [
        paycolId, currencyCode, total, JSON.stringify(rawAmount),
        amountPaid, JSON.stringify(rawPaid), amountPaid, JSON.stringify(rawPaid),
        0, JSON.stringify(rawZero), paycolStatus, JSON.stringify({ order_id: orderId })
      ])

      await db.raw(`
        INSERT INTO order_payment_collection (id, order_id, payment_collection_id, created_at, updated_at)
        VALUES (?, ?, ?, NOW(), NOW())
      `, [orderPaycolId, orderId, paycolId])

      if (isPaid) {
        try {
          const paymentSessionId = generateMedusaId("payses")
          const paymentId = generateMedusaId("pay")
          const trxId = generateMedusaId("ordtrx")

          // 1. Insert into payment_session
          await db.raw(`
            INSERT INTO payment_session (
              id, currency_code, amount, raw_amount, provider_id, 
              data, context, status, authorized_at, payment_collection_id, metadata, created_at, updated_at
            ) VALUES (?, ?, ?, ?, 'wallet', '{}', '{}', 'authorized', NOW(), ?, '{}', NOW(), NOW())
          `, [paymentSessionId, currencyCode, total, JSON.stringify(rawAmount), paycolId])

          // 2. Insert into payment
          await db.raw(`
            INSERT INTO payment (
              id, amount, raw_amount, currency_code, provider_id, 
              created_at, updated_at, captured_at, payment_collection_id, payment_session_id, data, metadata
            ) VALUES (?, ?, ?, ?, 'wallet', NOW(), NOW(), NOW(), ?, ?, '{}', '{}')
          `, [paymentId, total, JSON.stringify(rawAmount), currencyCode, paycolId, paymentSessionId])

          // 3. Insert into order_transaction
          await db.raw(`
            INSERT INTO order_transaction (
              id, order_id, version, amount, raw_amount, currency_code, 
              reference, reference_id, created_at, updated_at
            ) VALUES (?, ?, 1, ?, ?, ?, 'capture', ?, NOW(), NOW())
          `, [trxId, orderId, total, JSON.stringify(rawAmount), currencyCode, paymentId])

          // 4. Update order_summary totals
          const summaryRes = await db.raw(`
            SELECT id, totals FROM order_summary WHERE order_id = ?
          `, [orderId])
          
          if (summaryRes.rows.length > 0) {
            const summary = summaryRes.rows[0]
            const newTotals = {
              ...summary.totals,
              paid_total: Number(total),
              raw_paid_total: { value: total.toString(), precision: 20 },
              transaction_total: Number(total),
              raw_transaction_total: { value: total.toString(), precision: 20 },
              pending_difference: 0,
              raw_pending_difference: { value: '0', precision: 20 }
            }

            await db.raw(`
              UPDATE order_summary 
              SET totals = ?, updated_at = NOW() 
              WHERE id = ?
            `, [JSON.stringify(newTotals), summary.id])
          }
        } catch (walletPayErr: any) {
          console.error("[Checkout Route] Failed to register wallet payment tables:", walletPayErr.message)
        }
      }

      // Insert shipping method linkage for Medusa Order summary
      try {
        let shippingOptionId = "so_01KYA9MNRG9S275XFKTP7QPQ7T" // Default Standard
        const methodLower = (shippingMethod || "default").toLowerCase()
        if (methodLower === 'ghn') {
          shippingOptionId = "so_01KZTAE023MBYEW8XY38K1G8RC"
        } else if (methodLower === 'express') {
          shippingOptionId = "so_01KYA9MNRJGMYBARVJ9Y7G65Z4"
        }

        const shippingMethodName = methodLower === 'ghn'
          ? 'Giao hàng nhanh (GHN)'
          : (methodLower === 'ghtk' ? 'Giao hàng tiết kiệm (GHTK)' : 'Tiêu chuẩn')

        const shippingMethodId = generateMedusaId("ordshipmeth")
        const orderShippingId = generateMedusaId("ordship")
        const rawShipAmount = { value: Number(shippingFee || 0).toString(), precision: 20 }

        await db.raw(`
          INSERT INTO order_shipping_method (
            id, name, amount, raw_amount, is_tax_inclusive, shipping_option_id, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          shippingMethodId, shippingMethodName, Number(shippingFee || 0), JSON.stringify(rawShipAmount), false, shippingOptionId
        ])

        await db.raw(`
          INSERT INTO order_shipping (
            id, order_id, version, shipping_method_id, created_at, updated_at
          ) VALUES (?, ?, 1, ?, NOW(), NOW())
        `, [
          orderShippingId, orderId, shippingMethodId
        ])
      } catch (shipErr: any) {
        console.error("[Checkout Route] Failed to link order and shipping method:", shipErr.message)
      }
    } catch (err: any) {
      console.error("[Checkout Route] Failed to link order and payment collection:", err.message)
    }

    // Link promotion to the order if applied and update summary
    if (promotionId && orderId) {
      try {
        const generateMedusaIdLocal = (prefix: string) => {
          const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
          let result = ""
          for (let i = 0; i < 18; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
          }
          return `${prefix}_01${result}`
        }

        const ordPromoId = generateMedusaIdLocal("ordpromo")
        await db.raw(`
          INSERT INTO order_promotion (id, order_id, promotion_id, created_at, updated_at)
          VALUES (?, ?, ?, NOW(), NOW())
        `, [ordPromoId, orderId, promotionId])

        // Increment promotion used count
        await db.raw(`
          UPDATE promotion SET used = used + 1 WHERE id = ?
        `, [promotionId])

        // Adjust order_summary totals
        const summaryRes = await db.raw(`
          SELECT id, totals FROM order_summary WHERE order_id = ?
        `, [orderId])
        
        if (summaryRes.rows.length > 0) {
          const summary = summaryRes.rows[0]
          const adjustedTotals = {
            ...summary.totals,
            current_order_total: Number(total),
            raw_current_order_total: { value: total.toString(), precision: 20 },
            accounting_total: Number(total),
            raw_accounting_total: { value: total.toString(), precision: 20 },
            pending_difference: Number(total) - Number(summary.totals.paid_total || 0),
            raw_pending_difference: { value: (Number(total) - Number(summary.totals.paid_total || 0)).toString(), precision: 20 }
          }

          await db.raw(`
            UPDATE order_summary 
            SET totals = ?, updated_at = NOW() 
            WHERE id = ?
          `, [JSON.stringify(adjustedTotals), summary.id])
        }
      } catch (promoErr: any) {
        console.error("[Checkout Route] Failed to link order and promotion:", promoErr.message)
      }
    }

    // Generate Payment Gateway URLs
    let paymentUrl: string | null = null
    if (amountToPay > 0) {
      if (paymentMethod === 'vnpay') {
        try {
          const { VNPay } = require('vnpay')
          const vnpayHost = process.env.VNPAY_HOST || 'https://sandbox.vnpayment.vn'
          const tmnCode = process.env.VNPAY_TMN_CODE || 'VNPAY_TMN_CODE_PLACEHOLDER'
          const secureSecret = process.env.VNPAY_SECURE_SECRET || 'VNPAY_SECURE_SECRET_PLACEHOLDER'
          const returnUrl = process.env.VNPAY_RETURN_URL || 'http://localhost:5174/checkout/vnpay_return'
          // IPN URL: VNPAY gọi server-to-server để xác nhận giao dịch
          const ipnUrl = process.env.VNPAY_IPN_URL || 'http://localhost:9000/store/payment/vnpay/ipn'

          const vnpay = new VNPay({
            vnpayHost,
            tmnCode,
            secureSecret,
            testMode: true
          })

          const ipAddr = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1') as string
          // VNPAY SDK auto-multiplies amount by 100, so we just pass the original amount
          const vnpAmount = amountToPay

          paymentUrl = vnpay.buildPaymentUrl({
            vnp_Amount: vnpAmount,
            vnp_IpAddr: ipAddr.split(',')[0],
            vnp_TxnRef: orderId,
            vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
            vnp_OrderType: 'other',
            vnp_ReturnUrl: returnUrl,
          })

          console.log(`[Checkout] ✅ VNPAY URL built for order ${orderId}, amount: ${vnpAmount}, IPN: ${ipnUrl}`)
        } catch (err: any) {
          console.error("[VNPay Checkout Error]:", err.message)
        }
      } else if (paymentMethod === 'zalopay') {
        try {
          paymentUrl = await buildZalopayUrl(orderId, amountToPay, `Thanh toan don hang ${orderId}`)
          console.log(`[Checkout] ✅ ZaloPay URL built for order ${orderId}, amount: ${amountToPay}`)
        } catch (err: any) {
          console.error("[ZaloPay Checkout Error]:", err.message)
        }
      }
    }

    return res.json({
      success: true,
      message: "Đặt hàng thành công",
      orderId: orderId,
      total_amount: total,
      wallet_deducted: walletDeducted,
      amount_to_pay: amountToPay,
      paymentMethod: amountToPay === 0 ? "wallet" : paymentMethod,
      paymentUrl: paymentUrl || ((amountToPay > 0 && paymentMethod !== 'cod' && paymentMethod !== 'vnpay' && paymentMethod !== 'zalopay') ? "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?dummy" : null)
    })
  } catch (error: any) {
    console.error("[Checkout API Error]:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "Đã xảy ra lỗi trong quá trình xử lý đơn hàng."
    })
  }
}
