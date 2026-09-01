import { Request, Response } from 'express';
import { MedusaError, Modules } from '@medusajs/framework/utils';
import { refundOrder } from '../../../../../services/refund.service';
type RefundRequest = {
  payment_method: 'zalopay' | 'vnpay';
  amount?: number; // In smallest currency unit (e.g., VND)
};

/**
 * POST /admin/orders/:id/refund
 * Admin only endpoint to initiate a refund for a paid order.
 */
export const POST = async (req: Request, res: Response) => {
  const { id } = req.params;
  // Medusa automatically protects /admin routes with admin auth middleware

  const payload = req.body as RefundRequest;
  if (!payload.payment_method) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, 'payment_method is required');
  }

  const orderService = req.scope.resolve(Modules.ORDER);
  const order = await orderService.retrieveOrder(id, { relations: ['metadata'] });

  // In Medusa v2, payment_status is on the payment_collection, so we just check if we have a payment method
  if (!order.metadata?.payment_method) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, 'Order does not have a valid payment method');
  }

  // Validate payment method matches order metadata
  if (payload.payment_method !== order.metadata?.payment_method) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, 'Payment method mismatch');
  }

  // Delegate to refund service
  const { refundId, refundedAmount, method } = await refundOrder(req.scope, order, payload.amount);

  // Update order with refund info
  await orderService.updateOrders(id, {
    metadata: {
      ...order.metadata,
      refund_id: refundId,
      refund_amount: refundedAmount,
      refund_at: new Date().toISOString(),
      refund_method: method,
      custom_status: 'refunded',
      return_requested: false,
    }
  });

  res.status(200).json({ success: true, refundId, refundedAmount });
};
