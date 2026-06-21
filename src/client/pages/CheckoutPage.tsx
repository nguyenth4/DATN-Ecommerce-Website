import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('vnpay');
  const [shippingMethod, setShippingMethod] = useState('ghn');

  const handlePlaceOrder = () => {
    if (paymentMethod === 'vnpay' || paymentMethod === 'momo' || paymentMethod === 'zalopay') {
      alert(`Đang chuyển hướng đến cổng thanh toán online...\nNgười thụ hưởng: Huỳnh Trần Khang Hỷ\nSố tiền: 35.515.000đ`);
    }
    setTimeout(() => {
      navigate('/order-success');
    }, 1500);
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">Shop<span>Flow</span></Link>
        <div className="flex-center text-sm">
          <span className="fw-700 text-accent"><i className="bi bi-bag-check"></i> An toàn & Bảo mật</span>
        </div>
        <Link to="/cart" className="btn-icon"><i className="bi bi-x-lg"></i></Link>
      </nav>

      <section className="section products-section-bg">
        <div className="container">
          {/* STEPS */}
          <div style={{ maxWidth: '500px', margin: '0 auto 2.5rem' }}>
            <div className="tracking-steps">
              <div className="tracking-step done">
                <div className="step-icon"><i className="bi bi-bag-check"></i></div>
                <div className="step-label">Giỏ hàng</div>
              </div>
              <div className="tracking-step current">
                <div className="step-icon"><i className="bi bi-credit-card"></i></div>
                <div className="step-label">Thanh toán</div>
              </div>
              <div className="tracking-step">
                <div className="step-icon"><i className="bi bi-check2"></i></div>
                <div className="step-label">Xác nhận</div>
              </div>
            </div>
          </div>

          <div className="checkout-layout">
            {/* LEFT: FORM */}
            <div className="checkout-main">
              {/* Thông tin giao hàng */}
              <div className="checkout-section card">
                <div className="checkout-section-title">
                  <i className="bi bi-geo-alt-fill text-accent"></i> Thông tin giao hàng
                </div>
                <div className="form-row">
                  <div className="form-group mb-3" style={{ flex: 1 }}>
                    <label className="form-label">Họ và tên *</label>
                    <input type="text" className="form-control" placeholder="Nguyễn Văn A" defaultValue="Huỳnh Trần Khang Hỷ" />
                  </div>
                  <div className="form-group mb-3" style={{ flex: 1 }}>
                    <label className="form-label">Số điện thoại *</label>
                    <input type="tel" className="form-control" placeholder="0912 345 678" />
                  </div>
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">Email *</label>
                  <input type="email" className="form-control" placeholder="email@example.com" />
                </div>
                <div className="form-row">
                  <div className="form-group mb-3" style={{ flex: 1 }}>
                    <label className="form-label">Tỉnh / Thành phố *</label>
                    <select className="form-control">
                      <option value="">Chọn tỉnh/thành...</option>
                      <option selected>Hồ Chí Minh</option>
                      <option>Hà Nội</option>
                      <option>Đà Nẵng</option>
                      <option>Cần Thơ</option>
                    </select>
                  </div>
                  <div className="form-group mb-3" style={{ flex: 1 }}>
                    <label className="form-label">Quận / Huyện *</label>
                    <select className="form-control">
                      <option value="">Chọn quận/huyện...</option>
                      <option selected>Quận 1</option>
                      <option>Quận 7</option>
                      <option>Quận Bình Thạnh</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group mb-3" style={{ flex: 1 }}>
                    <label className="form-label">Phường / Xã *</label>
                    <select className="form-control">
                      <option value="">Chọn phường/xã...</option>
                      <option selected>Phường Bến Nghé</option>
                    </select>
                  </div>
                  <div className="form-group mb-3" style={{ flex: 2 }}>
                    <label className="form-label">Địa chỉ chi tiết *</label>
                    <input type="text" className="form-control" placeholder="Số nhà, tên đường..." />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Ghi chú đơn hàng</label>
                  <textarea className="form-control" rows={2} placeholder="Ghi chú thêm cho người giao hàng..."></textarea>
                </div>
              </div>

              {/* Đơn vị vận chuyển */}
              <div className="checkout-section card">
                <div className="checkout-section-title">
                  <i className="bi bi-truck-flatbed text-accent"></i> Đơn vị vận chuyển
                </div>
                <div 
                  className={`shipping-option ${shippingMethod === 'ghn' ? 'selected' : ''}`}
                  onClick={() => setShippingMethod('ghn')}
                  style={{ cursor: 'pointer', marginBottom: '0.8rem', padding: '1rem', border: shippingMethod === 'ghn' ? '2px solid var(--accent)' : '1px solid var(--border)', borderRadius: '12px', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
                >
                  <input type="radio" name="shipping" checked={shippingMethod === 'ghn'} readOnly style={{ marginRight: '1rem' }} />
                  <div className="shipping-option-info" style={{ flex: 1 }}>
                    <div className="shipping-option-name fw-700">GHN – Giao Hàng Nhanh</div>
                    <div className="shipping-option-desc text-xs text-muted">Dự kiến nhận: 1–2 ngày | Giao tận nơi</div>
                  </div>
                  <div className="shipping-option-price fw-800 text-accent">35.000đ</div>
                </div>
                <div 
                  className={`shipping-option ${shippingMethod === 'ghtk' ? 'selected' : ''}`}
                  onClick={() => setShippingMethod('ghtk')}
                  style={{ cursor: 'pointer', padding: '1rem', border: shippingMethod === 'ghtk' ? '2px solid var(--accent)' : '1px solid var(--border)', borderRadius: '12px', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
                >
                  <input type="radio" name="shipping" checked={shippingMethod === 'ghtk'} readOnly style={{ marginRight: '1rem' }} />
                  <div className="shipping-option-info" style={{ flex: 1 }}>
                    <div className="shipping-option-name fw-700">GHTK – Giao Hàng Tiết Kiệm</div>
                    <div className="shipping-option-desc text-xs text-muted">Dự kiến nhận: 2–3 ngày | Giao tận nơi</div>
                  </div>
                  <div className="shipping-option-price fw-800 text-accent">22.000đ</div>
                </div>
              </div>

              {/* Phương thức thanh toán */}
              <div className="checkout-section card">
                <div className="checkout-section-title">
                  <i className="bi bi-credit-card-2-back-fill text-accent"></i> Phương thức thanh toán
                </div>
                <div className="payment-method-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div 
                    className={`payment-method ${paymentMethod === 'vnpay' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('vnpay')}
                    style={{ cursor: 'pointer', padding: '1rem', border: paymentMethod === 'vnpay' ? '2px solid var(--accent)' : '1px solid var(--border)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.2s' }}
                  >
                    <input type="radio" name="payment" checked={paymentMethod === 'vnpay'} readOnly />
                    <div className="payment-method-icon" style={{ fontSize: '1.5rem', color: '#005baa' }}><i className="bi bi-shield-check"></i></div>
                    <div>
                      <div className="payment-method-name fw-700">VNPay</div>
                      <div className="text-xs text-muted">Thẻ ATM / QR / Tín dụng</div>
                    </div>
                  </div>
                  <div 
                    className={`payment-method ${paymentMethod === 'momo' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('momo')}
                    style={{ cursor: 'pointer', padding: '1rem', border: paymentMethod === 'momo' ? '2px solid var(--accent)' : '1px solid var(--border)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.2s' }}
                  >
                    <input type="radio" name="payment" checked={paymentMethod === 'momo'} readOnly />
                    <div className="payment-method-icon" style={{ color: '#a50064', fontSize: '1.5rem' }}>🟣</div>
                    <div>
                      <div className="payment-method-name fw-700">Ví MoMo</div>
                      <div className="text-xs text-muted">Siêu ứng dụng MoMo</div>
                    </div>
                  </div>
                  <div 
                    className={`payment-method ${paymentMethod === 'zalopay' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('zalopay')}
                    style={{ cursor: 'pointer', padding: '1rem', border: paymentMethod === 'zalopay' ? '2px solid var(--accent)' : '1px solid var(--border)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.2s' }}
                  >
                    <input type="radio" name="payment" checked={paymentMethod === 'zalopay'} readOnly />
                    <div className="payment-method-icon" style={{ color: '#008fe5', fontSize: '1.5rem' }}>🔵</div>
                    <div>
                      <div className="payment-method-name fw-700">ZaloPay</div>
                      <div className="text-xs text-muted">Ví ZaloPay tiện lợi</div>
                    </div>
                  </div>
                  <div 
                    className={`payment-method ${paymentMethod === 'cod' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('cod')}
                    style={{ cursor: 'pointer', padding: '1rem', border: paymentMethod === 'cod' ? '2px solid var(--accent)' : '1px solid var(--border)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.2s' }}
                  >
                    <input type="radio" name="payment" checked={paymentMethod === 'cod'} readOnly />
                    <div className="payment-method-icon" style={{ fontSize: '1.5rem', color: '#28a745' }}><i className="bi bi-cash-stack"></i></div>
                    <div>
                      <div className="payment-method-name fw-700">COD (Tiền mặt)</div>
                      <div className="text-xs text-muted">Nhận hàng rồi mới trả</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: ORDER SUMMARY */}
            <div className="checkout-sidebar">
              <div className="cart-summary sticky-summary shadow-lg" style={{ top: '20px', borderRadius: '16px', background: '#fff' }}>
                <h3 className="section-title mb-4" style={{ borderBottom: '2px solid var(--border)', paddingBottom: '0.8rem' }}>ĐƠN HÀNG CỦA BẠN</h3>

                {/* Items */}
                <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.8rem', padding: '0.8rem 0', borderBottom: '1px solid #f8f9fa', alignItems: 'center' }}>
                    <div className="checkout-mini-img" style={{ width: '60px', height: '60px', border: '1px solid var(--border)', borderRadius: '8px', position: 'relative', background: '#fff' }}>
                      <img src="https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro-max-titan-sa-mac.png" alt="" style={{ maxWidth: '100%', height: 'auto', padding: '4px' }} />
                      <span className="checkout-qty-badge" style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--accent)', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>1</span>
                    </div>
                    <div className="text-sm" style={{ flex: 1, fontWeight: 600 }}>iPhone 16 Pro Max 512GB VN/A</div>
                    <div className="fw-700 text-sm">34.990.000đ</div>
                  </div>
                </div>

                <div className="coupon-input mb-4" style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" className="form-control form-control-sm" placeholder="Mã giảm giá/quà tặng..." />
                  <button className="btn btn-primary btn-sm px-3">Áp dụng</button>
                </div>

                <div className="summary-row mb-2">
                  <span className="text-muted">Tạm tính</span>
                  <span className="fw-700">34.990.000đ</span>
                </div>
                <div className="summary-row mb-2">
                  <span className="text-muted">Phí vận chuyển ({shippingMethod === 'ghn' ? 'GHN' : 'GHTK'})</span>
                  <span className="fw-700">{shippingMethod === 'ghn' ? '35.000đ' : '22.000đ'}</span>
                </div>
                <div className="summary-row total pt-3 mt-3" style={{ borderTop: '2px dashed var(--border)' }}>
                  <span className="fw-800 text-lg">TỔNG CỘNG</span>
                  <span className="text-accent fw-900 text-xl" style={{ fontSize: '1.4rem' }}>{(34990000 + (shippingMethod === 'ghn' ? 35000 : 22000)).toLocaleString('vi-VN')}đ</span>
                </div>

                <button className="btn btn-accent btn-block btn-lg mt-4 w-100" style={{ padding: '1.2rem', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 800 }} onClick={handlePlaceOrder}>
                  <i className="bi bi-shield-lock-fill mr-2"></i> HOÀN TẤT ĐẶT HÀNG
                </button>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                  <p className="text-xs text-muted mb-2">
                    <i className="bi bi-shield-check"></i> Đảm bảo thanh toán an toàn 100%
                  </p>
                  <p className="text-xs text-muted">
                    Sản phẩm: Mới 100%, Chính hãng VN/A
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CheckoutPage;
