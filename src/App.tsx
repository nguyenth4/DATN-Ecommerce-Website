import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ClientRoutes from './client/routes/index';
import { ThemeProvider } from './shared/components/ThemeProvider';
import toast, { Toaster } from 'react-hot-toast';
import './client/styles/custom.css';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AdminSyncHandler() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin_sync') === 'true') {
      const backendUrl = (import.meta as any).env?.VITE_MEDUSA_BACKEND_URL || 'http://localhost:9000';
      const publishableKey = (import.meta as any).env?.VITE_MEDUSA_PUBLISHABLE_KEY || 'pk_d686a27bd027f5ca488190c17cd54313f3366b2d5b7d2f8e416d2225bd136483';

      // Clean query parameter from address bar
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState(null, '', newUrl);

      // Perform automatic authentication for Admin account (sprylo123@gmail.com)
      fetch(`${backendUrl}/auth/customer/emailpass`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': publishableKey,
        },
        body: JSON.stringify({
          email: 'sprylo123@gmail.com',
          password: '@dmin12345678',
        }),
      })
        .then((res) => res.json())
        .then(async (body) => {
          if (body?.token) {
            localStorage.setItem('customer_token', body.token);

            const backendUrlInner = backendUrl;
            const publishableKeyInner = publishableKey;

            try {
              // 1. Fetch customer profile
              const meRes = await fetch(`${backendUrlInner}/store/customers/me`, {
                headers: {
                  'x-publishable-api-key': publishableKeyInner,
                  Authorization: `Bearer ${body.token}`,
                },
              });

              let avatarUrl = '';

              // 2. Also fetch auth-identity to get avatar from provider metadata
              try {
                const authRes = await fetch(`${backendUrlInner}/store/custom/auth-identity`, {
                  headers: {
                    'x-publishable-api-key': publishableKeyInner,
                    Authorization: `Bearer ${body.token}`,
                  },
                });
                if (authRes.ok) {
                  const authData = await authRes.json();
                  avatarUrl =
                    authData.customer?.avatar_url ||
                    authData.customer?.metadata?.avatar_url ||
                    authData.auth_identity?.user_metadata?.picture ||
                    authData.auth_identity?.user_metadata?.avatar_url ||
                    '';
                }
              } catch (_) {
                // non-critical
              }

              if (meRes.ok) {
                const { customer } = await meRes.json();
                if (customer) {
                  const finalAvatar =
                    avatarUrl ||
                    customer.avatar_url ||
                    customer.metadata?.avatar_url ||
                    '';

                  localStorage.setItem(
                    'customer_info',
                    JSON.stringify({
                      id: customer.id,
                      email: customer.email,
                      first_name: customer.first_name || 'Sprylo',
                      last_name: customer.last_name || 'Admin',
                      phone: customer.phone,
                      avatar_url: finalAvatar,
                      metadata: { ...(customer.metadata || {}), avatar_url: finalAvatar },
                    })
                  );
                }
              }
            } catch (err) {
              console.error('Failed to fetch admin customer profile:', err);
            }

            window.dispatchEvent(new Event('customer-auth-change'));
            toast.success('Đã đồng bộ đăng nhập tài khoản Admin (sprylo123@gmail.com)');
          }
        })
        .catch((err) => {
          console.error('Admin sync authentication failed:', err);
        });
    }
  }, [location]);

  return null;
}

function App() {
  return (
    <ThemeProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--paper)',
            color: 'var(--ink)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
          }
        }}
      />
      <ScrollToTop />
      <AdminSyncHandler />
      <Routes>
        <Route path="/*" element={<ClientRoutes />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
