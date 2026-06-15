function switchTab(name, el) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.account-nav-item').forEach(i => i.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  el.classList.add('active');
}

function showToast(msg, type) {
  const toast = document.createElement('div');
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
    fontFamily: "'Barlow',sans-serif"
  });
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
