import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medusa } from '../../shared/lib/medusa';

const CART_KEY = 'medusa_cart_id';

export const cartService = {
  getCartId() {
    return localStorage.getItem(CART_KEY);
  },

  setCartId(id: string) {
    localStorage.setItem(CART_KEY, id);
  },

  async createCart() {
    const { cart } = await medusa.store.cart.create({});
    this.setCartId(cart.id);
    return cart;
  },

  async getCart() {
    let cartId = this.getCartId();
    if (!cartId) {
      const cart = await this.createCart();
      return cart;
    }
    try {
      const { cart } = await medusa.store.cart.retrieve(cartId);
      return cart;
    } catch (error) {
      console.error('Lỗi khi lấy giỏ hàng, đang tạo giỏ mới:', error);
      const cart = await this.createCart();
      return cart;
    }
  },

  async addToCart(variantId: string, quantity: number = 1) {
    let cartId = this.getCartId();
    if (!cartId) {
      const cart = await this.createCart();
      cartId = cart.id;
    }
    return await medusa.store.cart.createLineItem(cartId!, {
      variant_id: variantId,
      quantity,
    });
  },

  async updateLineItem(lineId: string, quantity: number) {
    const cartId = this.getCartId();
    if (!cartId) return null;
    return await medusa.store.cart.updateLineItem(cartId, lineId, {
      quantity,
    });
  },

  async removeLineItem(lineId: string) {
    const cartId = this.getCartId();
    if (!cartId) return null;
    return await medusa.store.cart.deleteLineItem(cartId, lineId);
  }
};

// --- REACT QUERY HOOKS ---

export const useCart = () => {
  return useQuery({
    queryKey: ['cart'],
    queryFn: () => cartService.getCart(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ variantId, quantity }: { variantId: string, quantity: number }) => 
      cartService.addToCart(variantId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useUpdateLineItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lineId, quantity }: { lineId: string, quantity: number }) => 
      cartService.updateLineItem(lineId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useRemoveLineItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lineId: string) => cartService.removeLineItem(lineId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};
