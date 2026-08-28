import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/order-tracking.css';
import { 
  Search, 
  Check, 
  CheckCircle, 
  Truck, 
  Home, 
  Package
} from 'lucide-react';

const formatPrice = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const OrderTrackingPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [searchError, setSearchError] = useState('');

  // Load latest order on mount
  useEffect(() => {
    try {
      const lastOrderStr = localStorage.getItem('sprylo_last_order');
      if (lastOrderStr) {
        const lastOrder = JSON.parse(lastOrderStr);
        setOrder(lastOrder);
        setSearchInput(lastOrder.orderId);
      }
    } catch (e) {
      console.error("Failed to load last order from localStorage:", e);
    }
  }, []);

  const handleSearch = () => {
    if (!searchInput.trim()) {
      setSearchError("Vui lòng nhập mã đơn hàng.");
      return;
    }
    setSearchError('');
    
    try {
      const historyStr = localStorage.getItem('sprylo_orders');
      if (historyStr) {
        const history: any[] = JSON.parse(historyStr);
        const foundOrder = history.find(o => 
          o.orderId.toLowerCase() === searchInput.trim().toLowerCase() ||
          o.orderId.toLowerCase() === `#${searchInput.trim().toLowerCase()}`
        );
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setSearchError("Không tìm thấy đơn hàng với mã này trên thiết bị của bạn.");
          setOrder(null);
        }
      } else {
        setSearchError("Không có lịch sử đơn hàng trên thiết bị này.");
        setOrder(null);
      }
    } catch (e) {
      setSearchError("Lỗi khi tìm kiếm đơn hàng.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Trang chủ</Link><span>/</span>
            <Link to="/account">Tài khoản</Link><span>/</span>
            <span>Theo dõi đơn hàng</span>
          </div>
          <h1>THEO DÕI ĐƠN HÀNG</h1>
        </div>
      </div>

      <section className="section products-section-bg">
        <div className="container">

          {/* SEARCH BOX */}
          <div style={{ maxWidth: '560px', margin: '0 auto 2.5rem', background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border)' }}>
            <div className="fw-700 text-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.8rem' }}>Tra cứu đơn hàng</div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <input 
                type="text" 
                className="form-control" 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập mã đơn hàng (vd: #SF...)" 
                style={{ flex: 1 }} 
              />
              <button className="btn btn-primary" onClick={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Search size={18} /> Tra cứu
              </button>
            </div>
            {searchError && <div style={{ color: 'var(--error)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{searchError}</div>}
          </div>


          {order ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>

            {/* MAIN TRACKING */}
            <div>
              {/* ORDER HEADER CARD */}
              <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
                  <div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '0.2rem' }}>Đơn hàng {order.orderId}</div>
                    <div className="text-xs text-muted">Đặt lúc {new Date(order.created_at || Date.now()).toLocaleString('vi-VN')}</div>
                  </div>
                  <span className="status-badge badge-shipped text-xs" style={{ padding: '0.35rem 0.9rem' }}>Chờ xác nhận</span>
                </div>


                {/* TRACKING STEPS */}
                <div className="tracking-steps">
                  <div className="tracking-step done">
                    <div className="step-icon"><CheckCircle size={16} /></div>
                    <div className="step-label">Đã đặt</div>
                  </div>
                  <div className="tracking-step current">
                    <div className="step-icon"><CheckCircle size={16} /></div>
                    <div className="step-label">Xác nhận</div>
                  </div>
                  <div className="tracking-step">
                    <div className="step-icon"><Package size={16} /></div>
                    <div className="step-label">Đóng gói</div>
                  </div>
                  <div className="tracking-step">
                    <div className="step-icon"><Truck size={16} /></div>
                    <div className="step-label">Đang giao</div>
                  </div>
                  <div className="tracking-step">
                    <div className="step-icon"><Home size={16} /></div>
                    <div className="step-label">Đã nhận</div>
                  </div>
                </div>
              </div>


              {/* TIMELINE */}
              <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '1.5rem' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '1.5rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--border)' }}>
                  Lịch sử trạng thái
                </div>

                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-dot current"><Check size={14} /></div>
                    <div className="timeline-time">{new Date(order.created_at || Date.now()).toLocaleString('vi-VN')}</div>
                    <div className="timeline-desc">Hệ thống đã ghi nhận đơn hàng</div>
                    <div className="timeline-sub">Trạng thái: Chờ thanh toán / xác nhận</div>
                  </div>
                </div>
              </div>
            </div>

            {/* SIDEBAR: ORDER ITEMS */}
            <div>
              <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '1.3rem', position: 'sticky', top: '80px' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '1rem', paddingBottom: '0.7rem', borderBottom: '1px solid var(--border)' }}>
                  Sản phẩm trong đơn
                </div>

                {order.items && order.items.map((item: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', padding: '0.8rem 0', borderBottom: '1px solid var(--border)' }}>
                    <img 
                      src={item.img || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&q=80"} 
                      alt={item.name} 
                      style={{ width: '56px', height: '56px', borderRadius: '6px', objectFit: 'cover', background: 'var(--bg)', flexShrink: 0 }} 
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.name}</div>
                      <div className="text-xs text-muted">{item.variant || 'Mặc định'} · &times;{item.qty}</div>
                      <div className="fw-700 text-sm" style={{ marginTop: '0.2rem' }}>{formatPrice(item.price)}</div>
                    </div>
                  </div>
                ))}

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.8rem', marginTop: '0.2rem' }}>
                  <div className="flex-between text-sm" style={{ padding: '0.2rem 0' }}>
                    <span className="text-muted">Phí vận chuyển</span>
                    <span className="fw-700">{formatPrice(order.shippingFee || 0)}</span>
                  </div>
                  <div className="flex-between fw-700" style={{ fontSize: '0.95rem', padding: '0.5rem 0 0', borderTop: '1px solid var(--border)', marginTop: '0.3rem' }}>
                    <span>Tổng cộng</span>
                    <span className="text-accent">
                      {formatPrice((order.items?.reduce((acc: number, cur: any) => acc + (cur.price * cur.qty), 0) || 0) + (order.shippingFee || 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <Package size={48} style={{ color: 'var(--border)', margin: '0 auto 1rem' }} />
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                Chưa có thông tin đơn hàng
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                Vui lòng nhập mã đơn hàng của bạn vào ô tìm kiếm ở trên để xem trạng thái giao hàng.
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default OrderTrackingPage;
