import { Link } from 'react-router-dom';

const LoginPage = () => {
  return (
    <div className="auth-layout">
      {/* VISUAL SIDE */}
      <div className="auth-visual">
        <div className="auth-visual-img">
          <img src="https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=900&q=80" alt="" />
          <div className="auth-visual-overlay"></div>
        </div>
        <div className="auth-visual-content">
          <Link to="/" className="auth-visual-brand">Shop<span>Flow</span></Link>
        </div>
        <div className="auth-visual-content">
          <div className="auth-visual-quote">TRẢI NGHIỆM<br/>MUA SẮM <em>ĐỈNH CAO</em></div>
          <p className="auth-visual-sub">Hàng ngàn sản phẩm chính hãng, giao hàng nhanh toàn quốc.</p>
          <div className="flex-center" style={{ gap: '2rem', marginTop: '2rem' }}>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: 'white' }}>50K+</div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Khách hàng</div>
            </div>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: 'white' }}>1.2M+</div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Đơn hàng</div>
            </div>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: 'white' }}>99%</div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Hài lòng</div>
            </div>
          </div>
        </div>
      </div>

      {/* FORM SIDE */}
      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '1px', marginBottom: '0.2rem' }}>Đăng nhập</h1>
            <p className="text-muted text-sm">Chào mừng bạn trở lại! Vui lòng đăng nhập.</p>
          </div>

          <div id="alertBox" style={{ display: 'none' }} className="alert alert-danger">
            <i className="bi bi-exclamation-circle-fill"></i> <span id="alertMsg">Thông tin đăng nhập không chính xác</span>
          </div>

          <div className="form-group">
            <label className="form-label">Email *</label>
            <div className="input-icon-wrap">
              <i className="bi bi-envelope"></i>
              <input type="email" className="form-control" id="loginEmail" placeholder="email@example.com" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label flex-between">
              Mật khẩu *
              <Link to="#" className="form-link text-sm" style={{ fontWeight: 500 }}>Quên mật khẩu?</Link>
            </label>
            <div className="input-icon-wrap">
              <i className="bi bi-lock"></i>
              <input type="password" className="form-control" id="loginPw" placeholder="Nhập mật khẩu..." />
              <button className="toggle-pw"><i className="bi bi-eye"></i></button>
            </div>
          </div>

          <div className="flex-center" style={{ marginBottom: '1.5rem' }}>
            <input type="checkbox" id="remember" style={{ accentColor: 'var(--dark)', width: '15px', height: '15px' }} />
            <label htmlFor="remember" className="text-sm" style={{ cursor: 'pointer', marginLeft: '0.5rem' }}>Nhớ đăng nhập</label>
          </div>

          <button className="btn btn-primary btn-block btn-lg" onClick={(e) => e.preventDefault()}>
            <i className="bi bi-box-arrow-in-right"></i> ĐĂNG NHẬP
          </button>

          <div className="divider">hoặc tiếp tục với</div>

          <button className="social-btn">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Đăng nhập với Google
          </button>
          <button className="social-btn">
            <i className="bi bi-facebook" style={{ color: '#1877F2', fontSize: '1.1rem' }}></i>
            Đăng nhập với Facebook
          </button>

          <p className="text-sm text-muted" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            Chưa có tài khoản? <Link to="/register" className="form-link">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
