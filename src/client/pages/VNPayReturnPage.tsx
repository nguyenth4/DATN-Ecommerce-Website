import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';


const VNPayReturnPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    // Usually, the frontend just checks if vnp_ResponseCode === '00'
    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
    
    if (vnp_ResponseCode === '00') {
      setStatus('success');
      setTimeout(() => {
        navigate('/order-success');
      }, 3000);
    } else {
      setStatus('error');
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
      {status === 'loading' && (
        <>
          <Loader2 size={48} className="animate-spin text-blue-500" />
          <h2>Đang xử lý kết quả thanh toán...</h2>
        </>
      )}
      {status === 'success' && (
        <>
          <CheckCircle2 size={64} color="#10b981" />
          <h2 style={{ color: '#10b981' }}>Thanh toán VNPay thành công!</h2>
          <p>Đang chuyển hướng đến trang hoàn tất đơn hàng...</p>
        </>
      )}
      {status === 'error' && (
        <>
          <XCircle size={64} color="#ef4444" />
          <h2 style={{ color: '#ef4444' }}>Thanh toán VNPay thất bại hoặc bị hủy.</h2>
          <button 
            onClick={() => navigate('/checkout')}
            style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
          >
            Quay lại trang thanh toán
          </button>
        </>
      )}
    </div>
  );
};

export default VNPayReturnPage;
