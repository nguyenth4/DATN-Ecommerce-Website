import { Link } from 'react-router-dom';

const CartPage = () => {
  return (
    <>
      <div className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Trang chủ</Link><span>/</span><span>Giỏ hàng</span>
          </div>
          <h1>GIỎ HÀNG</h1>
        </div>
      </div>

      <section className="section products-section-bg">
        <div className="container">
          <div className="cart-layout">

            {/* CART ITEMS */}
            <div>
              <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '1.5rem' }}>
                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                  <span className="fw-700 text-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>3 sản phẩm</span>
                  <button className="text-sm text-danger" style={{ border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}><i className="bi bi-trash"></i> Xóa tất cả</button>
                </div>

                {/* Item 1 */}
                <div className="cart-item">
                  <input type="checkbox" defaultChecked style={{ accentColor: 'var(--dark)', width: '16px', height: '16px' }} />
                  <div className="cart-item-img">
                    <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80" alt="" />
                  </div>
                  <div className="cart-item-info">
                    <div className="cart-item-name">Sony WH-1000XM5</div>
                    <div className="cart-item-variant">Màu: Đen</div>
                    <div className="mt-05">
                      <div className="qty-control" style={{ display: 'inline-flex', height: '32px' }}>
                        <button className="qty-btn" data-action="dec" style={{ width: '32px', height: '32px' }}><i className="bi bi-dash"></i></button>
                        <input type="text" className="qty-value" defaultValue="1" readOnly style={{ width: '40px' }} />
                        <button className="qty-btn" data-action="inc" style={{ width: '32px', height: '32px' }}><i className="bi bi-plus"></i></button>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="cart-item-price">8.490.000đ</div>
                    <button className="cart-item-remove" style={{ marginTop: '0.5rem' }}><i className="bi bi-trash"></i></button>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="cart-item">
                  <input type="checkbox" defaultChecked style={{ accentColor: 'var(--dark)', width: '16px', height: '16px' }} />
                  <div className="cart-item-img">
                    <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80" alt="" />
                  </div>
                  <div className="cart-item-info">
                    <div className="cart-item-name">Apple Watch Ultra 2</div>
                    <div className="cart-item-variant">Màu: Titan / Dây Alpine đen</div>
                    <div className="mt-05">
                      <div className="qty-control" style={{ display: 'inline-flex', height: '32px' }}>
                        <button className="qty-btn" data-action="dec" style={{ width: '32px', height: '32px' }}><i className="bi bi-dash"></i></button>
                        <input type="text" className="qty-value" defaultValue="1" readOnly style={{ width: '40px' }} />
                        <button className="qty-btn" data-action="inc" style={{ width: '32px', height: '32px' }}><i className="bi bi-plus"></i></button>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="cart-item-price">19.990.000đ</div>
                    <button className="cart-item-remove" style={{ marginTop: '0.5rem' }}><i className="bi bi-trash"></i></button>
                  </div>
                </div>

              </div>

              {/* Gợi ý thêm */}
              <div className="mt-15">
                <div className="fw-700 text-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem', marginTop: '1.5rem' }}>Có thể bạn quan tâm</div>
                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                  <Link to="/products/1" className="product-card" style={{ minWidth: '200px', flexShrink: 0 }}>
                    <div className="product-card-img" style={{ aspectRatio: '1' }}>
                      <img src="https://images.unsplash.com/photo-1546435770-a3e429ad6e5a?w=300&q=80" alt="" />
                      <button className="product-card-btn-add btn-add-cart" onClick={(e) => e.preventDefault()}><i className="bi bi-plus"></i></button>
                    </div>
                    <div className="product-card-body">
                      <div className="product-category">Tai nghe</div>
                      <div className="product-name" style={{ fontSize: '0.85rem' }}>Bose QC45</div>
                      <div className="product-price" style={{ fontSize: '0.9rem' }}>7.990.000đ</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* CART SUMMARY */}
            <div className="cart-summary">
              <h3>TÓM TẮT ĐƠN HÀNG</h3>

              <div className="summary-row">
                <span>Tạm tính (3 sản phẩm)</span>
                <span>36.980.000đ</span>
              </div>
              <div className="summary-row">
                <span>Giảm giá</span>
                <span className="text-success">-1.500.000đ</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <span className="text-muted">Tính lúc thanh toán</span>
              </div>

              <div className="coupon-input" style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
                <input type="text" placeholder="Nhập mã giảm giá..." style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }} />
                <button className="btn btn-primary btn-sm">Áp dụng</button>
              </div>

              <div className="summary-row total">
                <span>Tổng cộng</span>
                <span>35.480.000đ</span>
              </div>

              <Link to="/checkout" className="btn btn-accent btn-block btn-lg mt-1">
                <i className="bi bi-lock-fill"></i> TIẾN HÀNH THANH TOÁN
              </Link>
              <Link to="/products" className="btn btn-outline btn-block" style={{ marginTop: '0.8rem', color: 'var(--dark)', borderColor: 'var(--border)' }}>
                <i className="bi bi-arrow-left"></i> Tiếp tục mua sắm
              </Link>

              <div className="flex-center text-muted" style={{ justifyContent: 'center', marginTop: '1.2rem', fontSize: '1.3rem', gap: '0.5rem' }}>
                <i className="bi bi-credit-card" title="VNPay"></i>
                <i className="bi bi-wallet2" title="MoMo"></i>
                <i className="bi bi-wallet" title="ZaloPay"></i>
                <i className="bi bi-cash" title="COD"></i>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CartPage;
