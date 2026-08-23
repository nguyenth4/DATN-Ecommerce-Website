import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import WalletModuleService from "../../../modules/wallet/service"
import { WALLET_MODULE } from "../../../modules/wallet"

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const { customer, items, paymentMethod, use_wallet, customer_id, address, shippingMethod, note, shippingFee } = req.body as any
    
    // Calculate subtotal from items
    const subtotal = items.reduce((acc: number, item: any) => acc + (item.price * item.qty), 0)
    // Total includes subtotal + shippingFee
    const total = subtotal + Number(shippingFee || 0)
    
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

    const db = req.scope.resolve("__pg_connection__")
    
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
    const nameParts = (customer?.fullName || "Khách Hàng").trim().split(" ")
    const firstName = nameParts.slice(0, -1).join(" ") || nameParts[0] || "Khách"
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "Hàng"

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
        wallet_deducted: walletDeducted.toString()
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

    return res.json({
      success: true,
      message: "Đặt hàng thành công",
      orderId: orderId,
      total_amount: total,
      wallet_deducted: walletDeducted,
      amount_to_pay: amountToPay,
      paymentMethod: amountToPay === 0 ? "wallet" : paymentMethod,
      // Return a dummy payment URL if VNPay/MoMo is selected and amount_to_pay > 0
      paymentUrl: (amountToPay > 0 && paymentMethod !== 'cod') ? "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?dummy" : null
    })
  } catch (error: any) {
    console.error("[Checkout API Error]:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "Đã xảy ra lỗi trong quá trình xử lý đơn hàng."
    })
  }
}
