import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';

const ZALOPAY_RESPONSE_CODES: Record<string, string> = {
  '1': 'Giao dịch thành công',
  '2': 'Giao dịch thất bại',
  '-49': 'Người dùng đã hủy thanh toán.',
  '-53': 'Tài khoản không đủ số dư để thực hiện giao dịch.',
  '0': 'Giao dịch đang được xử lý.',
  '-1': 'Lỗi không xác định từ cổng thanh toán.',
};

const ZaloPayReturnPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [orderInfo, setOrderInfo] = useState<{ orderId: string; amount: string; transId: string } | null>(null);

  useEffect(() => {
    const apptransid = searchParams.get('apptransid') || searchParams.get('app_trans_id') || '';
    const statusParam = searchParams.get('status');
    const amountParam = searchParams.get('amount') || '0';
    const checksum = searchParams.get('checksum') || apptransid;

    // Standard order id extracted if apptransid is formatted YYMMDD_order_xxx
    const displayOrderId = apptransid.includes('_')
      ? apptransid.split('_').slice(1).join('_')
      : apptransid;

    const parsedAmount = parseInt(amountParam, 10);
    const formattedAmount = isNaN(parsedAmount) || parsedAmount === 0 
      ? '' 
      : parsedAmount.toLocaleString('vi-VN') + ' ₫';

    setOrderInfo({
      orderId: displayOrderId || apptransid,
      amount: formattedAmount,
      transId: apptransid,
    });

    const isSuccess = statusParam === '1' || statusParam === '00' || !statusParam;

    if (isSuccess) {
      setStatus('success');

      // Update payment_status in localStorage for matching order
      try {
        const orders: any[] = JSON.parse(localStorage.getItem('sprylo_orders') || '[]');
        let updated = false;

        const updatedOrders = orders.map((order) => {
          if (
            order.orderId === displayOrderId ||
            order.orderId === apptransid ||
            order.orderId?.includes(displayOrderId)
          ) {
            updated = true;
            return {
              ...order,
              payment_status: 'paid',
              zalopay_trans_id: apptransid,
              zalopay_checksum: checksum,
            };
          }
          return order;
        });

        // Fallback to update latest zalopay order
        if (!updated && orders.length > 0) {
          const latestZalopay = [...updatedOrders]
            .reverse()
            .find((o) => o.paymentMethod === 'zalopay' && o.payment_status !== 'paid');
          if (latestZalopay) {
            const idx = updatedOrders.findIndex((o) => o.orderId === latestZalopay.orderId);
            if (idx > -1) {
              updatedOrders[idx] = {
                ...updatedOrders[idx],
                payment_status: 'paid',
                zalopay_trans_id: apptransid,
                zalopay_checksum: checksum,
              };
              updated = true;
            }
          }
        }

        if (updated) {
          localStorage.setItem('sprylo_orders', JSON.stringify(updatedOrders));
          console.log('[ZaloPayReturnPage] ✅ Updated payment_status=paid in localStorage');
        }
      } catch (e) {
        console.error('[ZaloPayReturnPage] Failed to update localStorage:', e);
      }

      // Auto redirect to order management tab after 3s
      setTimeout(() => {
        navigate('/account?tab=orders');
      }, 3000);
    } else {
      const code = statusParam || '-1';
      const msg = ZALOPAY_RESPONSE_CODES[code] || ZALOPAY_RESPONSE_CODES['-1'];
      setErrorMessage(msg);
      setStatus('error');
    }
  }, [searchParams, navigate]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '16px',
        background: 'var(--bg, #f9fafb)',
        padding: '24px',
      }}
    >
      {status === 'loading' && (
        <>
          <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', color: '#0068ff' }} />
          <h2 style={{ color: '#374151' }}>Đang xử lý kết quả thanh toán ZaloPay...</h2>
        </>
      )}

      {status === 'success' && (
        <div
          style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            maxWidth: '480px',
            width: '100%',
          }}
        >
          <CheckCircle2 size={72} color="#0068ff" style={{ marginBottom: '16px' }} />
          <h2 style={{ color: '#0068ff', fontSize: '1.5rem', marginBottom: '8px' }}>
            Thanh toán ZaloPay thành công!
          </h2>
          {orderInfo && (
            <div style={{ color: '#6b7280', marginBottom: '16px', lineHeight: '1.8' }}>
              <div>Mã đơn hàng: <strong style={{ color: '#111827' }}>{orderInfo.orderId}</strong></div>
              {orderInfo.amount && (
                <div>Số tiền: <strong style={{ color: '#111827' }}>{orderInfo.amount}</strong></div>
              )}
              <div>Mã giao dịch ZaloPay: <strong style={{ color: '#111827' }}>{orderInfo.transId}</strong></div>
            </div>
          )}
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
            Đang chuyển hướng đến trang đơn hàng...
          </p>
          <div
            style={{
              width: '100%',
              height: '4px',
              background: '#e5e7eb',
              borderRadius: '2px',
              marginTop: '16px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                background: '#0068ff',
                animation: 'progress-bar 3s linear forwards',
                borderRadius: '2px',
              }}
            />
          </div>
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes progress-bar { from { width: 0% } to { width: 100% } }
          `}</style>
        </div>
      )}

      {status === 'error' && (
        <div
          style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            maxWidth: '480px',
            width: '100%',
          }}
        >
          <XCircle size={72} color="#ef4444" style={{ marginBottom: '16px' }} />
          <h2 style={{ color: '#ef4444', fontSize: '1.5rem', marginBottom: '8px' }}>
            Thanh toán không thành công
          </h2>
          {errorMessage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '12px 16px',
                margin: '16px 0',
                textAlign: 'left',
              }}
            >
              <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ color: '#dc2626', margin: 0, fontSize: '0.9rem' }}>{errorMessage}</p>
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
            <button
              onClick={() => navigate('/checkout')}
              style={{
                padding: '10px 20px',
                background: '#0068ff',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Thử lại thanh toán
            </button>
            <button
              onClick={() => navigate('/account?tab=orders')}
              style={{
                padding: '10px 20px',
                background: '#f3f4f6',
                color: '#374151',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Xem đơn hàng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZaloPayReturnPage;
