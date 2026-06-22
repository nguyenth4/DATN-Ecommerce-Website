const COMPARE_KEY = 'sprylo_compare_list';

export const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  let toastEl = document.getElementById('sprylo-global-toast');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'sprylo-global-toast';
    document.body.appendChild(toastEl);
  }
  
  toastEl.className = `sprylo-toast show ${type}`;
  toastEl.innerHTML = `
    <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}"></i>
    <span>${message}</span>
  `;
  
  // Clear any existing timeouts if possible
  const timeoutId = (toastEl as any)._timeoutId;
  if (timeoutId) clearTimeout(timeoutId);
  
  (toastEl as any)._timeoutId = setTimeout(() => {
    toastEl?.classList.remove('show');
  }, 3000);
};

export const getCompareList = (): string[] => {
  try {
    const list = localStorage.getItem(COMPARE_KEY);
    return list ? JSON.parse(list) : [];
  } catch (e) {
    return [];
  }
};

export const toggleCompareProduct = (id: string, name: string): { added: boolean; list: string[] } => {
  const list = getCompareList();
  const index = list.indexOf(id);
  
  if (index > -1) {
    list.splice(index, 1);
    localStorage.setItem(COMPARE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('compare-updated'));
    showToast(`Đã xóa ${name} khỏi danh sách so sánh`, 'success');
    return { added: false, list };
  } else {
    if (list.length >= 4) {
      showToast('Chỉ có thể so sánh tối đa 4 sản phẩm cùng lúc.', 'error');
      return { added: false, list };
    }
    list.push(id);
    localStorage.setItem(COMPARE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('compare-updated'));
    showToast(`Đã thêm ${name} vào danh sách so sánh`, 'success');
    return { added: true, list };
  }
};

export const isInCompareList = (id: string): boolean => {
  return getCompareList().includes(id);
};

export const clearCompareList = () => {
  localStorage.removeItem(COMPARE_KEY);
  window.dispatchEvent(new Event('compare-updated'));
  showToast('Đã xóa toàn bộ danh sách so sánh', 'success');
};
