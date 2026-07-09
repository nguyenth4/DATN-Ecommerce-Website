import Medusa from '@medusajs/js-sdk';

// Lấy base URL của Medusa backend từ biến môi trường, hoặc dùng mặc định localhost:9000
const MEDUSA_BACKEND_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL || 'http://localhost:9000';

const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

const publishableKey = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || 'pk_d686a27bd027f5ca488190c17cd54313f3366b2d5b7d2f8e416d2225bd136483';

export const medusa = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: import.meta.env.DEV,
  publishableKey,
  auth: {
    type: 'jwt',
  },
  globalHeaders: {
    'x-publishable-api-key': publishableKey,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  },
});

export const adminOrders = {
  /** Get list of orders with optional pagination and status filter */
  async list(params: { limit?: number; offset?: number; status?: string }) {
    const response = await medusa.admin.order.list(params);
    return response;
  },

  /** Get a single order by ID */
  async retrieve(id: string) {
    const response = await medusa.admin.order.retrieve(id);
    return response;
  },

  /** Update order status and optionally set shipping method */
  async updateStatus(id: string, status: string, shippingMethod?: string) {
    const payload: any = { status };
    if (shippingMethod) payload.metadata = { shipping_method: shippingMethod };
    const response = await medusa.admin.order.update(id, payload);
    return response;
  },
};
