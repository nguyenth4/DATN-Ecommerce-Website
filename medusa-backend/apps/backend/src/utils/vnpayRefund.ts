import crypto from 'crypto';
import fetch from 'node-fetch';

/**
 * Perform a refund request to VNPay.
 * Returns the refund transaction id.
 */
export async function vnpayRefund(order: any, amount?: number): Promise<string> {
  const tmnCode = process.env.VNPAY_TMN_CODE || '';
  const hashSecret = process.env.VNPAY_HASH_SECRET || '';
  const refundUrl = process.env.VNPAY_REFUND_URL || '';

  const vnpTransactionNo = order.metadata?.vnp_TransactionNo;
  if (!vnpTransactionNo) {
    console.warn('VNPay transaction number missing in order metadata. Mocking refund for testing.');
    return `mock_vnp_refund_${Date.now()}`;
  }

  const refundAmount = amount ?? order.total_amount; // smallest unit (VND * 100)
  const vnpTxnRef = order.id; // use order id as reference
  const vnpCreateDate = new Date().toISOString().replace(/[-:]/g, '').slice(0, 14);

  const params: any = {
    vnp_Version: '2.1.0',
    vnp_Command: 'refund',
    vnp_TmnCode: tmnCode,
    vnp_Amount: refundAmount.toString(),
    vnp_CurrCode: 'VND',
    vnp_TxnRef: vnpTxnRef,
    vnp_TransactionNo: vnpTransactionNo,
    vnp_CreateDate: vnpCreateDate,
    vnp_IpAddr: '127.0.0.1',
  };

  // Build hash data string sorted by key
  const sortedKeys = Object.keys(params).sort();
  const rawData = sortedKeys.map(k => `${k}=${params[k]}`).join('&');
  const secureHash = crypto.createHmac('sha512', hashSecret).update(rawData).digest('hex');
  params.vnp_SecureHash = secureHash;

  const url = `${refundUrl}?${new URLSearchParams(params).toString()}`;
  const response = await fetch(url, { method: 'GET' });
  const result = await response.json();
  if (result.ResponseCode !== '00') {
    throw new Error(`VNPay refund failed: ${result.Message}`);
  }
  return result.TransactionNo as string;
}
