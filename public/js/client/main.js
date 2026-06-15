// ===== SHOPFLOW - MAIN JS =====

// --- Variant Selection ---
document.querySelectorAll('.variant-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    if (this.classList.contains('disabled')) return;
    const group = this.closest('.variant-options');
    group.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
  });
});

document.querySelectorAll('.color-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const group = this.closest('.variant-options');
    group.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
  });
});

// --- Quantity Control ---
document.querySelectorAll('.qty-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const input = this.parentElement.querySelector('.qty-value');
    let val = parseInt(input.value) || 1;
    if (this.dataset.action === 'inc') val++;
    if (this.dataset.action === 'dec' && val > 1) val--;
    input.value = val;
  });
});

// --- Thumbnail Gallery ---
document.querySelectorAll('.thumb').forEach(thumb => {
  thumb.addEventListener('click', function() {
    document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    const main = document.querySelector('.product-gallery-main img');
    if (main && this.querySelector('img')) {
      main.src = this.querySelector('img').src;
    }
  });
});

// --- Cart Actions ---
document.querySelectorAll('.btn-add-cart').forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    showToast('Đã thêm vào giỏ hàng!', 'success');
    updateCartCount(1);
  });
});

// --- Category Filter ---
document.querySelectorAll('.cat-chip').forEach(chip => {
  chip.addEventListener('click', function() {
    document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
    this.classList.add('active');
  });
});

// --- Payment Method Selection ---
document.querySelectorAll('.payment-method').forEach(method => {
  method.addEventListener('click', function() {
    document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
    this.classList.add('selected');
    const radio = this.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
  });
});

// --- Shipping Option Selection ---
document.querySelectorAll('.shipping-option').forEach(opt => {
  opt.addEventListener('click', function() {
    document.querySelectorAll('.shipping-option').forEach(o => o.classList.remove('selected'));
    this.classList.add('selected');
    const radio = this.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
  });
});

// --- Toast Notification ---
function showToast(msg, type = 'success') {
  const existing = document.querySelector('.sf-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'sf-toast';
  toast.innerHTML = `<i class="bi bi-${type === 'success' ? 'check-circle-fill' : 'exclamation-circle-fill'}"></i> ${msg}`;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '1.5rem',
    right: '1.5rem',
    zIndex: 9999,
    padding: '0.75rem 1.3rem',
    borderRadius: '8px',
    background: type === 'success' ? '#111' : '#EF4444',
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    animation: 'slideIn 0.2s ease',
    fontFamily: "'Barlow', sans-serif"
  });
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// --- Cart Count Update ---
function updateCartCount(delta) {
  const badge = document.querySelector('.cart-badge-count');
  if (badge) {
    const curr = parseInt(badge.textContent) || 0;
    badge.textContent = Math.max(0, curr + delta);
  }
}

// --- Sticky Navbar Shadow ---
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.navbar');
  if (nav) {
    nav.style.boxShadow = window.scrollY > 10 ? '0 2px 16px rgba(0,0,0,0.1)' : 'none';
  }
});

// --- Animate on Scroll ---
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.product-card, .stat-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  observer.observe(el);
});

// CSS animation for toast
const style = document.createElement('style');
style.textContent = `@keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`;
document.head.appendChild(style);
