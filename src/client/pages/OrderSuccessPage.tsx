import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Check, 
  CheckCircle, 
  Package, 
  Truck, 
  Home, 
  User, 
  MapPin, 
  CreditCard, 
  ShoppingBag, 
  Receipt
} from 'lucide-react';
import '../styles/order-success.css';

const OrderSuccessPage = () => {
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('latest_order');
    if (saved) {
      try {
        setOrder(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  if (!order) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <h2>Không tìm thấy thông tin đơn hàng.</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Về trang chủ</Link>
      </div>
    );
  }

  const {
    id, customer, address, paymentMethod, shippingMethod, items,
    subtotal, shippingFee, discount, total
  } = order;

  const paymentLabel = paymentMethod === 'vnpay' ? 'VNPay' 
    : paymentMethod === 'momo' ? 'MoMo' 
    : paymentMethod === 'zalopay' ? 'ZaloPay' 
    : paymentMethod === 'wallet' ? 'Ví điện tử'
    : 'Thanh toán khi nhận hàng (COD)';

  const shippingLabel = shippingMethod === 'express' ? 'Giao Hàng Nhanh' : 'Tiêu chuẩn';

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">Sprylo</Link>
        <ul className="navbar-nav">
          <li><Link to="/">Trang chủ</Link></li>
          <li><Link to="/products">Sản phẩm</Link></li>
          <li><Link to="/account">Tài khoản</Link></li>
        </ul>
        <div className="navbar-actions">
          <Link to="/account" className="btn-icon"><User size={20} /></Link>
          <Link to="/cart" className="btn-icon pos-relative">
            <ShoppingBag size={20} />
            <span className="badge-count">0</span>
          </Link>
        </div>
      </nav>


      <div className="success-wrap">
        <div className="success-card">
          {/* HEADER */}
          <div className="success-header">
            <div className="success-icon"><Check size={32} /></div>
            <div className="success-title">ĐẶT HÀNG THÀNH CÔNG!</div>
            <div className="success-order-code">Mã đơn hàng: {id}</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.4rem', position: 'relative', zIndex: 1 }}>
              Xác nhận đã được gửi đến email của bạn
            </div>
          </div>


          {/* BODY */}
          <div className="success-body">
            {/* TRACKING STEPS */}
            <div className="success-tracking">
              <div className="tracking-steps">
                <div className="tracking-step done">
                  <div className="step-icon"><CheckCircle size={16} /></div>
                  <div className="step-label">Đã đặt hàng</div>
                </div>
                <div className="tracking-step current">
                  <div className="step-icon"><Package size={16} /></div>
                  <div className="step-label">Xác nhận</div>
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

            {/* ORDER INFO GRID */}
            <div className="info-grid">
              <div className="info-box">
                <div className="info-box-label"><User size={14} style={{verticalAlign: 'middle', marginRight: '4px'}}/> Người nhận</div>
                <div className="info-box-value">{customer.fullName}</div>
                <div className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>{customer.phoneNumber}</div>
              </div>
              <div className="info-box">
                <div className="info-box-label"><MapPin size={14} style={{verticalAlign: 'middle', marginRight: '4px'}}/> Địa chỉ giao hàng</div>
                <div className="info-box-value" style={{ fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.5 }}>
                  {address}
                </div>
              </div>
              <div className="info-box">
                <div className="info-box-label"><Truck size={14} style={{verticalAlign: 'middle', marginRight: '4px'}}/> Đơn vị vận chuyển</div>
                <div className="info-box-value">{shippingLabel}</div>
                <div className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>Dự kiến giao: 2-3 ngày</div>
              </div>
              <div className="info-box">
                <div className="info-box-label"><CreditCard size={14} style={{verticalAlign: 'middle', marginRight: '4px'}}/> Phương thức thanh toán</div>
                <div className="info-box-value">{paymentLabel}</div>
                <div className="text-xs text-success" style={{ marginTop: '0.2rem', fontWeight: 600 }}>
                  <CheckCircle size={12} style={{display: 'inline', verticalAlign: 'middle', marginRight: '4px'}}/> {paymentMethod === 'cod' ? 'Chưa thanh toán' : 'Đã thanh toán'}
                </div>
              </div>
            </div>


            {/* ORDER ITEMS */}
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1.5rem' }}>
              <div className="fw-700 text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.8rem' }}>Chi tiết đơn hàng</div>

              {items.map((item: any, idx: number) => {
                const imgUrl = item.img?.startsWith('http') ? item.img : `https://images.unsplash.com/${item.img || 'photo-1505740420928-5e560c06d30e'}?w=120&q=80`;
                return (
                  <div className="order-item-row" key={idx}>
                    <img src={imgUrl} alt={item.name} style={{ width: '52px', height: '52px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
                      <div className="text-xs text-muted">SL: {item.qty}</div>
                    </div>
                    <div style={{ fontWeight: 700 }}>{(item.price * item.qty).toLocaleString('vi-VN')}đ</div>
                  </div>
                );
              })}

              {/* TOTALS */}
              <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.8rem', paddingTop: '0.8rem' }}>
                <div className="flex-between text-xs text-muted" style={{ padding: '0.25rem 0' }}>
                  <span>Tạm tính</span><span>{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex-between text-xs text-muted" style={{ padding: '0.25rem 0' }}>
                  <span>Phí vận chuyển ({shippingLabel})</span><span>{shippingFee.toLocaleString('vi-VN')}đ</span>
                </div>
                {discount > 0 && (
                  <div className="flex-between text-xs text-success" style={{ padding: '0.25rem 0' }}>
                    <span>Giảm giá / Ví</span><span>-{discount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div className="flex-between fw-700" style={{ fontSize: '1rem', padding: '0.5rem 0 0', borderTop: '1px solid var(--border)', marginTop: '0.3rem' }}>
                  <span>Tổng thanh toán</span>
                  <span className="text-accent">{total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex-center" style={{ gap: '0.8rem', flexWrap: 'wrap' }}>
              <Link to="/order-tracking" className="btn btn-primary" style={{ flex: 1, minWidth: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <MapPin size={18} /> Theo dõi đơn hàng
              </Link>
              <Link to="/account" className="btn btn-outline" style={{ flex: 1, minWidth: '160px', color: 'var(--dark)', borderColor: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Receipt size={18} /> Lịch sử đơn hàng
              </Link>
              <Link to="/" className="btn btn-outline" style={{ flex: 1, minWidth: '160px', color: 'var(--dark)', borderColor: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <ShoppingBag size={18} /> Tiếp tục mua sắm
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default OrderSuccessPage;
