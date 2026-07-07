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

export const getCart = (): CartItem[] => {
  try {
    const list = localStorage.getItem(CART_KEY);
    return list ? JSON.parse(list) : [];
  } catch (e) {
    return [];
  }
};

export const saveCart = (cart: CartItem[]) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
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
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event('cart-updated'));
};

export const getCartCount = (): number => {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.qty, 0);
};
