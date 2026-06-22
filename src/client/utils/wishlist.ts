import { showToast } from './compare';

const WISHLIST_KEY = 'sprylo_wishlist';

export const getWishlist = (): string[] => {
  try {
    const list = localStorage.getItem(WISHLIST_KEY);
    return list ? JSON.parse(list) : [];
  } catch (e) {
    return [];
  }
};

export const toggleWishlistProduct = (id: string, name: string): { added: boolean; list: string[] } => {
  const list = getWishlist();
  const index = list.indexOf(id);
  
  if (index > -1) {
    list.splice(index, 1);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('wishlist-updated'));
    showToast(`Đã xóa ${name} khỏi danh sách yêu thích`, 'success');
    return { added: false, list };
  } else {
    list.push(id);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('wishlist-updated'));
    showToast(`Đã thêm ${name} vào danh sách yêu thích`, 'success');
    return { added: true, list };
  }
};

export const isInWishlist = (id: string): boolean => {
  return getWishlist().includes(id);
};

export const clearWishlist = () => {
  localStorage.removeItem(WISHLIST_KEY);
  window.dispatchEvent(new Event('wishlist-updated'));
  showToast('Đã xóa toàn bộ danh sách yêu thích', 'success');
};
