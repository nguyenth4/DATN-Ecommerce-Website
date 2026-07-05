const API_URL = 'http://localhost:9000/store';

export const walletService = {
  async getWallet(customerId?: string) {
    const query = customerId ? `?customer_id=${customerId}` : '';
    const response = await fetch(`${API_URL}/wallet${query}`);
    if (!response.ok) throw new Error('Lỗi khi tải thông tin ví');
    return response.json();
  },

  async checkout(orderData: any) {
    const response = await fetch(`${API_URL}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!response.ok) throw new Error('Lỗi thanh toán');
    return response.json();
  },

  async topupMock(amount: number, customerId?: string) {
    const response = await fetch(`${API_URL}/wallet/mock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, customer_id: customerId })
    });
    return response.json();
  }
};
