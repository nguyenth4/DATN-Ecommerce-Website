const MEDUSA_BACKEND_URL =
  (import.meta as any).env?.VITE_MEDUSA_BACKEND_URL || 'http://localhost:9000';
const PUBLISHABLE_KEY =
  (import.meta as any).env?.VITE_MEDUSA_PUBLISHABLE_KEY ||
  'pk_a2f0825ab169a70b98f5a520693ca5e8e633f36c1b5dabd5548326c5451c4e6d';

export const TOKEN_KEY = 'customer_token';
export const INFO_KEY = 'customer_info';

// Parse JWT token helper
export function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export const authService = {
  // Clear local session & trigger layout reload
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(INFO_KEY);
    localStorage.removeItem('sprylo_orders');
    window.dispatchEvent(new Event('customer-auth-change'));
    // Redirect to login page
    window.location.href = '/login';
  },

  // Check if JWT is expired or will expire in 2 minutes
  isTokenExpired(token: string): boolean {
    const payload = parseJwt(token);
    if (!payload || !payload.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    // Buffer of 120 seconds to trigger proactive refresh before real expiry
    return payload.exp - now < 120;
  },

  // Call Medusa v2 token refresh API
  async refreshAccessToken(token: string): Promise<string | null> {
    try {
      const res = await fetch(`${MEDUSA_BACKEND_URL}/auth/token/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': PUBLISHABLE_KEY,
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.warn('Session refresh failed: response status', res.status);
        return null;
      }

      const data = await res.json();
      if (data?.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        return data.token;
      }
      return null;
    } catch (err) {
      console.error('Network error during session refresh:', err);
      return null;
    }
  },

  // Get active valid token (auto refresh if expired)
  async getValidToken(): Promise<string | null> {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    if (this.isTokenExpired(token)) {
      console.log('Session token expired or expiring soon, refreshing...');
      const newToken = await this.refreshAccessToken(token);
      if (newToken) {
        return newToken;
      } else {
        console.warn('Failed to refresh token, logging out user.');
        this.logout();
        return null;
      }
    }
    return token;
  },

  // Custom fetch client with auth injection, refresh capability, and automatic 401 logout
  async authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getValidToken();

    const headers = new Headers(options.headers || {});
    headers.set('x-publishable-api-key', PUBLISHABLE_KEY);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const res = await fetch(url, config);

      if (res.status === 401) {
        // Double check token validity in case of server side cancellation
        console.warn('Unauthorized request, logging out.');
        this.logout();
      }

      return res;
    } catch (err) {
      console.error('Request failed:', err);
      throw err;
    }
  },
};
