import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import '../styles/auth.css';

const MEDUSA_BACKEND_URL =
  (import.meta as any).env?.VITE_MEDUSA_BACKEND_URL || 'http://localhost:9000';
const PUBLISHABLE_KEY =
  (import.meta as any).env?.VITE_MEDUSA_PUBLISHABLE_KEY ||
  'pk_d686a27bd027f5ca488190c17cd54313f3366b2d5b7d2f8e416d2225bd136483';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [emailErr, setEmailErr] = useState('');

  const validate = (): boolean => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailErr('Email không hợp lệ');
      return false;
    }
    setEmailErr('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch(`${MEDUSA_BACKEND_URL}/auth/customer/emailpass/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ identifier: email.trim() }),
      });

      if (!res.ok) {
        if (res.status === 404) {
          setError('Tài khoản không tồn tại trong hệ thống.');
        } else {
          setError('Có lỗi xảy ra khi yêu cầu đặt lại mật khẩu. Vui lòng thử lại.');
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
    } finally {
      setLoading(false);
    }
  };

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
            BẢO MẬT &<br />ĐÁNG <em>TIN CẬY</em>
          </div>
          <p className="auth-visual-sub">
            Yêu cầu đặt lại mật khẩu an toàn, nhanh chóng bằng email xác nhận.
          </p>
        </div>
      </div>

      {/* ── FORM SIDE ── */}
      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <div style={{ marginBottom: '2rem' }}>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--gray)',
                fontSize: '0.875rem',
                textDecoration: 'none',
                fontWeight: 500,
                marginBottom: '1rem',
              }}
              className="hover-dark"
            >
              <ArrowLeft size={16} /> Quay lại đăng nhập
            </Link>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '0.2rem' }}>
              Quên mật khẩu?
            </h1>
            <p className="text-muted text-sm">Nhập email của bạn để nhận liên kết đặt lại mật khẩu.</p>
          </div>

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
          {success ? (
            <div className="text-center" style={{ padding: '2rem 0' }}>
              <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: '#d1fae5', color: '#10b981', marginBottom: '1rem' }}>
                <CheckCircle size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Đã gửi yêu cầu!</h3>
              <p className="text-muted text-sm" style={{ lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Chúng tôi đã gửi một email đặt lại mật khẩu đến <strong>{email}</strong>. Vui lòng kiểm tra hộp thư đến (và thư rác) của bạn.
              </p>
              <Link to="/login" className="btn btn-primary btn-block">
                Quay lại đăng nhập
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">Email đăng ký *</label>
                <div className="input-icon-wrap">
                  <Mail size={18} className="bi" />
                  <input
                    id="forgot-email"
                    type="email"
                    className={`form-control ${emailErr ? 'is-invalid' : ''}`}
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailErr(''); setError(''); }}
                    disabled={loading}
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

              {/* Submit */}
              <button
                id="forgot-submit"
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: loading ? 0.75 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: '1.5rem'
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    Đang gửi yêu cầu...
                  </>
                ) : (
                  'GỬI YÊU CẦU'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
