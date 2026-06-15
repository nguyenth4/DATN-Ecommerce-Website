import { Link } from 'react-router-dom';

const OrderSuccessPage = () => {
  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">Shop<span>Flow</span></Link>
        <ul className="navbar-nav">
          <li><Link to="/">Trang chủ</Link></li>
          <li><Link to="/products">Sản phẩm</Link></li>
          <li><Link to="/account">Tài khoản</Link></li>
        </ul>
        <div className="navbar-actions">
          <Link to="/account" className="btn-icon"><i className="bi bi-person"></i></Link>
          <Link to="/cart" className="btn-icon pos-relative">
            <i className="bi bi-bag"></i>
            <span className="badge-count">0</span>
          </Link>
        </div>
      </nav>

      <div className="success-wrap">
        <div className="success-card">
          {/* HEADER */}
          <div className="success-header">
            <div className="success-icon"><i className="bi bi-check-lg"></i></div>
            <div className="success-title">ĐẶT HÀNG THÀNH CÔNG!</div>
            <div className="success-order-code">Mã đơn hàng: #SF2025-8843</div>
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
                  <div className="step-icon"><i className="bi bi-check2"></i></div>
                  <div className="step-label">Đã đặt hàng</div>
                </div>
                <div className="tracking-step current">
                  <div className="step-icon"><i className="bi bi-box-seam"></i></div>
                  <div className="step-label">Xác nhận</div>
                </div>
                <div className="tracking-step">
                  <div className="step-icon"><i className="bi bi-truck"></i></div>
                  <div className="step-label">Đang giao</div>
                </div>
                <div className="tracking-step">
                  <div className="step-icon"><i className="bi bi-house-check"></i></div>
                  <div className="step-label">Đã nhận</div>
                </div>
              </div>
            </div>

            {/* ORDER INFO GRID */}
            <div className="info-grid">
              <div className="info-box">
                <div className="info-box-label"><i className="bi bi-person"></i> Người nhận</div>
                <div className="info-box-value">Trần Ngọc</div>
                <div className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>0912 345 678</div>
              </div>
              <div className="info-box">
                <div className="info-box-label"><i className="bi bi-geo-alt"></i> Địa chỉ giao hàng</div>
                <div className="info-box-value" style={{ fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.5 }}>123 Đường ABC, Phường XYZ,<br/>Quận 1, TP. Hồ Chí Minh</div>
              </div>
              <div className="info-box">
                <div className="info-box-label"><i className="bi bi-truck"></i> Đơn vị vận chuyển</div>
                <div className="info-box-value">GHN – Giao Hàng Nhanh</div>
                <div className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>Dự kiến: 24/05 – 26/05/2025</div>
              </div>
              <div className="info-box">
                <div className="info-box-label"><i className="bi bi-credit-card"></i> Phương thức thanh toán</div>
                <div className="info-box-value">VNPay</div>
                <div className="text-xs text-success" style={{ marginTop: '0.2rem', fontWeight: 600 }}><i className="bi bi-check-circle-fill"></i> Đã thanh toán</div>
              </div>
            </div>

            {/* ORDER ITEMS */}
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1.5rem' }}>
              <div className="fw-700 text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.8rem' }}>Chi tiết đơn hàng</div>

              <div className="order-item-row">
                <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&q=80" alt="" style={{ width: '52px', height: '52px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Sony WH-1000XM5</div>
                  <div className="text-xs text-muted">Màu: Đen · SL: 1</div>
                </div>
                <div style={{ fontWeight: 700 }}>8.490.000đ</div>
              </div>
              <div className="order-item-row">
                <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&q=80" alt="" style={{ width: '52px', height: '52px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Apple Watch Ultra 2</div>
                  <div className="text-xs text-muted">Dây Alpine đen · SL: 1</div>
                </div>
                <div style={{ fontWeight: 700 }}>19.990.000đ</div>
              </div>

              {/* TOTALS */}
              <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.8rem', paddingTop: '0.8rem' }}>
                <div className="flex-between text-xs text-muted" style={{ padding: '0.25rem 0' }}>
                  <span>Tạm tính</span><span>28.480.000đ</span>
                </div>
                <div className="flex-between text-xs text-muted" style={{ padding: '0.25rem 0' }}>
                  <span>Phí vận chuyển (GHN)</span><span>35.000đ</span>
                </div>
                <div className="flex-between text-xs text-success" style={{ padding: '0.25rem 0' }}>
                  <span>Giảm giá</span><span>-500.000đ</span>
                </div>
                <div className="flex-between fw-700" style={{ fontSize: '1rem', padding: '0.5rem 0 0', borderTop: '1px solid var(--border)', marginTop: '0.3rem' }}>
                  <span>Tổng thanh toán</span>
                  <span className="text-accent">28.015.000đ</span>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex-center" style={{ gap: '0.8rem', flexWrap: 'wrap' }}>
              <Link to="/order-tracking" className="btn btn-primary" style={{ flex: 1, minWidth: '160px' }}>
                <i className="bi bi-geo-alt"></i> Theo dõi đơn hàng
              </Link>
              <Link to="/account" className="btn btn-outline" style={{ flex: 1, minWidth: '160px', color: 'var(--dark)', borderColor: 'var(--border)' }}>
                <i className="bi bi-receipt"></i> Lịch sử đơn hàng
              </Link>
              <Link to="/" className="btn btn-outline" style={{ flex: 1, minWidth: '160px', color: 'var(--dark)', borderColor: 'var(--border)' }}>
                <i className="bi bi-bag"></i> Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderSuccessPage;
