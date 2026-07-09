import { showToast } from './compare';

const CART_KEY = 'sprylo_cart';

export interface CartItem {
  id: string; // Variant ID
  productId: string;
  name: string;
  variant: string; // e.g. "Titan Trắng · 512GB"
  price: number;
  qty: number;
  img: string; // Unsplash image string or full URL
  weight?: number;
  height?: number;
  length?: number;
  width?: number;
}

export const getActiveCartKey = (): string => {
  try {
    const info = localStorage.getItem('customer_info');
    if (info) {
      const customer = JSON.parse(info);
      if (customer && customer.id) {
        return `${CART_KEY}_${customer.id}`;
      }
    }
  } catch (e) {
    // Ignore error
  }
  return CART_KEY;
};

export const getCart = (): CartItem[] => {
  try {
    const list = localStorage.getItem(getActiveCartKey());
    return list ? JSON.parse(list) : [];
  } catch (e) {
    return [];
  }
};

export const saveCart = (cart: CartItem[]) => {
  localStorage.setItem(getActiveCartKey(), JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-updated'));
};

export const addToCart = (item: CartItem) => {
  const cart = getCart();
  const existing = cart.find(i => i.id === item.id);
  if (existing) {
    existing.qty += item.qty;
  } else {
    cart.push(item);
  }
  saveCart(cart);
  showToast(`Đã thêm ${item.name} vào giỏ hàng`, 'success');
};

export const updateCartQty = (id: string, qty: number) => {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty = Math.max(1, qty);
    saveCart(cart);
  }
};

export const removeFromCart = (id: string) => {
  const cart = getCart();
  const filtered = cart.filter(i => i.id !== id);
  saveCart(filtered);
  showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'success');
};

export const clearCart = () => {
  localStorage.removeItem(getActiveCartKey());
  window.dispatchEvent(new Event('cart-updated'));
};

export const getCartCount = (): number => {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.qty, 0);
};

export const mergeCartOnLogin = (customerId: string) => {
  try {
    const guestCartRaw = localStorage.getItem(CART_KEY);
    const guestCart: CartItem[] = guestCartRaw ? JSON.parse(guestCartRaw) : [];

    if (guestCart.length > 0) {
      const userCartKey = `${CART_KEY}_${customerId}`;
      const userCartRaw = localStorage.getItem(userCartKey);
      const userCart: CartItem[] = userCartRaw ? JSON.parse(userCartRaw) : [];

      const mergedCart = [...userCart];
      guestCart.forEach((guestItem) => {
        const existing = mergedCart.find(i => i.id === guestItem.id);
        if (existing) {
          existing.qty += guestItem.qty;
        } else {
          mergedCart.push(guestItem);
        }
      });

      localStorage.setItem(userCartKey, JSON.stringify(mergedCart));
      localStorage.removeItem(CART_KEY);
      window.dispatchEvent(new Event('cart-updated'));
    }
  } catch (e) {
    console.error('Lỗi khi gộp giỏ hàng:', e);
  }
};
