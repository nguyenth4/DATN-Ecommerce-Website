import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const INIT_ITEMS = [
  { id: 1, img: 'photo-1608043152269-423dbba4e7e1', name: 'Apple HomePod 2nd Gen Speaker', variant: 'White · Stereo pair · No AppleCare', price: 280, qty: 1 },
  { id: 2, img: 'photo-1523275335684-37898b6baf30', name: 'Apple Watch Series 9', variant: '41mm · Midnight aluminum · Sport band M/L', price: 680, qty: 1 },
  { id: 3, img: 'photo-1606220945770-b5b6c2c55bf1', name: 'Beats Studio Buds Pro', variant: 'Black · Active noise cancelling', price: 280, qty: 2 },
];

const PROMO_CODE = 'WELCOME20';
const PROMO_DISCOUNT = 56;

const CartPage = () => {
  const [items, setItems] = useState(INIT_ITEMS);
  const [promo, setPromo] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const navigate = useNavigate();

  const updateQty = (id, delta) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)));
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const applyPromo = () => {
    if (promo.trim().toUpperCase() === PROMO_CODE) {
      setPromoApplied(true);
    }
  };

  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = +(subtotal * 0.08).toFixed(2);
  const discount = promoApplied ? PROMO_DISCOUNT : 0;
  const total = +(subtotal + tax - discount).toFixed(2);

  return (
    <>
      <main id="main">

        <section className="page-head">
          <div className="container">
            <div className="crumbs"><Link to="/">Home</Link> <span className="sep">›</span> <span>Shopping cart</span></div>
            <h1>Your cart</h1>
            <p>{itemCount} {itemCount === 1 ? 'item' : 'items'} · ready to ship. Free delivery on this order. Estimated arrival 21 – 23 May.</p>
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
                          <button aria-label="Decrease" onClick={() => updateQty(item.id, -1)}>−</button>
                          <input type="text" value={item.qty} inputMode="numeric" aria-label="Quantity" readOnly />
                          <button aria-label="Increase" onClick={() => updateQty(item.id, 1)}>+</button>
                        </div>
                        <span className="subtotal">${(item.price * item.qty).toFixed(2)}</span>
                        <button className="remove" aria-label="Remove" onClick={() => removeItem(item.id)}>✕</button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p>Your cart is empty. <Link to="/shop">Continue shopping →</Link></p>
                )}

                <div style={{ marginTop: 'var(--s5)', display: 'flex', gap: 'var(--s3)', flexWrap: 'wrap' }}>
                  <Link to="/shop" className="btn btn--ghost">← Continue shopping</Link>
                  <button className="btn btn--ghost">Update cart</button>
                </div>

                {/* Trust strip */}
                <div style={{ marginTop: 'var(--s7)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s4)', padding: 'var(--s5)', background: 'var(--bg)', borderRadius: 'var(--r)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--indigo-soft)', color: 'var(--indigo)', borderRadius: '999px', display: 'grid', placeItems: 'center', fontSize: '18px' }}>⚡</div>
                    <div>
                      <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>Free fast shipping</div>
                      <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--fg-mute)' }}>2 — 3 business days</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--indigo-soft)', color: 'var(--indigo)', borderRadius: '999px', display: 'grid', placeItems: 'center', fontSize: '18px' }}>↺</div>
                    <div>
                      <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>30-day free returns</div>
                      <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--fg-mute)' }}>No questions asked</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--indigo-soft)', color: 'var(--indigo)', borderRadius: '999px', display: 'grid', placeItems: 'center', fontSize: '18px' }}>★</div>
                    <div>
                      <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>2-year warranty</div>
                      <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--fg-mute)' }}>On every Sprylo order</div>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="cart-summary">
                <h3>Order summary</h3>

                <div className="promo-input">
                  <input
                    type="text"
                    placeholder="Promo code"
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                  />
                  <button onClick={applyPromo}>Apply</button>
                </div>

                <div className="cart-line">
                  <span>Subtotal · {itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                  <span style={{ fontFamily: 'var(--ff-display)', fontWeight: 600, color: 'var(--ink)' }}>${subtotal.toFixed(2)}</span>
                </div>
                <div className="cart-line">
                  <span>Shipping</span>
                  <span style={{ color: 'var(--emerald)', fontWeight: 600 }}>Free</span>
                </div>
                <div className="cart-line">
                  <span>Estimated tax</span>
                  <span style={{ fontFamily: 'var(--ff-display)', fontWeight: 600, color: 'var(--ink)' }}>${tax.toFixed(2)}</span>
                </div>
                {promoApplied && (
                  <div className="cart-line">
                    <span>Promo · {PROMO_CODE}</span>
                    <span style={{ color: 'var(--rose)', fontFamily: 'var(--ff-display)', fontWeight: 600 }}>−${discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="cart-line is-total"><span>Total</span><span>${total.toFixed(2)}</span></div>

                <a href="#" className="btn btn--indigo btn--block">Proceed to checkout →</a>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--s3)', marginTop: 'var(--s5)', flexWrap: 'wrap' }}>
                  {['VISA', 'MASTERCARD', 'AMEX', 'PAYPAL', 'APPLE PAY'].map((method) => (
                    <span
                      key={method}
                      style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--fg-mute)', padding: '6px 10px', background: 'var(--paper)', borderRadius: '4px' }}
                    >
                      {method}
                    </span>
                  ))}
                </div>

                <p style={{ marginTop: 'var(--s5)', fontSize: '11px', fontFamily: 'var(--ff-mono)', color: 'var(--fg-mute)', textAlign: 'center', lineHeight: 1.6 }}>
                  Encrypted checkout · SSL secured. Your payment information is never stored on our servers.
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