const backendUrl = (import.meta as any).env?.VITE_MEDUSA_BACKEND_URL || 'http://localhost:9000';
const API_URL = `${backendUrl}/store`;

const PUBLISHABLE_KEY =
  (import.meta as any).env?.VITE_MEDUSA_PUBLISHABLE_KEY ||
  'pk_d686a27bd027f5ca488190c17cd54313f3366b2d5b7d2f8e416d2225bd136483';

const defaultHeaders = () => ({
  'Content-Type': 'application/json',
  'x-publishable-api-key': PUBLISHABLE_KEY,
});

export const walletService = {
  async getWallet(customerId?: string) {
    const query = customerId ? `?customer_id=${customerId}` : '';
    const response = await fetch(`${API_URL}/wallet${query}`, {
      headers: defaultHeaders(),
    });
    if (!response.ok) throw new Error('Lỗi khi tải thông tin ví');
    return response.json();
  },

  async checkout(orderData: any) {
    const response = await fetch(`${API_URL}/checkout`, {
      method: 'POST',
      headers: defaultHeaders(),
      body: JSON.stringify(orderData)
    });
    if (!response.ok) throw new Error('Lỗi thanh toán');
    return response.json();
  },

  async topupMock(amount: number, customerId?: string) {
    const response = await fetch(`${API_URL}/wallet/mock`, {
      method: 'POST',
      headers: defaultHeaders(),
      body: JSON.stringify({ amount, customer_id: customerId })
    });
    return response.json();
  }
};
