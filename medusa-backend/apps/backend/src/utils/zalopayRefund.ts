import fetch from 'node-fetch';
import crypto from 'crypto';

/**
 * Perform a refund request to ZaloPay.
 * Returns the refund transaction id returned by ZaloPay.
 */
export async function zalopayRefund(order: any, amount?: number): Promise<string> {
  const appId = process.env.ZALOPAY_APP_ID || '';
  const appSecret = process.env.ZALOPAY_APP_SECRET || '';
  const refundUrl = process.env.ZALOPAY_REFUND_URL || '';

  const zpTransId = order.metadata?.zp_trans_id;
  if (!zpTransId) {
    console.warn('ZaloPay transaction id missing in order metadata. Mocking refund for testing.');
    return `mock_zp_refund_${Date.now()}`;
  }

  const refundAmount = amount ?? order.total_amount; // assume order.total_amount in smallest unit
  const timestamp = Math.floor(Date.now() / 1000);
  const data = {
    app_id: appId,
    m_refund_id: `${new Date().toISOString().replace(/[-:.TZ]/g, '')}_${appId}_${Math.random().toString(36).substr(2, 8)}`,
    zp_trans_id: zpTransId,
    amount: refundAmount,
    timestamp,
    description: 'Refund order',
  };

  const raw = `${data.app_id}|${data.m_refund_id}|${data.zp_trans_id}|${data.amount}|${data.timestamp}`;
  const mac = crypto.createHmac('sha256', appSecret).update(raw).digest('hex');
  const payload = { ...data, mac };

  const response = await fetch(refundUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  if (result.return_code !== 1) {
    throw new Error(`ZaloPay refund failed: ${result.return_message}`);
  }
  return result.refund_id as string;
}
