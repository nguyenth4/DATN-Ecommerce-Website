function togglePw(id, btn) {
  const input = document.getElementById(id);
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.innerHTML = isHidden ? '<i class="bi bi-eye-slash"></i>' : '<i class="bi bi-eye"></i>';
}

function handleLogin() {
  const email = document.getElementById('loginEmail').value;
  const pw = document.getElementById('loginPw').value;
  const box = document.getElementById('alertBox');
  const msg = document.getElementById('alertMsg');
  
  if (!email || !pw) {
    box.style.display = 'flex';
    box.className = 'alert alert-danger';
    msg.textContent = 'Vui lòng nhập đầy đủ thông tin.';
    return;
  }
  
  box.style.display = 'flex';
  box.className = 'alert alert-success';
  box.querySelector('i').className = 'bi bi-check-circle-fill';
  msg.textContent = 'Đăng nhập thành công! Đang chuyển hướng...';
  setTimeout(() => window.location.href = 'index.html', 1500);
}

function validateEmail(input) {
  const err = document.getElementById('emailErr');
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
  err.style.display = input.value && !valid ? 'block' : 'none';
  input.classList.toggle('is-invalid', input.value && !valid);
}

function checkStrength(pw) {
  const fill = document.getElementById('strengthFill');
  const label = document.getElementById('strengthLabel');
  let score = 0;
  
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  
  const levels = [
    { w: '0%', color: 'transparent', text: '' },
    { w: '25%', color: '#EF4444', text: 'Rất yếu' },
    { w: '50%', color: '#F59E0B', text: 'Yếu' },
    { w: '75%', color: '#3B82F6', text: 'Khá mạnh' },
    { w: '100%', color: '#22C55E', text: 'Mạnh' },
  ];
  
  const l = levels[score];
  fill.style.width = l.w;
  fill.style.background = l.color;
  label.textContent = l.text;
  label.style.color = l.color;
}

function checkMatch() {
  const pw = document.getElementById('regPw').value;
  const confirm = document.getElementById('regPwConfirm').value;
  const err = document.getElementById('pwMatchErr');
  err.style.display = confirm && pw !== confirm ? 'block' : 'none';
}

function handleRegister() {
  const fields = ['lastName','firstName','regEmail','regPhone','regPw','regPwConfirm'];
  const allFilled = fields.every(id => document.getElementById(id).value.trim());
  const agreed = document.getElementById('agree').checked;
  const box = document.getElementById('alertBox');
  const msg = document.getElementById('alertMsg');
  
  if (!allFilled || !agreed) {
    box.style.display = 'flex';
    box.className = 'alert alert-danger';
    box.querySelector('i').className = 'bi bi-exclamation-circle-fill';
    msg.textContent = !agreed ? 'Vui lòng đồng ý với điều khoản sử dụng.' : 'Vui lòng điền đầy đủ thông tin.';
    return;
  }
  
  const pw = document.getElementById('regPw').value;
  const confirm = document.getElementById('regPwConfirm').value;
  if (pw !== confirm) { checkMatch(); return; }
  
  // Animate step dots
  document.getElementById('dot1').className = 'step-dot done';
  document.getElementById('dot2').className = 'step-dot active';
  box.style.display = 'flex';
  box.className = 'alert alert-success';
  box.querySelector('i').className = 'bi bi-check-circle-fill';
  msg.textContent = 'Đăng ký thành công! Đang chuyển hướng...';
  
  setTimeout(() => {
    document.getElementById('dot2').className = 'step-dot done';
    document.getElementById('dot3').className = 'step-dot active';
  }, 800);
  
  setTimeout(() => window.location.href = 'login.html', 2000);
}
