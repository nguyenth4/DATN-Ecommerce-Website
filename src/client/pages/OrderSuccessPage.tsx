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

const formatPrice = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const OrderSuccessPage = () => {
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    try {
      const lastOrder = localStorage.getItem('sprylo_last_order');
      if (lastOrder) {
        setOrder(JSON.parse(lastOrder));
      }
    } catch (e) {
      console.error("Failed to load last order from localStorage:", e);
    }
  }, []);

  // fallback to mock details if no order is found in localStorage
  const displayOrderId = order?.orderId ? `#${order.orderId}` : '#SF2025-8843';
  const displayName = order?.customer?.fullName || 'Trần Ngọc';
  const displayPhone = order?.customer?.phoneNumber || '0912 345 678';
  const displayAddress = order?.address || '123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh';
  
  // Custom display mapper for payment method
  const getPaymentMethodDisplay = (method: string) => {
    if (!method) return 'VNPay';
    switch (method.toLowerCase()) {
      case 'cod':
        return 'COD (Thanh toán khi nhận hàng)';
      case 'wallet':
        return 'Ví điện tử Sprylo';
      case 'vnpay':
        return 'VNPay';
      case 'momo':
        return 'Ví MoMo';
      case 'zalopay':
        return 'Ví ZaloPay';
      default:
        return method.toUpperCase();
    }
  };

  const displayPaymentMethod = getPaymentMethodDisplay(order?.paymentMethod);
  const isPaid = order ? (order.paymentMethod !== 'cod') : true;
  const displayPaymentStatus = isPaid ? 'Đã thanh toán' : 'Chưa thanh toán';
  const displayShippingMethod = order?.shippingMethod === 'ghn' ? 'GHN – Giao Hàng Nhanh' : (order?.shippingMethod === 'ghtk' ? 'Giao Hàng Tiết Kiệm' : 'Đơn vị vận chuyển tiêu chuẩn');
  
  const displayItems = order?.items || [
    {
      id: 'mock1',
      name: 'Sony WH-1000XM5',
      variant: 'Màu: Đen',
      qty: 1,
      price: 8490000,
      img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&q=80'
    },
    {
      id: 'mock2',
      name: 'Apple Watch Ultra 2',
      variant: 'Dây Alpine đen',
      qty: 1,
      price: 19990000,
      img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&q=80'
    }
  ];

  const subtotal = displayItems.reduce((acc: number, item: any) => acc + item.price * item.qty, 0);
  const shippingFee = order?.shippingFee || 35000;
  const discount = 0; // or mock discount if any
  const total = subtotal + shippingFee - discount;

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
            <div className="success-order-code">Mã đơn hàng: {displayOrderId}</div>
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
                <div className="info-box-value">{displayName}</div>
                <div className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>{displayPhone}</div>
              </div>
              <div className="info-box">
                <div className="info-box-label"><MapPin size={14} style={{verticalAlign: 'middle', marginRight: '4px'}}/> Địa chỉ giao hàng</div>
                <div className="info-box-value" style={{ fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.5 }}>{displayAddress}</div>
              </div>
              <div className="info-box">
                <div className="info-box-label"><Truck size={14} style={{verticalAlign: 'middle', marginRight: '4px'}}/> Đơn vị vận chuyển</div>
                <div className="info-box-value">{displayShippingMethod}</div>
                <div className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>Dự kiến: 1-3 ngày làm việc</div>
              </div>
              <div className="info-box">
                <div className="info-box-label"><CreditCard size={14} style={{verticalAlign: 'middle', marginRight: '4px'}}/> Phương thức thanh toán</div>
                <div className="info-box-value">{displayPaymentMethod}</div>
                <div className={`text-xs ${isPaid ? 'text-success' : 'text-muted'}`} style={{ marginTop: '0.2rem', fontWeight: 600 }}>
                  <CheckCircle size={12} style={{display: 'inline', verticalAlign: 'middle', marginRight: '4px'}} />
                  {displayPaymentStatus}
                </div>
              </div>
            </div>


            {/* ORDER ITEMS */}
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1.5rem' }}>
              <div className="fw-700 text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.8rem' }}>Chi tiết đơn hàng</div>

              {displayItems.map((item: any, idx: number) => (
                <div className="order-item-row" key={item.id || idx}>
                  <img src={item.img || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&q=80"} alt="" style={{ width: '52px', height: '52px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name || item.title}</div>
                    <div className="text-xs text-muted">{item.variant ? `${item.variant} · ` : ''}SL: {item.qty}</div>
                  </div>
                  <div style={{ fontWeight: 700 }}>{formatPrice(item.price)}</div>
                </div>
              ))}

              {/* TOTALS */}
              <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.8rem', paddingTop: '0.8rem' }}>
                <div className="flex-between text-xs text-muted" style={{ padding: '0.25rem 0' }}>
                  <span>Tạm tính</span><span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex-between text-xs text-muted" style={{ padding: '0.25rem 0' }}>
                  <span>Phí vận chuyển ({order?.shippingMethod?.toUpperCase() || 'GHN'})</span><span>{formatPrice(shippingFee)}</span>
                </div>
                <div className="flex-between text-xs text-success" style={{ padding: '0.25rem 0' }}>
                  <span>Giảm giá</span><span>{formatPrice(discount)}</span>
                </div>
                <div className="flex-between fw-700" style={{ fontSize: '1rem', padding: '0.5rem 0 0', borderTop: '1px solid var(--border)', marginTop: '0.3rem' }}>
                  <span>Tổng thanh toán</span>
                  <span className="text-accent">{formatPrice(total)}</span>
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
