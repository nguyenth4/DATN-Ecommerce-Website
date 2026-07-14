import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import '../styles/auth.css';

const MEDUSA_BACKEND_URL =
  (import.meta as any).env?.VITE_MEDUSA_BACKEND_URL || 'http://localhost:9000';
const PUBLISHABLE_KEY =
  (import.meta as any).env?.VITE_MEDUSA_PUBLISHABLE_KEY ||
  'pk_d686a27bd027f5ca488190c17cd54313f3366b2d5b7d2f8e416d2225bd136483';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  // Form state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [passErr, setPassErr] = useState('');
  const [confirmPassErr, setConfirmPassErr] = useState('');

  useEffect(() => {
    if (!token || !email) {
      setError('Đường dẫn đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
    }
  }, [token, email]);

  const validate = (): boolean => {
    let isValid = true;

    if (password.length < 6) {
      setPassErr('Mật khẩu phải có ít nhất 6 ký tự');
      isValid = false;
    } else {
      setPassErr('');
    }

    if (password !== confirmPassword) {
      setConfirmPassErr('Mật khẩu xác nhận không khớp');
      isValid = false;
    } else {
      setConfirmPassErr('');
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token || !email) {
      setError('Yêu cầu đặt lại mật khẩu không hợp lệ.');
      return;
    }

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch(`${MEDUSA_BACKEND_URL}/auth/customer/emailpass/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': PUBLISHABLE_KEY,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.message || 'Không thể cập nhật mật khẩu. Vui lòng kiểm tra lại liên kết hoặc thử lại.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
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
            THIẾT LẬP<br />MẬT KHẨU <em>MỚI</em>
          </div>
          <p className="auth-visual-sub">
            Vui lòng nhập mật khẩu mới và bảo mật để tiếp tục mua sắm tại Sprylo.
          </p>
        </div>
      </div>

      {/* ── FORM SIDE ── */}
      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '0.2rem' }}>
              Đặt lại mật khẩu
            </h1>
            {email && (
              <p className="text-muted text-sm">
                Thiết lập mật khẩu mới cho tài khoản <strong>{email}</strong>
              </p>
            )}
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
          {success && (
            <div
              className="alert alert-success"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem' }}
            >
              <CheckCircle size={16} />
              <span>Đặt lại mật khẩu thành công! Đang chuyển hướng...</span>
            </div>
          )}

          {(!token || !email) ? (
            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/forgot-password" className="btn btn-primary btn-block">
                Yêu cầu liên kết mới
              </Link>
              <p className="text-sm text-muted" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <Link to="/login" className="form-link">
                  Quay lại đăng nhập
                </Link>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {/* New Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="new-pw">Mật khẩu mới *</label>
                <div className="input-icon-wrap">
                  <Lock size={18} className="bi" />
                  <input
                    id="new-pw"
                    type={showPw ? 'text' : 'password'}
                    className={`form-control ${passErr ? 'is-invalid' : ''}`}
                    placeholder="Nhập mật khẩu mới..."
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setPassErr(''); setError(''); }}
                    disabled={loading || success}
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
                {passErr && (
                  <div className="form-error" style={{ marginTop: '4px' }}>
                    {passErr}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="confirm-pw">Xác nhận mật khẩu mới *</label>
                <div className="input-icon-wrap">
                  <Lock size={18} className="bi" />
                  <input
                    id="confirm-pw"
                    type={showConfirmPw ? 'text' : 'password'}
                    className={`form-control ${confirmPassErr ? 'is-invalid' : ''}`}
                    placeholder="Nhập lại mật khẩu mới..."
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setConfirmPassErr(''); setError(''); }}
                    disabled={loading || success}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-pw"
                    onClick={() => setShowConfirmPw((v) => !v)}
                    tabIndex={-1}
                  >
                    {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassErr && (
                  <div className="form-error" style={{ marginTop: '4px' }}>
                    {confirmPassErr}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                id="reset-submit"
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
                  marginTop: '1.5rem'
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    Đang thiết lập lại...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle size={20} /> Đã đặt lại!
                  </>
                ) : (
                  'ĐẶT LẠI MẬT KHẨU'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
