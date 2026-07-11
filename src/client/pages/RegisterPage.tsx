import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  XCircle,
  UserPlus,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import '../styles/auth.css';

const MEDUSA_BACKEND_URL =
  (import.meta as any).env?.VITE_MEDUSA_BACKEND_URL || 'http://localhost:9000';
const PUBLISHABLE_KEY =
  (import.meta as any).env?.VITE_MEDUSA_PUBLISHABLE_KEY ||
  'pk_d686a27bd027f5ca488190c17cd54313f3366b2d5b7d2f8e416d2225bd136483';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const validatePhone = (v: string) => /^(0|\+84)[0-9]{8,10}$/.test(v.replace(/\s/g, ''));

type Strength = { score: number; label: string; color: string };
const getStrength = (pw: string): Strength => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map: Strength[] = [
    { score: 0, label: '', color: 'transparent' },
    { score: 1, label: 'Yếu', color: '#ef4444' },
    { score: 2, label: 'Trung bình', color: '#f59e0b' },
    { score: 3, label: 'Khá', color: '#3b82f6' },
    { score: 4, label: 'Mạnh', color: '#10b981' },
  ];
  return map[score] || map[0];
};

// ─── Component ────────────────────────────────────────────────────────────────
const RegisterPage = () => {
  const navigate = useNavigate();

  // Form fields
  const [lastName, setLastName] = useState('');    // Họ
  const [firstName, setFirstName] = useState(''); // Tên
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);

  // UI states
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validation errors
  const [emailErr, setEmailErr] = useState('');
  const [phoneErr, setPhoneErr] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [confirmErr, setConfirmErr] = useState('');
  const [agreeErr, setAgreeErr] = useState('');

  // Alert
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const strength = getStrength(password);

  // ── Validate ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    let ok = true;

    if (!validateEmail(email)) {
      setEmailErr('Email không hợp lệ');
      ok = false;
    } else {
      setEmailErr('');
    }

    if (!validatePhone(phone)) {
      setPhoneErr('Số điện thoại không hợp lệ (VD: 0912345678)');
      ok = false;
    } else {
      setPhoneErr('');
    }

    if (password.length < 8) {
      setPwErr('Mật khẩu tối thiểu 8 ký tự');
      ok = false;
    } else {
      setPwErr('');
    }

    if (confirm !== password) {
      setConfirmErr('Mật khẩu xác nhận không khớp');
      ok = false;
    } else {
      setConfirmErr('');
    }

    if (!agree) {
      setAgreeErr('Bạn cần đồng ý với điều khoản sử dụng');
      ok = false;
    } else {
      setAgreeErr('');
    }

    return ok;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!validate()) return;
    if (!lastName.trim() || !firstName.trim()) {
      setAlert({ type: 'error', msg: 'Vui lòng nhập đầy đủ họ và tên.' });
      return;
    }

    setLoading(true);
    try {
      // Step 1: Register auth identity with Medusa v2
      const registerRes = await fetch(`${MEDUSA_BACKEND_URL}/auth/customer/emailpass/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!registerRes.ok) {
        const errData = await registerRes.json().catch(() => ({}));
        let msg = errData?.message || '';
        if (msg.includes('Identity with email already exists') || registerRes.status === 409) {
          msg = 'Email này đã được đăng ký. Vui lòng dùng email khác hoặc đăng nhập.';
        } else if (!msg) {
          msg = 'Đăng ký thất bại. Vui lòng thử lại.';
        }
        setAlert({ type: 'error', msg });
        setLoading(false);
        return;
      }

      const { token } = await registerRes.json();

      // Step 2: Create customer profile
      const customerRes = await fetch(`${MEDUSA_BACKEND_URL}/store/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': PUBLISHABLE_KEY,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone: phone.replace(/\s/g, ''),
        }),
      });

      if (!customerRes.ok) {
        const errData = await customerRes.json().catch(() => ({}));
        setAlert({
          type: 'error',
          msg: errData?.message || 'Tạo hồ sơ khách hàng thất bại. Vui lòng thử lại.',
        });
        setLoading(false);
        return;
      }

      // Success!
      setAlert({
        type: 'success',
        msg: '🎉 Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản, sau đó đăng nhập.',
      });

      // Redirect after 2.5s
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      console.error('Register error:', err);
      setAlert({
        type: 'error',
        msg: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.',
      });
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="auth-layout">
      {/* ── VISUAL SIDE ── */}
      <div className="auth-visual">
        <div className="auth-visual-img">
          <img
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=80"
            alt="Tech Studio Headphones"
          />
          <div className="auth-visual-overlay"></div>
        </div>

        <div className="auth-visual-content">
          <Link to="/" className="auth-visual-brand">Sprylo</Link>
        </div>

        <div className="auth-visual-content">
          <div style={{ fontSize: '2.8rem', fontWeight: 800, color: 'white', lineHeight: 1, letterSpacing: '0.5px' }}>
            GIA NHẬP<br />CỘNG ĐỒNG <span style={{ color: 'var(--accent)' }}>SPRYLO</span>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.8rem' }}>
            Đăng ký miễn phí và nhận ngay voucher 100K cho đơn hàng đầu tiên.
          </p>
          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {[
              'Miễn phí đăng ký, không phí ẩn',
              'Voucher 100K cho đơn đầu tiên',
              'Theo dõi đơn hàng realtime',
              'Lịch sử mua hàng đầy đủ',
            ].map((text) => (
              <div
                key={text}
                className="flex-center text-sm"
                style={{ gap: '0.8rem', color: 'rgba(255,255,255,0.7)' }}
              >
                <CheckCircle size={14} className="text-success" /> {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FORM SIDE ── */}
      <div className="auth-form-side">
        <div className="auth-form-wrap">

          {/* Step indicator */}
          <div className="step-indicator">
            <div className={`step-dot ${!alert?.type || alert.type === 'error' ? 'active' : 'done'}`} />
            <div className={`step-dot ${alert?.type === 'success' ? 'active' : ''}`} />
          </div>

          <div style={{ marginBottom: '1.8rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '0.2rem' }}>
              Tạo tài khoản
            </h1>
            <p className="text-muted text-sm">Điền đầy đủ thông tin để hoàn tất đăng ký.</p>
          </div>

          {/* Alert */}
          {alert && (
            <div
              className={`alert ${alert.type === 'success' ? 'alert-success' : 'alert-danger'}`}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '1.2rem' }}
            >
              {alert.type === 'success'
                ? <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                : <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />}
              <span>{alert.msg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            {/* Họ / Tên */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Họ <span style={{ color: 'var(--rose)' }}>*</span></label>
                <div className="input-icon-wrap">
                  <User size={18} className="bi icon-left" />
                  <input
                    id="reg-lastName"
                    type="text"
                    className="form-control"
                    placeholder="Nguyễn"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Tên <span style={{ color: 'var(--rose)' }}>*</span></label>
                <div className="input-icon-wrap">
                  <User size={18} className="bi icon-left" />
                  <input
                    id="reg-firstName"
                    type="text"
                    className="form-control"
                    placeholder="Văn A"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email <span style={{ color: 'var(--rose)' }}>*</span></label>
              <div className="input-icon-wrap">
                <Mail size={18} className="bi icon-left" />
                <input
                  id="reg-email"
                  type="email"
                  className={`form-control ${emailErr ? 'is-invalid' : ''}`}
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailErr(''); }}
                  disabled={loading}
                  required
                />
              </div>
              {emailErr && (
                <div className="form-error" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <XCircle size={14} /> {emailErr}
                </div>
              )}
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label">Số điện thoại <span style={{ color: 'var(--rose)' }}>*</span></label>
              <div className="input-icon-wrap">
                <Phone size={18} className="bi icon-left" />
                <input
                  id="reg-phone"
                  type="tel"
                  className={`form-control ${phoneErr ? 'is-invalid' : ''}`}
                  placeholder="0912 345 678"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setPhoneErr(''); }}
                  disabled={loading}
                  required
                />
              </div>
              {phoneErr && (
                <div className="form-error" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <XCircle size={14} /> {phoneErr}
                </div>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Mật khẩu <span style={{ color: 'var(--rose)' }}>*</span></label>
              <div className="input-icon-wrap">
                <Lock size={18} className="bi icon-left" />
                <input
                  id="reg-password"
                  type={showPw ? 'text' : 'password'}
                  className={`form-control ${pwErr ? 'is-invalid' : ''}`}
                  placeholder="Tối thiểu 8 ký tự"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPwErr(''); }}
                  disabled={loading}
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

              {/* Strength bar */}
              {password && (
                <>
                  <div className="strength-bar" style={{ marginTop: '6px' }}>
                    <div
                      className="strength-fill"
                      style={{
                        width: `${(strength.score / 4) * 100}%`,
                        background: strength.color,
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted" style={{ marginTop: '3px' }}>
                    Độ mạnh:{' '}
                    <span style={{ color: strength.color, fontWeight: 600 }}>{strength.label}</span>
                    <span style={{ color: 'var(--fg-mute)' }}>
                      {' '}— gồm hoa, số, ký tự đặc biệt để mạnh hơn
                    </span>
                  </div>
                </>
              )}

              {pwErr && (
                <div className="form-error" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <XCircle size={14} /> {pwErr}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu <span style={{ color: 'var(--rose)' }}>*</span></label>
              <div className="input-icon-wrap">
                <Lock size={18} className="bi icon-left" />
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  className={`form-control ${confirmErr ? 'is-invalid' : confirm && confirm === password ? 'is-valid' : ''}`}
                  placeholder="Nhập lại mật khẩu"
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setConfirmErr(''); }}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setShowConfirm((v) => !v)}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmErr && (
                <div className="form-error" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <XCircle size={14} /> {confirmErr}
                </div>
              )}
              {confirm && confirm === password && !confirmErr && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '0.8rem', color: 'var(--success)' }}>
                  <CheckCircle size={14} /> Mật khẩu khớp
                </div>
              )}
            </div>

            {/* Terms */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <input
                  id="reg-agree"
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => { setAgree(e.target.checked); setAgreeErr(''); }}
                  disabled={loading}
                  style={{ accentColor: 'var(--dark)', width: '15px', height: '15px', marginTop: '2px', flexShrink: 0 }}
                />
                <label htmlFor="reg-agree" className="text-sm text-muted" style={{ cursor: 'pointer' }}>
                  Tôi đồng ý với{' '}
                  <Link to="#" className="form-link">Điều khoản sử dụng</Link> và{' '}
                  <Link to="#" className="form-link">Chính sách bảo mật</Link> của Sprylo
                </label>
              </div>
              {agreeErr && (
                <div className="form-error" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                  <XCircle size={14} /> {agreeErr}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              id="reg-submit"
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading || alert?.type === 'success'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: loading || alert?.type === 'success' ? 0.75 : 1,
                cursor: loading || alert?.type === 'success' ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  Đang xử lý...
                </>
              ) : alert?.type === 'success' ? (
                <>
                  <CheckCircle size={20} /> Đăng ký thành công!
                </>
              ) : (
                <>
                  <UserPlus size={20} /> TẠO TÀI KHOẢN
                </>
              )}
            </button>
          </form>

          <div className="divider">hoặc</div>

          <button
            className="btn btn-outline btn-block"
            style={{ color: 'var(--dark)', borderColor: 'var(--border)', gap: '0.6rem', padding: '0.65rem' }}
            onClick={() => setAlert({ type: 'error', msg: 'Đăng ký bằng Google chưa được hỗ trợ. Vui lòng dùng email.' })}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Đăng ký với Google
          </button>

          <p className="text-sm text-muted" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            Đã có tài khoản?{' '}
            <Link to="/login" className="form-link">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
