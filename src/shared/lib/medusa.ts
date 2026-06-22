import Medusa from '@medusajs/js-sdk';

// Lấy base URL của Medusa backend từ biến môi trường, hoặc dùng mặc định localhost:9000
const MEDUSA_BACKEND_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL || 'http://localhost:9000';

const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

export const medusa = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: import.meta.env.DEV,
  publishableKey: import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || 'pk_d686a27bd027f5ca488190c17cd54313f3366b2d5b7d2f8e416d2225bd136483',
  auth: {
    type: 'jwt',
  },
  globalHeaders: token ? {
    Authorization: `Bearer ${token}`,
  } : undefined,
});
