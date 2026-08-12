/**
 * OAuthCallbackPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Trang trung gian nhận redirect từ Medusa backend sau khi OAuth thành công.
 *
 * Luồng:
 *   1. Backend OAuth callback → redirect về /auth/callback?token=JWT&_type=google|facebook
 *   2. Trang này đọc `token` từ URL query params
 *   3. Gọi /store/customers/me để lấy thông tin customer
 *   4. Nếu customer chưa tồn tại (404) → tạo mới customer
 *   5. Lưu token + customer_info vào localStorage
 *   6. Dispatch event để Header cập nhật trạng thái
 *   7. Redirect về trang gốc (hoặc /account)
 */
import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import '../styles/auth.css';
import { saveToken, TOKEN_KEY } from './LoginPage';
import { mergeCartOnLogin } from '../utils/cart';

const MEDUSA_BACKEND_URL =
  (import.meta as any).env?.VITE_MEDUSA_BACKEND_URL || 'http://localhost:9000';
const PUBLISHABLE_KEY =
  (import.meta as any).env?.VITE_MEDUSA_PUBLISHABLE_KEY ||
  'pk_d686a27bd027f5ca488190c17cd54313f3366b2d5b7d2f8e416d2225bd136483';

// ─────────────────────────────────────────────────────────────────────────────
const OAuthCallbackPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [status, setStatus]   = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Đang xác thực tài khoản...');
  const [provider, setProvider] = useState<'google' | 'facebook' | 'unknown'>('unknown');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token  = params.get('token');
    const code   = params.get('code');
    const state  = params.get('state');
    const errorMsg = params.get('error') || params.get('error_description');
    const type   = (params.get('_type') as any) ?? 'unknown';

    setProvider(type);

    // ── Xử lý lỗi do backend/OAuth provider trả về ──────────────────────────
    if (errorMsg) {
      setStatus('error');
      setMessage(decodeURIComponent(errorMsg));
      return;
    }

    if (!token && (!code || !state)) {
      setStatus('error');
      setMessage('Không nhận được token hoặc mã xác thực (code) từ nhà cung cấp. Vui lòng thử lại.');
      return;
    }

    // ── Bắt đầu flow xử lý token/code ────────────────────────────────────────────
    (async () => {
      try {
        let activeToken = token;

        // Nếu chỉ nhận được code và state, thực hiện trao đổi lấy token qua backend
        if (!activeToken && code && state) {
          setMessage('Đang kết nối với máy chủ để xác thực tài khoản...');
          
          // Gọi API callback của backend Medusa để xác thực
          const callbackRes = await fetch(
            `${MEDUSA_BACKEND_URL}/auth/customer/${type}/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
            {
              headers: {
                'x-publishable-api-key': PUBLISHABLE_KEY,
              },
            }
          );

          if (!callbackRes.ok) {
            const errData = await callbackRes.json().catch(() => ({}));
            throw new Error(errData.message || 'Xác thực tài khoản với backend thất bại.');
          }

          const callbackData = await callbackRes.json();
          activeToken = callbackData.token;

          if (!activeToken) {
            throw new Error('Không tìm thấy mã phiên làm việc trong kết quả trả về.');
          }
        }

        // 1. Lưu token tạm
        saveToken(activeToken!);

        // ── Lấy thông tin từ Custom Endpoint /custom/auth-identity ─────────
        let email = '';
        let firstName = '';
        let lastName = '';
        let customer: any = null;

        try {
          const authIdentityRes = await fetch(`${MEDUSA_BACKEND_URL}/custom/auth-identity`, {
            headers: {
              'x-publishable-api-key': PUBLISHABLE_KEY,
              Authorization: `Bearer ${activeToken}`,
            },
          });

          if (authIdentityRes.ok) {
            const authIdentityData = await authIdentityRes.json();
            const metadata = authIdentityData.auth_identity?.user_metadata || {};
            email = metadata.email || '';
            firstName = metadata.given_name || metadata.first_name || metadata.name || '';
            lastName = metadata.family_name || metadata.last_name || '';
            console.log('[OAuthCallbackPage] Lấy thông tin từ Custom API thành công:', { email, firstName, lastName });
            
            // Nếu backend tìm thấy customer trùng email và đã liên kết + cấp token mới:
            if (authIdentityData.customer && authIdentityData.token) {
              activeToken = authIdentityData.token;
              saveToken(activeToken);
              customer = authIdentityData.customer;
              setMessage('Liên kết tài khoản thành công!');
              console.log('[OAuthCallbackPage] Tự động liên kết với tài khoản có sẵn:', customer);
            }
          } else {
            console.warn('[OAuthCallbackPage] Custom API trả về lỗi, chuyển sang giải mã JWT token...');
          }
        } catch (e) {
          console.error('[OAuthCallbackPage] Lỗi khi gọi Custom API:', e);
        }

        // Dự phòng: Giải mã JWT token nếu Custom API không lấy được email
        if (!email) {
          try {
            const payloadBase64 = activeToken!.split('.')[1];
            const payloadJson = decodeURIComponent(
              atob(payloadBase64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            const payload = JSON.parse(payloadJson);
            console.log('[OAuthCallbackPage] Decoded JWT payload:', payload);

            email = payload.email || '';
            const metadata = payload.user_metadata || payload.app_metadata || payload;
            firstName = firstName || metadata.given_name || metadata.first_name || metadata.name || '';
            lastName = lastName || metadata.family_name || metadata.last_name || '';
          } catch (e) {
            console.error('[OAuthCallbackPage] Lỗi giải mã token dự phòng:', e);
          }
        }

        // 2. Thử lấy thông tin customer hiện tại (nếu chưa được liên kết ở bước trên)
        if (!customer) {
          const meRes = await fetch(`${MEDUSA_BACKEND_URL}/store/customers/me`, {
            headers: {
              'x-publishable-api-key': PUBLISHABLE_KEY,
              Authorization: `Bearer ${activeToken}`,
            },
          });

          if (meRes.ok) {
            // Customer đã tồn tại — liên kết với tài khoản này
            const data = await meRes.json();
            customer = data.customer;
            setMessage('Liên kết tài khoản thành công!');
          } else if (meRes.status === 404 || meRes.status === 401) {
          // Customer chưa tồn tại → tạo mới
          setMessage('Đang tạo tài khoản mới...');
          
          if (!email) {
            throw new Error('Không thể tìm thấy địa chỉ email từ tài khoản Google của bạn.');
          }

          const createRes = await fetch(`${MEDUSA_BACKEND_URL}/store/customers`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-publishable-api-key': PUBLISHABLE_KEY,
              Authorization: `Bearer ${activeToken}`,
            },
            body: JSON.stringify({
              email: email.trim(),
              first_name: firstName.trim() || 'Google',
              last_name: lastName.trim() || 'User',
            }),
          });

          if (createRes.ok) {
            const data = await createRes.json();
            customer = data.customer;
            setMessage('Tạo tài khoản thành công!');
          } else {
            const errData = await createRes.json().catch(() => ({}));
            console.error('[OAuthCallbackPage] Tạo customer thất bại:', errData);

            // Thử lại GET /me đề phòng race-condition
            const retryRes = await fetch(`${MEDUSA_BACKEND_URL}/store/customers/me`, {
              headers: {
                'x-publishable-api-key': PUBLISHABLE_KEY,
                Authorization: `Bearer ${activeToken}`,
              },
            });
            if (retryRes.ok) {
              const data = await retryRes.json();
              customer = data.customer;
            } else {
              throw new Error(
                errData?.message || 'Không thể tạo hồ sơ khách hàng trên hệ thống. Vui lòng liên hệ hỗ trợ.'
              );
            }
          }
        }
      }

        if (!customer) {
          throw new Error('Không thể lấy thông tin tài khoản sau khi xác thực.');
        }

        // 3. Lưu thông tin customer vào localStorage
        if (customer) {
          localStorage.setItem(
            'customer_info',
            JSON.stringify({
              id:         customer.id,
              email:      customer.email,
              first_name: customer.first_name,
              last_name:  customer.last_name,
              phone:      customer.phone,
            })
          );
          // Gộp giỏ hàng guest → tài khoản
          mergeCartOnLogin(customer.id);
        }

        // 4. Cập nhật Header
        window.dispatchEvent(new Event('customer-auth-change'));
        setStatus('success');
        setMessage('Đăng nhập thành công! Đang chuyển hướng...');

        // 5. Redirect về account sau 1.2s
        const returnTo = localStorage.getItem('oauth_return_to') ?? '/account';
        localStorage.removeItem('oauth_return_to');
        setTimeout(() => navigate(returnTo, { replace: true }), 1200);

      } catch (err: any) {
        localStorage.removeItem(TOKEN_KEY);
        setStatus('error');
        setMessage(err.message || 'Không thể kết nối đến máy chủ. Vui lòng thử lại.');
      }
    })();
  }, []);

  // ── Provider label + màu sắc ───────────────────────────────────────────────
  const providerLabel = provider === 'google'
    ? 'Google'
    : provider === 'facebook'
    ? 'Facebook'
    : 'mạng xã hội';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg, #f8f9fa)',
        fontFamily: 'Barlow, sans-serif',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '3rem 2.5rem',
          width: '100%',
          maxWidth: '420px',
          textAlign: 'center',
          boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
        }}
      >
        {/* ── Loading ── */}
        {status === 'loading' && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <Loader2
                size={48}
                style={{
                  animation: 'spin 1s linear infinite',
                  color: 'var(--dark, #111)',
                  margin: '0 auto',
                }}
              />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Đang xác thực {providerLabel}
            </h2>
            <p style={{ color: 'var(--gray, #666)', fontSize: '0.9rem' }}>{message}</p>
          </>
        )}

        {/* ── Success ── */}
        {status === 'success' && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <CheckCircle
                size={48}
                style={{ color: '#10b981', margin: '0 auto' }}
              />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Xác thực thành công!
            </h2>
            <p style={{ color: 'var(--gray, #666)', fontSize: '0.9rem' }}>{message}</p>
          </>
        )}

        {/* ── Error ── */}
        {status === 'error' && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <AlertCircle
                size={48}
                style={{ color: '#ef4444', margin: '0 auto' }}
              />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Đăng nhập thất bại
            </h2>
            <div
              className="alert alert-danger"
              style={{ textAlign: 'left', marginBottom: '1.5rem' }}
            >
              {message}
            </div>
            <Link
              to="/login"
              className="btn btn-primary btn-block"
              style={{ display: 'block', textDecoration: 'none' }}
            >
              Quay về trang đăng nhập
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
