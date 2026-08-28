import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
const VNPAY_RESPONSE_CODES: Record<string, string> = {
  '00': 'Giao dịch thành công',
  '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
  '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking.',
  '10': 'Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.',
  '11': 'Đã hết hạn chờ thanh toán. Vui lòng thực hiện lại giao dịch.',
  '12': 'Thẻ/Tài khoản bị khóa.',
  '13': 'Nhập sai mật khẩu OTP. Vui lòng thực hiện lại giao dịch.',
  '24': 'Giao dịch bị hủy.',
  '51': 'Tài khoản không đủ số dư để thực hiện giao dịch.',
  '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày.',
  '75': 'Ngân hàng thanh toán đang bảo trì.',
  '79': 'Nhập sai mật khẩu thanh toán quá số lần quy định. Vui lòng thực hiện lại giao dịch.',
  '99': 'Lỗi không xác định.',
};

const VNPayReturnPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [orderInfo, setOrderInfo] = useState<{ orderId: string; amount: string; bankCode: string } | null>(null);

  useEffect(() => {
    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
    const vnp_TxnRef = searchParams.get('vnp_TxnRef') || '';
    const vnp_Amount = searchParams.get('vnp_Amount') || '0';
    const vnp_BankCode = searchParams.get('vnp_BankCode') || '';
    const vnp_TransactionNo = searchParams.get('vnp_TransactionNo') || '';

    // Hiển thị thông tin đơn hàng
    setOrderInfo({
      orderId: vnp_TxnRef,
      amount: (parseInt(vnp_Amount) / 100).toLocaleString('vi-VN') + ' ₫',
      bankCode: vnp_BankCode,
    });

    if (vnp_ResponseCode === '00') {
      setStatus('success');

      // Cập nhật payment_status trong localStorage cho đơn hàng tương ứng
      try {
        const orders: any[] = JSON.parse(localStorage.getItem('sprylo_orders') || '[]');
        let updated = false;

        const updatedOrders = orders.map((order) => {
          // Khớp theo orderId (vnp_TxnRef) hoặc theo thời gian gần nhất
          if (order.orderId === vnp_TxnRef || order.orderId?.includes(vnp_TxnRef)) {
            updated = true;
            return {
              ...order,
              payment_status: 'paid',
              vnpay_transaction_no: vnp_TransactionNo,
              vnpay_bank_code: vnp_BankCode,
            };
          }
          return order;
        });

        // Nếu không tìm được theo ID, cập nhật đơn hàng VNPay mới nhất chưa thanh toán
        if (!updated && orders.length > 0) {
          const latestVnpay = [...updatedOrders]
            .reverse()
            .find((o) => o.paymentMethod === 'vnpay' && o.payment_status !== 'paid');
          if (latestVnpay) {
            const idx = updatedOrders.findIndex((o) => o.orderId === latestVnpay.orderId);
            if (idx > -1) {
              updatedOrders[idx] = {
                ...updatedOrders[idx],
                payment_status: 'paid',
                vnpay_transaction_no: vnp_TransactionNo,
                vnpay_bank_code: vnp_BankCode,
              };
              updated = true;
            }
          }
        }

        if (updated) {
          localStorage.setItem('sprylo_orders', JSON.stringify(updatedOrders));
          console.log('[VNPayReturnPage] ✅ Updated payment_status=paid in localStorage');
        }
      } catch (e) {
        console.error('[VNPayReturnPage] Failed to update localStorage:', e);
      }

      // Chuyển đến trang đơn hàng sau 3 giây
      setTimeout(() => {
        navigate('/account?tab=orders');
      }, 3000);
    } else {
      const code = vnp_ResponseCode || '99';
      const msg = VNPAY_RESPONSE_CODES[code] || VNPAY_RESPONSE_CODES['99'];
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
          <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
          <h2 style={{ color: '#374151' }}>Đang xử lý kết quả thanh toán...</h2>
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
          <CheckCircle2 size={72} color="#10b981" style={{ marginBottom: '16px' }} />
          <h2 style={{ color: '#10b981', fontSize: '1.5rem', marginBottom: '8px' }}>
            Thanh toán VNPay thành công!
          </h2>
          {orderInfo && (
            <div style={{ color: '#6b7280', marginBottom: '16px', lineHeight: '1.8' }}>
              <div>Mã đơn hàng: <strong style={{ color: '#111827' }}>{orderInfo.orderId}</strong></div>
              <div>Số tiền: <strong style={{ color: '#111827' }}>{orderInfo.amount}</strong></div>
              {orderInfo.bankCode && <div>Ngân hàng: <strong style={{ color: '#111827' }}>{orderInfo.bankCode}</strong></div>}
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
                background: '#10b981',
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
                background: '#3b82f6',
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

export default VNPayReturnPage;
