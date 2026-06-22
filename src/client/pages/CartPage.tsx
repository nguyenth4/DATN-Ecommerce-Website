import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  Plus, 
  Minus, 
  X, 
  ChevronRight, 
  ArrowLeft,
  Zap,
  RotateCcw,
  Star,
  ShieldCheck
} from 'lucide-react';

const INIT_ITEMS = [
  { id: 1, img: 'photo-1608043152269-423dbba4e7e1', name: 'Loa Apple HomePod Thế hệ 2', variant: 'Trắng · Cặp loa Stereo · Không bảo hiểm', price: 280000, qty: 1 },
  { id: 2, img: 'photo-1523275335684-37898b6baf30', name: 'Apple Watch Series 9', variant: '41mm · Nhôm Midnight · Dây Sport M/L', price: 680000, qty: 1 },
  { id: 3, img: 'photo-1606220945770-b5b6c2c55bf1', name: 'Tai nghe Beats Studio Buds Pro', variant: 'Đen · Chống ồn chủ động', price: 280000, qty: 2 },
];

const PROMO_CODE = 'WELCOME20';
const PROMO_DISCOUNT = 56000;


const CartPage = () => {
  const [items, setItems] = useState(INIT_ITEMS);
  const [promo, setPromo] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const updateQty = (id: number, delta: number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)));
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const applyPromo = () => {
    if (promo.trim().toUpperCase() === PROMO_CODE) {
      setPromoApplied(true);
    }
  };

  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = Math.round(subtotal * 0.08);
  const discount = promoApplied ? PROMO_DISCOUNT : 0;
  const total = subtotal + tax - discount;


  return (
    <>
      <main id="main">

        <section className="page-head">
          <div className="container">
            <div className="crumbs"><Link to="/">Trang chủ</Link> <span className="sep">/</span> <span>Giỏ hàng</span></div>
            <h1>Giỏ hàng của bạn</h1>
            <p>{itemCount} {itemCount === 1 ? 'sản phẩm' : 'sản phẩm'} · sẵn sàng giao. Miễn phí vận chuyển cho đơn hàng này. Dự kiến giao hàng 21 – 23 Tháng 5.</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="cart-layout">

              <div>
                {items.length > 0 ? (
                  <div className="cart-list">
                    {items.map((item) => (
                      <article className="cart-row" key={item.id}>
                        <div className="pic">
                          <img src={`https://images.unsplash.com/${item.img}?w=200&q=80&auto=format&fit=crop`} alt="" />
                        </div>
                        <div className="info">
                          <div className="name">{item.name}</div>
                          <div className="variant">{item.variant}</div>
                        </div>
                        <div className="qty">
                          <button aria-label="Decrease" onClick={() => updateQty(item.id, -1)}><Minus size={16} /></button>
                          <input type="text" value={item.qty} inputMode="numeric" aria-label="Quantity" readOnly />
                          <button aria-label="Increase" onClick={() => updateQty(item.id, 1)}><Plus size={16} /></button>
                        </div>
                        <span className="subtotal">{(item.price * item.qty).toLocaleString('vi-VN')}đ</span>
                        <button className="remove" aria-label="Remove" onClick={() => removeItem(item.id)}><X size={18} /></button>

                      </article>
                    ))}
                  </div>
                ) : (
                  <p>Giỏ hàng của bạn đang trống. <Link to="/shop">Tiếp tục mua sắm →</Link></p>
                )}

                <div style={{ marginTop: 'var(--s5)', display: 'flex', gap: 'var(--s3)', flexWrap: 'wrap' }}>
                  <Link to="/products" className="btn btn--ghost"><ArrowLeft size={16} style={{marginRight: '8px'}}/> Tiếp tục mua sắm</Link>
                  <button className="btn btn--ghost">Cập nhật giỏ hàng</button>
                </div>

                {/* Trust strip */}
                <div style={{ marginTop: 'var(--s7)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s4)', padding: 'var(--s5)', background: 'var(--bg)', borderRadius: 'var(--r)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--indigo-soft)', color: 'var(--indigo)', borderRadius: '999px', display: 'grid', placeItems: 'center' }}>
                      <Zap size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>Giao hàng nhanh miễn phí</div>
                      <div style={{ fontSize: '11px', color: 'var(--fg-mute)' }}>2 — 3 ngày làm việc</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--indigo-soft)', color: 'var(--indigo)', borderRadius: '999px', display: 'grid', placeItems: 'center' }}>
                      <RotateCcw size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>30 ngày đổi trả miễn phí</div>
                      <div style={{ fontSize: '11px', color: 'var(--fg-mute)' }}>Không cần lý do</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--indigo-soft)', color: 'var(--indigo)', borderRadius: '999px', display: 'grid', placeItems: 'center' }}>
                      <Star size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>Bảo hành 2 năm</div>
                      <div style={{ fontSize: '11px', color: 'var(--fg-mute)' }}>Cho mọi đơn hàng Sprylo</div>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="cart-summary">
                <h3>Tóm tắt đơn hàng</h3>

                <div className="promo-input">
                  <input
                    type="text"
                    placeholder="Mã giảm giá"
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                  />
                  <button onClick={applyPromo}>Áp dụng</button>
                </div>

                <div className="cart-line">
                  <span>Tạm tính · {itemCount} sản phẩm</span>
                  <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="cart-line">
                  <span>Phí vận chuyển</span>
                  <span style={{ color: 'var(--emerald)', fontWeight: 600 }}>Miễn phí</span>
                </div>
                <div className="cart-line">
                  <span>Thuế ước tính (8%)</span>
                  <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{tax.toLocaleString('vi-VN')}đ</span>
                </div>
                {promoApplied && (
                  <div className="cart-line">
                    <span>Khuyến mãi · {PROMO_CODE}</span>
                    <span style={{ color: 'var(--rose)', fontWeight: 600 }}>−{discount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}

                <div className="cart-line is-total"><span>Tổng cộng</span><span>{total.toLocaleString('vi-VN')}đ</span></div>


                <Link to="/checkout" className="btn btn--indigo btn--block">Tiến hành thanh toán <ChevronRight size={18} style={{marginLeft: '4px'}}/></Link>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--s3)', marginTop: 'var(--s5)', flexWrap: 'wrap' }}>
                  {['VISA', 'MASTERCARD', 'AMEX', 'PAYPAL', 'APPLE PAY'].map((method) => (
                    <span
                      key={method}
                      style={{ fontSize: '11px', color: 'var(--fg-mute)', padding: '6px 10px', background: 'var(--paper)', borderRadius: '4px' }}
                    >
                      {method}
                    </span>
                  ))}
                </div>

                <p style={{ marginTop: 'var(--s5)', fontSize: '11px', color: 'var(--fg-mute)', textAlign: 'center', lineHeight: 1.6 }}>
                   <ShieldCheck size={12} style={{display: 'inline', verticalAlign: 'middle', marginRight: '4px'}}/> Giao dịch <Link to="/checkout" style={{ color: 'inherit', textDecoration: 'underline' }}>thanh toán</Link> được mã hoá · Bảo mật SSL. Thông tin thanh toán không bao giờ được lưu trữ trên máy chủ của chúng tôi.
                </p>
              </aside>

            </div>
          </div>
        </section>

      </main>
    </>
  );
};

export default CartPage;