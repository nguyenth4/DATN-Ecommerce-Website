import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import WalletModuleService from "../modules/wallet/service"
import { WALLET_MODULE } from "../modules/wallet"

// Số phút tối đa cho phép một đơn VNPAY chưa thanh toán tồn tại trước khi bị tự động hủy.
// Có thể override bằng biến môi trường ORDER_UNPAID_CANCEL_MINUTES.
const UNPAID_TIMEOUT_MINUTES = Number(process.env.ORDER_UNPAID_CANCEL_MINUTES || 30)

/**
 * Scheduled job: tự động hủy các đơn hàng thanh toán qua VNPAY nhưng chưa thanh toán
 * (payment_collection.status = 'not_paid') sau khi tạo quá UNPAY_TIMEOUT_MINUTES phút.
 *
 * Lý do: khi khách đặt hàng và chọn VNPAY, đơn hàng được tạo ngay lập tức trong Medusa
 * (kèm payment_collection status 'not_paid'), trước khi khách hoàn tất thanh toán trên
 * trang VNPAY. Nếu khách thoát/hủy giữa đường, đơn hàng "ma" này sẽ tồn đọng vô thời hạn
 * trong hệ thống nếu không có job này.
 *
 * Chỉ áp dụng cho đơn thanh toán VNPAY (metadata.payment_method = 'vnpay').
 * Đơn COD không bị ảnh hưởng vì "chưa thanh toán" là trạng thái hợp lệ cho tới khi giao hàng.
 */
export default async function cancelUnpaidVnpayOrders(container: MedusaContainer) {
  const db = container.resolve("__pg_connection__")
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    const staleOrdersRes = await db.raw(
      `
      SELECT o.id, o.customer_id, o.metadata
      FROM "order" o
      JOIN order_payment_collection opc ON opc.order_id = o.id
      JOIN payment_collection pc ON pc.id = opc.payment_collection_id
      WHERE o.status != 'canceled'
        AND o.metadata->>'payment_method' = 'vnpay'
        AND pc.status = 'not_paid'
        AND o.created_at < NOW() - INTERVAL '1 minute' * ?
      `,
      [UNPAID_TIMEOUT_MINUTES]
    )

    const staleOrders = staleOrdersRes.rows as Array<{
      id: string
      customer_id: string | null
      metadata: Record<string, any> | null
    }>

    if (staleOrders.length === 0) {
      return
    }

    logger.info(
      `[cancel-unpaid-vnpay-orders] Tìm thấy ${staleOrders.length} đơn VNPAY quá hạn chưa thanh toán, tiến hành hủy.`
    )

    for (const order of staleOrders) {
      try {
        await db.raw(
          `
          UPDATE "order"
          SET status = 'canceled',
              canceled_at = NOW(),
              updated_at = NOW(),
              metadata = COALESCE(metadata, '{}'::jsonb) || '{"cancel_reason": "Tự động hủy do quá hạn thanh toán VNPAY"}'::jsonb
          WHERE id = ?
          `,
          [order.id]
        )

        // Hoàn tiền vào ví nếu đơn có sử dụng ví (thanh toán một phần bằng wallet + VNPAY)
        const metadata = order.metadata || {}
        const useWallet = metadata.use_wallet === "true"
        const walletDeducted = Number(metadata.wallet_deducted || 0)

        if (useWallet && walletDeducted > 0 && order.customer_id) {
          try {
            const walletService: WalletModuleService = container.resolve(WALLET_MODULE)
            await walletService.addBalance(
              order.customer_id,
              walletDeducted,
              "refund",
              `Hoàn tiền hủy đơn hàng quá hạn thanh toán VNPAY ${order.id}`,
              order.id
            )
          } catch (walletErr: any) {
            logger.error(
              `[cancel-unpaid-vnpay-orders] Hoàn tiền ví thất bại cho đơn ${order.id}: ${walletErr.message}`
            )
          }
        }

        logger.info(`[cancel-unpaid-vnpay-orders] Đã hủy đơn quá hạn: ${order.id}`)
      } catch (err: any) {
        logger.error(`[cancel-unpaid-vnpay-orders] Hủy đơn ${order.id} thất bại: ${err.message}`)
      }
    }
  } catch (err: any) {
    logger.error(`[cancel-unpaid-vnpay-orders] Job thất bại: ${err.message}`)
  }
}

export const config = {
  name: "cancel-unpaid-vnpay-orders",
  schedule: "*/5 * * * *", // Chạy mỗi 5 phút
}
