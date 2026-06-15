import { Link } from 'react-router-dom';

const CheckoutPage = () => {
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
            <div>
              {/* Thông tin giao hàng */}
              <div className="checkout-section">
                <div className="checkout-section-title">
                  <i className="bi bi-geo-alt"></i> Thông tin giao hàng
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Họ và tên *</label>
                    <input type="text" className="form-control" placeholder="Nguyễn Văn A" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Số điện thoại *</label>
                    <input type="tel" className="form-control" placeholder="0912 345 678" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input type="email" className="form-control" placeholder="email@example.com" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tỉnh / Thành phố *</label>
                    <select className="form-control">
                      <option value="">Chọn tỉnh/thành...</option>
                      <option>Hồ Chí Minh</option>
                      <option>Hà Nội</option>
                      <option>Đà Nẵng</option>
                      <option>Cần Thơ</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quận / Huyện *</label>
                    <select className="form-control">
                      <option value="">Chọn quận/huyện...</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phường / Xã *</label>
                    <select className="form-control">
                      <option value="">Chọn phường/xã...</option>
                    </select>
                  </div>
                  <div className="form-group">
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
              <div className="checkout-section">
                <div className="checkout-section-title">
                  <i className="bi bi-truck"></i> Đơn vị vận chuyển
                </div>
                <div className="shipping-option selected">
                  <input type="radio" name="shipping" defaultChecked />
                  <div className="shipping-option-info">
                    <div className="shipping-option-name"><img src="" alt="" style={{ height: '18px', verticalAlign: 'middle', marginRight: '0.4rem' }} />GHN – Giao Hàng Nhanh</div>
                    <div className="shipping-option-desc">Dự kiến: 1–2 ngày | Giao tận nơi</div>
                  </div>
                  <div className="shipping-option-price">35.000đ</div>
                </div>
                <div className="shipping-option">
                  <input type="radio" name="shipping" />
                  <div className="shipping-option-info">
                    <div className="shipping-option-name">GHTK – Giao Hàng Tiết Kiệm</div>
                    <div className="shipping-option-desc">Dự kiến: 2–3 ngày | Giao tận nơi</div>
                  </div>
                  <div className="shipping-option-price">22.000đ</div>
                </div>
              </div>

              {/* Phương thức thanh toán */}
              <div className="checkout-section">
                <div className="checkout-section-title">
                  <i className="bi bi-credit-card"></i> Phương thức thanh toán
                </div>
                <div className="payment-method-list">
                  <div className="payment-method selected">
                    <input type="radio" name="payment" defaultChecked />
                    <div className="payment-method-icon"><i className="bi bi-credit-card-2-front"></i></div>
                    <div>
                      <div className="payment-method-name">VNPay</div>
                      <div className="text-xs text-muted">Thẻ ATM, tín dụng, QR Code</div>
                    </div>
                  </div>
                  <div className="payment-method">
                    <input type="radio" name="payment" />
                    <div className="payment-method-icon">🟣</div>
                    <div>
                      <div className="payment-method-name">Ví MoMo</div>
                      <div className="text-xs text-muted">Thanh toán qua ví MoMo</div>
                    </div>
                  </div>
                  <div className="payment-method">
                    <input type="radio" name="payment" />
                    <div className="payment-method-icon">🔵</div>
                    <div>
                      <div className="payment-method-name">ZaloPay</div>
                      <div className="text-xs text-muted">Thanh toán qua ví ZaloPay</div>
                    </div>
                  </div>
                  <div className="payment-method">
                    <input type="radio" name="payment" />
                    <div className="payment-method-icon"><i className="bi bi-cash-stack"></i></div>
                    <div>
                      <div className="payment-method-name">COD – Tiền mặt khi nhận hàng</div>
                      <div className="text-xs text-muted">Thanh toán khi giao hàng</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: ORDER SUMMARY */}
            <div>
              <div className="cart-summary" style={{ top: '80px' }}>
                <h3>ĐƠN HÀNG CỦA BẠN</h3>

                {/* Items */}
                <div style={{ maxHeight: '260px', overflowY: 'auto', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.8rem', padding: '0.8rem 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                    <div className="checkout-mini-img">
                      <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80" alt="" />
                      <span className="checkout-qty-badge">1</span>
                    </div>
                    <div className="text-sm" style={{ flex: 1 }}>Sony WH-1000XM5 – Đen</div>
                    <div className="fw-700 text-sm">8.490.000đ</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.8rem', padding: '0.8rem 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                    <div className="checkout-mini-img">
                      <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80" alt="" />
                      <span className="checkout-qty-badge">1</span>
                    </div>
                    <div className="text-sm" style={{ flex: 1 }}>Apple Watch Ultra 2</div>
                    <div className="fw-700 text-sm">19.990.000đ</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.8rem', padding: '0.8rem 0', alignItems: 'center' }}>
                    <div className="checkout-mini-img">
                      <img src="https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=100&q=80" alt="" />
                      <span className="checkout-qty-badge">2</span>
                    </div>
                    <div className="text-sm" style={{ flex: 1 }}>Portable SoundBox Extreme</div>
                    <div className="fw-700 text-sm">8.500.000đ</div>
                  </div>
                </div>

                <div className="coupon-input">
                  <input type="text" placeholder="Mã giảm giá..." style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }} />
                  <button className="btn btn-primary btn-sm">Dùng</button>
                </div>

                <div className="summary-row">
                  <span>Tạm tính</span>
                  <span>36.980.000đ</span>
                </div>
                <div className="summary-row">
                  <span>Giảm giá</span>
                  <span className="text-success">-1.500.000đ</span>
                </div>
                <div className="summary-row">
                  <span>Phí vận chuyển (GHN)</span>
                  <span>35.000đ</span>
                </div>
                <div className="summary-row total">
                  <span>TỔNG THANH TOÁN</span>
                  <span className="text-accent">35.515.000đ</span>
                </div>

                <button className="btn btn-accent btn-block btn-lg mt-1" onClick={() => alert('Đặt hàng thành công! 🎉')}>
                  <i className="bi bi-lock-fill"></i> ĐẶT HÀNG NGAY
                </button>

                <p className="text-xs text-muted" style={{ textAlign: 'center', marginTop: '0.8rem' }}>
                  <i className="bi bi-shield-lock"></i> Thông tin được bảo mật SSL
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CheckoutPage;
