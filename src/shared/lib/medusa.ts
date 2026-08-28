import Medusa from '@medusajs/js-sdk';

// Lấy base URL của Medusa backend từ biến môi trường, hoặc dùng mặc định localhost:9000
const MEDUSA_BACKEND_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL || 'http://localhost:9000';

const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

const publishableKey = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || 'pk_a2f0825ab169a70b98f5a520693ca5e8e633f36c1b5dabd5548326c5451c4e6d';

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
    const res = await fetch(`${MEDUSA_BACKEND_URL}/admin/orders/${id}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ status, shipping_method: shippingMethod })
    });
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res.json();
  },
};
