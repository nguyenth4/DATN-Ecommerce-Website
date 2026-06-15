function switchTab(tab) {
  document.getElementById('panelDesc').style.display = tab === 'desc' ? 'block' : 'none';
  document.getElementById('panelReview').style.display = tab === 'review' ? 'block' : 'none';
  document.getElementById('tabDesc').style.borderBottomColor = tab === 'desc' ? 'var(--dark)' : 'transparent';
  document.getElementById('tabDesc').style.color = tab === 'desc' ? 'var(--dark)' : 'var(--gray)';
  document.getElementById('tabReview').style.borderBottomColor = tab === 'review' ? 'var(--dark)' : 'transparent';
  document.getElementById('tabReview').style.color = tab === 'review' ? 'var(--dark)' : 'var(--gray)';
}
