import { Link } from 'react-router-dom';
import '../styles/order-tracking.css';

const OrderTrackingPage = () => {
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
              <input type="text" className="form-control" defaultValue="#SF2025-8843" placeholder="Nhập mã đơn hàng..." style={{ flex: 1 }} />
              <button className="btn btn-primary"><i className="bi bi-search"></i> Tra cứu</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>

            {/* MAIN TRACKING */}
            <div>
              {/* ORDER HEADER CARD */}
              <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
                  <div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', letterSpacing: '1px', marginBottom: '0.2rem' }}>Đơn hàng #SF2025-8843</div>
                    <div className="text-xs text-muted">Đặt lúc 09:32 – 24/05/2025</div>
                  </div>
                  <span className="status-badge badge-shipped text-xs" style={{ padding: '0.35rem 0.9rem' }}>Đang vận chuyển</span>
                </div>

                {/* TRACKING STEPS */}
                <div className="tracking-steps">
                  <div className="tracking-step done">
                    <div className="step-icon"><i className="bi bi-check2"></i></div>
                    <div className="step-label">Đã đặt</div>
                  </div>
                  <div className="tracking-step done">
                    <div className="step-icon"><i className="bi bi-check2"></i></div>
                    <div className="step-label">Xác nhận</div>
                  </div>
                  <div className="tracking-step done">
                    <div className="step-icon"><i className="bi bi-check2"></i></div>
                    <div className="step-label">Đóng gói</div>
                  </div>
                  <div className="tracking-step current">
                    <div className="step-icon"><i className="bi bi-truck"></i></div>
                    <div className="step-label">Đang giao</div>
                  </div>
                  <div className="tracking-step">
                    <div className="step-icon"><i className="bi bi-house-check"></i></div>
                    <div className="step-label">Đã nhận</div>
                  </div>
                </div>
              </div>

              {/* TIMELINE */}
              <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '1.5rem' }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '1px', marginBottom: '1.5rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--border)' }}>
                  Lịch sử vận chuyển
                </div>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-dot current"><i className="bi bi-truck"></i></div>
                    <div className="timeline-time">25/05/2025 – 10:45</div>
                    <div className="timeline-desc">Đang trên đường giao hàng</div>
                    <div className="timeline-sub">Nhân viên: Nguyễn Văn Tài – 0901 234 567</div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot done"><i className="bi bi-check"></i></div>
                    <div className="timeline-time">25/05/2025 – 08:20</div>
                    <div className="timeline-desc">Đã rời kho phân phối – TP.HCM</div>
                    <div className="timeline-sub">Bưu cục: GHN Quận 1</div>
                  </div>
                </div>
              </div>
            </div>

            {/* SIDEBAR: ORDER ITEMS */}
            <div>
              <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '1.3rem', position: 'sticky', top: '80px' }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '1px', marginBottom: '1rem', paddingBottom: '0.7rem', borderBottom: '1px solid var(--border)' }}>
                  Sản phẩm trong đơn
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', padding: '0.8rem 0', borderBottom: '1px solid var(--border)' }}>
                  <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&q=80" alt="" style={{ width: '56px', height: '56px', borderRadius: '6px', objectFit: 'cover', background: 'var(--bg)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Sony WH-1000XM5</div>
                    <div className="text-xs text-muted">Đen · ×1</div>
                    <div className="fw-700 text-sm" style={{ marginTop: '0.2rem' }}>8.490.000đ</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.8rem', marginTop: '0.2rem' }}>
                  <div className="flex-between fw-700" style={{ fontSize: '0.95rem', padding: '0.5rem 0 0', borderTop: '1px solid var(--border)', marginTop: '0.3rem' }}>
                    <span>Tổng cộng</span>
                    <span className="text-accent">28.015.000đ</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default OrderTrackingPage;
