import { Link } from 'react-router-dom';
import { 
  CheckCircle, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  XCircle, 
  UserPlus 
} from 'lucide-react';

const RegisterPage = () => {
  return (
    <div className="auth-layout">
      {/* VISUAL SIDE */}
      <div className="auth-visual">
        <div className="auth-visual-img">
          <img src="https://images.unsplash.com/photo-1607082349566-187342175e2f?w=900&q=80" alt="" />
          <div className="auth-visual-overlay"></div>
        </div>
        <div className="auth-visual-content">
          <Link to="/" className="auth-visual-brand">Sprylo</Link>
        </div>

        <div className="auth-visual-content">
          <div style={{ fontSize: '2.8rem', fontWeight: 800, color: 'white', lineHeight: 1, letterSpacing: '0.5px' }}>
            GIA NHẬP<br/>CỘNG ĐỒNG <span style={{ color: 'var(--accent)' }}>SPRYLO</span>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.8rem' }}>
            Đăng ký miễn phí và nhận ngay voucher 100K cho đơn hàng đầu tiên.
          </p>
          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div className="flex-center text-sm" style={{ gap: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
              <CheckCircle size={14} className="text-success" /> Miễn phí đăng ký, không phí ẩn
            </div>
            <div className="flex-center text-sm" style={{ gap: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
              <CheckCircle size={14} className="text-success" /> Voucher 100K cho đơn đầu tiên
            </div>
            <div className="flex-center text-sm" style={{ gap: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
              <CheckCircle size={14} className="text-success" /> Theo dõi đơn hàng realtime
            </div>
            <div className="flex-center text-sm" style={{ gap: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
              <CheckCircle size={14} className="text-success" /> Lịch sử mua hàng đầy đủ
            </div>
          </div>
        </div>

      </div>

      {/* FORM SIDE */}
      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <div className="step-indicator">
            <div className="step-dot active" id="dot1"></div>
            <div className="step-dot" id="dot2"></div>
            <div className="step-dot" id="dot3"></div>
          </div>

          <div style={{ marginBottom: '1.8rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '0.2rem' }}>Tạo tài khoản</h1>
            <p className="text-muted text-sm">Điền đầy đủ thông tin để hoàn tất đăng ký.</p>
          </div>


          <div id="alertBox" className="alert alert-success" style={{ display: 'none', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={16} /> <span id="alertMsg"></span>
          </div>


          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Họ *</label>
              <div className="input-icon-wrap">
                <User size={18} className="bi icon-left" />
                <input type="text" className="form-control" id="lastName" placeholder="Nguyễn" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Tên *</label>
              <div className="input-icon-wrap">
                <User size={18} className="bi icon-left" />
                <input type="text" className="form-control" id="firstName" placeholder="Văn A" />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email *</label>
            <div className="input-icon-wrap">
              <Mail size={18} className="bi icon-left" />
              <input type="email" className="form-control" id="regEmail" placeholder="email@example.com" />
            </div>
            <div className="form-error" id="emailErr" style={{ display: 'none', alignItems: 'center', gap: '4px' }}><XCircle size={14} /> Email không hợp lệ</div>
          </div>


          <div className="form-group">
            <label className="form-label">Số điện thoại *</label>
            <div className="input-icon-wrap">
              <Phone size={18} className="bi icon-left" />
              <input type="tel" className="form-control" id="regPhone" placeholder="0912 345 678" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu *</label>
            <div className="input-icon-wrap">
              <Lock size={18} className="bi icon-left" />
              <input type="password" className="form-control" id="regPw" placeholder="Tối thiểu 8 ký tự" />
              <button className="toggle-pw"><Eye size={18} /></button>
            </div>
            <div className="strength-bar">
              <div className="strength-fill" id="strengthFill"></div>
            </div>
            <div id="strengthLabel" className="text-xs text-muted" style={{ marginTop: '0.2rem' }}></div>
          </div>

          <div className="form-group">
            <label className="form-label">Xác nhận mật khẩu *</label>
            <div className="input-icon-wrap">
              <Lock size={18} className="bi icon-left" />
              <input type="password" className="form-control" id="regPwConfirm" placeholder="Nhập lại mật khẩu" />
              <button className="toggle-pw"><Eye size={18} /></button>
            </div>
            <div className="form-error" id="pwMatchErr" style={{ display: 'none', alignItems: 'center', gap: '4px' }}><XCircle size={14} /> Mật khẩu không khớp</div>
          </div>


          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input type="checkbox" id="agree" style={{ accentColor: 'var(--dark)', width: '15px', height: '15px', marginTop: '2px', flexShrink: 0 }} />
            <label htmlFor="agree" className="text-sm text-muted" style={{ cursor: 'pointer' }}>
              Tôi đồng ý với <Link to="#" className="form-link">Điều khoản sử dụng</Link> và <Link to="#" className="form-link">Chính sách bảo mật</Link> của Sprylo
            </label>
          </div>


          <button className="btn btn-primary btn-block btn-lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={(e) => e.preventDefault()}>
            <UserPlus size={20} /> TẠO TÀI KHOẢN
          </button>


          <div className="divider">hoặc</div>

          <button className="btn btn-outline btn-block" style={{ color: 'var(--dark)', borderColor: 'var(--border)', gap: '0.6rem', padding: '0.65rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Đăng ký với Google
          </button>

          <p className="text-sm text-muted" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            Đã có tài khoản? <Link to="/login" className="form-link">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
