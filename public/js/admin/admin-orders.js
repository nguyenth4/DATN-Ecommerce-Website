function filterOrders(status, btn) {
  document.querySelectorAll('.admin-topbar ~ main .admin-main header + div button[onclick]').forEach(b => {
    b.style.borderBottomColor = 'transparent';
    b.style.color = 'var(--gray)';
  });
  // Reset all tab buttons
  btn.closest('div').querySelectorAll('button').forEach(b => {
    b.style.borderBottomColor = 'transparent';
    b.style.color = 'var(--gray)';
  });
  btn.style.borderBottomColor = 'var(--dark)';
  btn.style.color = 'var(--dark)';
}
// Init tab style fix
document.querySelectorAll('.admin-content > div:first-child button').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.admin-content > div:first-child button').forEach(b => {
      b.style.borderBottomColor = 'transparent';
      b.style.color = 'var(--gray)';
    });
    this.style.borderBottomColor = 'var(--dark)';
    this.style.color = 'var(--dark)';
  });
});
