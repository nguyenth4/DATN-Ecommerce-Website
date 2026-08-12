import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import '../styles/auth.css';
import { mergeCartOnLogin } from '../utils/cart';

const MEDUSA_BACKEND_URL =
  (import.meta as any).env?.VITE_MEDUSA_BACKEND_URL || 'http://localhost:9000';
const PUBLISHABLE_KEY =
  (import.meta as any).env?.VITE_MEDUSA_PUBLISHABLE_KEY ||
  'pk_d686a27bd027f5ca488190c17cd54313f3366b2d5b7d2f8e416d2225bd136483';

// ─── Token helpers ────────────────────────────────────────────────────────────
export const TOKEN_KEY = 'customer_token';
export const saveToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const getToken  = () => localStorage.getItem(TOKEN_KEY);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// ─── Component ────────────────────────────────────────────────────────────────
const LoginPage = () => {
  const navigate   = useNavigate();
  const location   = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');
  // where to go after login — default /account
  const from: string = redirectParam || (location.state as any)?.from?.pathname || '/account';
  const isCheckoutRedirect = from.includes('/checkout');

  // Form state
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [remember, setRemember] = useState(false);

  // UI state
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState('');
  const [emailErr, setEmailErr] = useState('');

  // ── Validate ───────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailErr('Email không hợp lệ');
      return false;
    }
    setEmailErr('');
    return true;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    if (!password) { setError('Vui lòng nhập mật khẩu.'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${MEDUSA_BACKEND_URL}/auth/customer/emailpass`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Handle common errors
        if (res.status === 401 || res.status === 400) {
          setError('Email hoặc mật khẩu không chính xác. Vui lòng thử lại.');
        } else if (res.status === 404) {
          setError('Tài khoản không tồn tại. Bạn chưa đăng ký?');
        } else {
          setError(body?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
        }
        setLoading(false);
        return;
      }

      const token: string = body?.token;
      if (!token) {
        setError('Máy chủ không trả về token. Vui lòng thử lại.');
        setLoading(false);
        return;
      }

      // ── Persist token ──────────────────────────────────────────────────────
      saveToken(token);

      // Fetch customer info để lưu tên (optional, dùng cho Header greeting)
      try {
        const meRes = await fetch(`${MEDUSA_BACKEND_URL}/store/customers/me`, {
          headers: {
            'x-publishable-api-key': PUBLISHABLE_KEY,
            Authorization: `Bearer ${token}`,
          },
        });
        if (meRes.ok) {
          const { customer } = await meRes.json();
          if (customer) {
            localStorage.setItem('customer_info', JSON.stringify({
              id:         customer.id,
              email:      customer.email,
              first_name: customer.first_name,
              last_name:  customer.last_name,
              phone:      customer.phone,
            }));
            // Gộp giỏ hàng guest vào tài khoản user
            mergeCartOnLogin(customer.id);
          }
        }
      } catch {
        // Non-critical — ignore
      }

      setSuccess(true);

      // Dispatch event để Header cập nhật trạng thái đăng nhập ngay lập tức
      window.dispatchEvent(new Event('customer-auth-change'));

      // Redirect
      setTimeout(() => navigate(from, { replace: true }), 1000);

    } catch {
      setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  // ── Social Login (Google / Facebook) ──────────────────────────────────────
  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    // Lưu trang mà user muốn đến trước khi rời đi
    localStorage.setItem('oauth_return_to', from);

    // Callback FE — trang trung gian nhận token sau OAuth
    const callbackUrl = `${window.location.origin}/auth/callback?_type=${provider}`;

    // Gọi backend để lấy redirect URL đến OAuth provider
    // Medusa trả về { location: "https://accounts.google.com/..." }
    fetch(`${MEDUSA_BACKEND_URL}/auth/customer/${provider}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ callback_url: callbackUrl }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.location) {
          // Redirect sang Google/Facebook OAuth consent screen
          window.location.href = data.location;
        } else {
          setError(
            `Không thể kết nối đến ${provider === 'google' ? 'Google' : 'Facebook'}. Vui lòng thử lại.`
          );
        }
      })
      .catch(() => {
        setError('Không thể kết nối đến máy chủ. Vui lòng thử lại.');
      });
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="auth-layout">
      {/* ── VISUAL SIDE ── */}
      <div className="auth-visual">
        <div className="auth-visual-img">
          <img
            src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=900&q=80"
            alt="Tech Gadgets"
          />
          <div className="auth-visual-overlay"></div>
        </div>

        <div className="auth-visual-content">
          <Link to="/" className="auth-visual-brand">Sprylo</Link>
        </div>

        <div className="auth-visual-content">
          <div className="auth-visual-quote">
            TRẢI NGHIỆM<br />MUA SẮM <em>ĐỈNH CAO</em>
          </div>
          <p className="auth-visual-sub">
            Hàng ngàn sản phẩm chính hãng, giao hàng nhanh toàn quốc.
          </p>
          <div className="flex-center" style={{ gap: '2rem', marginTop: '2rem' }}>
            {[
              { val: '50K+',  label: 'Khách hàng' },
              { val: '1.2M+', label: 'Đơn hàng'   },
              { val: '99%',   label: 'Hài lòng'   },
            ].map(({ val, label }) => (
              <div key={label}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>{val}</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FORM SIDE ── */}
      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '0.2rem' }}>
              Đăng nhập
            </h1>
            <p className="text-muted text-sm">Chào mừng bạn trở lại! Vui lòng đăng nhập.</p>
          </div>

          {/* Checkout redirect notice */}
          {isCheckoutRedirect && (
            <div
              className="alert alert-info"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '1.2rem',
                padding: '12px 16px',
                background: '#eef2ff',
                borderLeft: '4px solid #4f46e5',
                borderRadius: '8px',
                color: '#312e81'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.9rem' }}>
                <LogIn size={18} color="#4f46e5" />
                Vui lòng đăng nhập để tiến hành thanh toán đơn hàng
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#4338ca' }}>
                Đăng nhập để sử dụng địa chỉ giao hàng đã lưu và thanh toán an toàn.
              </p>
            </div>
          )}

          {/* Error alert */}
          {error && (
            <div
              className="alert alert-danger"
              style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '1.2rem' }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{error}</span>
            </div>
          )}

          {/* Success alert */}
          {success && (
            <div
              className="alert alert-success"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem' }}
            >
              <CheckCircle size={16} />
              <span>Đăng nhập thành công! Đang chuyển hướng...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email *</label>
              <div className="input-icon-wrap">
                <Mail size={18} className="bi" />
                <input
                  id="login-email"
                  type="email"
                  className={`form-control ${emailErr ? 'is-invalid' : ''}`}
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailErr(''); setError(''); }}
                  disabled={loading || success}
                  autoComplete="email"
                  required
                />
              </div>
              {emailErr && (
                <div className="form-error" style={{ marginTop: '4px' }}>
                  {emailErr}
                </div>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label flex-between" htmlFor="login-pw">
                Mật khẩu *
                <Link to="/forgot-password" className="form-link text-sm" style={{ fontWeight: 500 }}>
                  Quên mật khẩu?
                </Link>
              </label>
              <div className="input-icon-wrap">
                <Lock size={18} className="bi" />
                <input
                  id="login-pw"
                  type={showPw ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  disabled={loading || success}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setShowPw((v) => !v)}
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex-center" style={{ marginBottom: '1.5rem' }}>
              <input
                id="login-remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={loading || success}
                style={{ accentColor: 'var(--dark)', width: '15px', height: '15px' }}
              />
              <label
                htmlFor="login-remember"
                className="text-sm"
                style={{ cursor: 'pointer', marginLeft: '0.5rem' }}
              >
                Nhớ đăng nhập
              </label>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading || success}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: loading || success ? 0.75 : 1,
                cursor: loading || success ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  Đang xác thực...
                </>
              ) : success ? (
                <>
                  <CheckCircle size={20} /> Thành công!
                </>
              ) : (
                <>
                  <LogIn size={20} /> ĐĂNG NHẬP
                </>
              )}
            </button>
          </form>

          <div className="divider">hoặc tiếp tục với</div>

          <button
            id="btn-login-google"
            className="social-btn"
            onClick={() => handleSocialLogin('google')}
            type="button"
            disabled={loading || success}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Đăng nhập với Google
          </button>

          <button
            id="btn-login-facebook"
            className="social-btn"
            onClick={() => handleSocialLogin('facebook')}
            type="button"
            disabled={loading || success}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Đăng nhập với Facebook
          </button>

          <p className="text-sm text-muted" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            Chưa có tài khoản?{' '}
            <Link to="/register" className="form-link">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
