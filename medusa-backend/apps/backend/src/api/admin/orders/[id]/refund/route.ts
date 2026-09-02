import { Request, Response } from 'express';
import { MedusaError, Modules } from '@medusajs/framework/utils';
import { Resend } from 'resend';
import { refundOrder } from '../../../../../services/refund.service';

type RefundRequest = {
  payment_method: 'zalopay' | 'vnpay' | 'cod' | 'COD' | string;
  amount?: number;
};

const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
};

/**
 * POST /admin/orders/:id/refund
 * Admin only endpoint to initiate a refund for a paid order.
 * Supports refunding to wallet or bank transfer based on order.metadata.refund_destination.
 */
export const POST = async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body as RefundRequest;

  if (!payload.payment_method) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, 'payment_method is required');
  }

  const orderService = req.scope.resolve(Modules.ORDER);
  const order = await orderService.retrieveOrder(id, { relations: ['metadata', 'items', 'summary'] });

  if (!order.metadata?.payment_method) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, 'Order does not have a valid payment method');
  }

  // Determine refund amount
  let parsedTotal = 0;
  if (payload.amount) {
    parsedTotal = payload.amount;
  } else if (order.summary?.paid_total !== undefined) {
    parsedTotal = Number(order.summary.paid_total);
  } else if (order.total !== undefined) {
    parsedTotal = Number(order.total);
  }
  
  const refundAmount = parsedTotal;
  const refundDestination: string = order.metadata?.refund_destination || 'bank_transfer';
  
  // Use product name for transaction description
  let productName = 'đơn hàng';
  if (order.items && order.items.length > 0) {
    productName = order.items[0].title || order.items[0].product_title || 'sản phẩm';
    if (order.items.length > 1) {
      productName += ` và ${order.items.length - 1} sp khác`;
    }
  }
  const txDescription = `Hoàn tiền ${productName}`;

  let refundId: string;
  let refundMethodLabel: string;

  const db = req.scope.resolve("__pg_connection__");

  if (refundDestination === 'wallet') {
    // ===== REFUND TO WALLET =====
    // Find customer_id from order
    const customerId = order.customer_id || order.metadata?.customer_id;

    if (!customerId) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, 'Cannot find customer for wallet refund');
    }

    // Find or create wallet
    const walletRes = await db.raw(`
      SELECT id, balance FROM wallet WHERE customer_id = ?
    `, [customerId]);

    let walletId: string;

    if (walletRes.rows.length > 0) {
      walletId = walletRes.rows[0].id;
    } else {
      // Auto-create wallet
      walletId = `wallet_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      await db.raw(`
        INSERT INTO wallet (id, customer_id, balance)
        VALUES (?, ?, 0)
      `, [walletId, customerId]);
    }

    // Add refund amount to wallet balance
    await db.raw(`
      UPDATE wallet SET balance = balance + ?, raw_balance = jsonb_build_object('value', (balance + ?)::text, 'precision', 20), updated_at = NOW() WHERE id = ?
    `, [refundAmount, refundAmount, walletId]);

    // Create refund transaction
    const txId = `tx_refund_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const displayId = order.display_id || order.id;
    await db.raw(`
      INSERT INTO wallet_transaction (id, wallet_id, amount, raw_amount, type, description)
      VALUES (?, ?, ?, jsonb_build_object('value', ?::text, 'precision', 20), 'refund', ?)
    `, [txId, walletId, refundAmount, refundAmount.toString(), txDescription]);

    refundId = `wallet_refund_${txId}`;
    refundMethodLabel = 'Ví Sprylo';

  } else {
    // ===== REFUND TO BANK / ORIGINAL METHOD =====
    // Delegate to existing refund service (ZaloPay/VNPay/manual)
    const result = await refundOrder(req.scope, order, payload.amount);
    refundId = result.refundId;
    
    const bankInfo = order.metadata?.refund_info;
    if (bankInfo) {
      refundMethodLabel = `Chuyển khoản (${bankInfo})`;
    } else {
      refundMethodLabel = result.method === 'zalopay' ? 'ZaloPay' 
        : result.method === 'vnpay' ? 'VNPay' 
        : 'Chuyển khoản ngân hàng';
    }
  }

  // Update order with refund info
  await orderService.updateOrders(id, {
    metadata: {
      ...order.metadata,
      refund_id: refundId,
      refund_amount: refundAmount,
      refund_at: new Date().toISOString(),
      refund_method: refundMethodLabel,
      refund_destination: refundDestination,
      custom_status: 'refunded',
      return_requested: false,
    }
  });

  // Emit Refund Success Event
  const eventBus = req.scope.resolve(Modules.EVENT_BUS);
  await eventBus.emit({
    name: "order.refund.success",
    data: { 
      id, 
      refundAmount, 
      method: refundMethodLabel,
      refundDestination
    },
  });

  res.status(200).json({ success: true, refundId, refundedAmount: refundAmount, refundDestination: refundDestination });
};
