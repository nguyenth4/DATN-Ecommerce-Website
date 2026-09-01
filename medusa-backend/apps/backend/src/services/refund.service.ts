import { Logger } from '@medusajs/types';
import { MedusaContainer } from '@medusajs/framework';
import { vnpayRefund } from '../utils/vnpayRefund';
import { zalopayRefund } from '../utils/zalopayRefund';

/**
 * Service to process a refund for an order.
 * Supports ZaloPay and VNPay providers based on order.metadata.payment_method.
 * Implements idempotency: if the order already has a refund_id in metadata, it returns the existing info.
 */
export async function refundOrder(
  container: MedusaContainer,
  order: any,
  amount?: number,
  reason?: string
): Promise<{ refundId: string; refundedAmount: number; method: string }> {
  const logger: Logger = container.resolve('logger');

  // Check for existing refund to avoid duplicate calls
  if (order.metadata?.refund_id) {
    logger.info(
      `Refund already processed for order ${order.id}, refund_id=${order.metadata.refund_id}`
    );
    return {
      refundId: order.metadata.refund_id,
      refundedAmount: order.metadata.refund_amount ?? 0,
      method: order.metadata.refund_method ?? 'unknown',
    };
  }

  const paymentMethod: string = order.metadata?.payment_method;
  if (!paymentMethod) {
    throw new Error('Payment method not found in order metadata');
  }

  const refundAmount = amount ?? order.summary?.paid_total ?? 0; // use paid_total for Medusa v2

  let refundId: string;
  try {
    if (paymentMethod === 'zalopay') {
      refundId = await zalopayRefund(order, refundAmount);
    } else if (paymentMethod === 'vnpay') {
      refundId = await vnpayRefund(order, refundAmount);
    } else {
      // For COD or manual bank transfers, the admin handles the actual money transfer manually
      refundId = `manual_refund_${Date.now()}`;
    }
  } catch (e) {
    logger.error(`Refund failed for order ${order.id}: ${e}`);
    throw e;
  }

  // Update order metadata with refund details (calling order service is handled by caller)
  return {
    refundId,
    refundedAmount: refundAmount,
    method: paymentMethod,
  };
}
