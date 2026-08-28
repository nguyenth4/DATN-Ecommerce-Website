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
  stock?: number;
}

/** Kiểm tra người dùng đã đăng nhập chưa */
export const isLoggedIn = (): boolean => {
  try {
    const token = localStorage.getItem('customer_token');
    const info = localStorage.getItem('customer_info');
    return !!(token && info);
  } catch (e) {
    return false;
  }
};

/** Yêu cầu đăng nhập — hiện toast và chuyển hướng đến /login */
export const requireLogin = (): false => {
  showToast('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng', 'error');
  setTimeout(() => {
    window.location.href = '/login';
  }, 1200);
  return false;
};

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

export const addToCart = (item: CartItem): boolean => {
  // Chặn nếu chưa đăng nhập
  if (!isLoggedIn()) {
    return requireLogin();
  }

  const cart = getCart();
  const existing = cart.find(i => i.id === item.id);
  
  if (existing) {
    const newQty = existing.qty + item.qty;
    const maxStock = item.stock ?? 10; // Giả sử max là 10 nếu không có stock
    if (newQty > maxStock) {
      showToast(`Không đủ số lượng trong kho! Chỉ còn ${maxStock} sản phẩm.`, 'error');
      return false;
    }
    existing.qty = newQty;
  } else {
    const maxStock = item.stock ?? 10;
    if (item.qty > maxStock) {
      showToast(`Không đủ số lượng trong kho! Chỉ còn ${maxStock} sản phẩm.`, 'error');
      return false;
    }
    cart.push(item);
  }
  saveCart(cart);
  showToast(`Đã thêm ${item.name} vào giỏ hàng`, 'success');
  return true;
};

export const updateCartQty = (id: string, qty: number) => {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) {
    const maxStock = item.stock ?? 10;
    if (qty > maxStock) {
      showToast(`Kho chỉ còn ${maxStock} sản phẩm.`, 'error');
      item.qty = maxStock;
    } else {
      item.qty = Math.max(1, qty);
    }
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
