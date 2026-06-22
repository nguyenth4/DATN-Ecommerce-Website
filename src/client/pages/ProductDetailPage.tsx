import { useState } from 'react';
import { Link } from 'react-router-dom';

const THUMBS = [
  'photo-1608043152269-423dbba4e7e1',
  'photo-1545454675-3531b543be5d',
  'photo-1589003077984-894e133dabab',
  'photo-1518770660439-4636190af475',
  'photo-1574920162043-b872873f19c8',
];

const RELATED = [
  { img: 'photo-1606220945770-b5b6c2c55bf1', name: 'Beats Studio Buds Pro', price: '$280', stock: 67, stars: '★★★★☆', count: 312 },
  { img: 'photo-1523275335684-37898b6baf30', name: 'Apple Watch Series 9', price: '$680', stock: 41, stars: '★★★★★', count: 245, badge: 'New' },
  { img: 'photo-1590658268037-6bf12165a8df', name: 'Apple AirPods V57', price: '$680', stock: 12, stars: '★★★★★', count: 124 },
  { img: 'photo-1565849904461-04a58ad377e0', name: 'Samsung S21 Ultra', price: '$2,580', was: '$2,780', stock: 24, stars: '★★★★★', count: 212, badge: 'Sale' },
  { img: 'photo-1502920917128-1aa500764cbd', name: 'Canon EOS R7 DSLR', price: '$1,920', stock: 24, stars: '★★★★☆', count: 67 },
];

const SPECS = [
  { label: 'Chip', value: 'Apple S7 SiP' },
  { label: 'Drivers', value: '4-inch high-excursion woofer, 5 beam-forming tweeters' },
  { label: 'Connectivity', value: 'Wi-Fi 4, Bluetooth 5.0, Thread, U1' },
  { label: 'Spatial audio', value: 'Yes, with dynamic head tracking' },
  { label: 'Dimensions', value: '168 × 142 mm · 2.3 kg' },
  { label: 'In the box', value: 'HomePod, power cable (1.8 m), documentation' },
  { label: 'Warranty', value: '2-year limited' },
];

const RATING_BREAKDOWN = [
  { stars: 5, pct: 82 },
  { stars: 4, pct: 14 },
  { stars: 3, pct: 3 },
  { stars: 2, pct: 1 },
  { stars: 1, pct: 0 },
];

const REVIEWS = [
  { name: 'Mira K.', time: '2 days ago', stars: '★★★★★', text: 'Bought a stereo pair for the living room. The room-sensing makes a real difference — they adapt to where you put them. Setup was 90 seconds with the iPhone handoff.' },
  { name: 'Devan R.', time: '1 week ago', stars: '★★★★★', text: 'Replaced my old Sonos with this. Spatial audio is genuinely impressive on Atmos tracks. Build quality is excellent. Only wish it had a 3.5 mm jack for guests.' },
];

const tdLabelStyle = {
  padding: 'var(--s4) 0', color: 'var(--fg-mute)',
  fontFamily: 'var(--ff-mono)', fontSize: 'var(--text-xs)',
  letterSpacing: '0.06em', textTransform: 'uppercase', width: '40%',
};
const tdValStyle = { padding: 'var(--s4) 0', fontWeight: 600 };

const ProductDetailPage = () => {
  const [activeThumb, setActiveThumb] = useState(0);
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState(0);
  const [config, setConfig] = useState(1);
  const [care, setCare] = useState(0);

  const colors = [
    { hex: '#FFFFFF', label: 'White' },
    { hex: '#0F172A', label: 'Midnight' },
    { hex: '#F97316', label: 'Orange' },
    { hex: '#4F46E5', label: 'Indigo' },
  ];
  const configs = ['Single', 'Stereo pair · save $40', '3-pack · save $120'];
  const carePlans = ['No coverage', '2 years · $39', '3 years · $59'];

  const decreaseQty = () => setQty((q) => Math.max(1, q - 1));
  const increaseQty = () => setQty((q) => q + 1);

  return (
    <>
      <main id="main">
        <div className="container">
          <div className="crumbs" style={{ paddingTop: 'var(--s5)' }}>
            <Link to="/">Home</Link> <span className="sep">›</span> <Link to="/shop">Shop</Link> <span className="sep">›</span> <span>Speakers</span>
          </div>

          <section className="product-detail">

            <div className="gallery">
              <div className="gallery-thumbs">
                {THUMBS.map((thumb, i) => (
                  <button
                    key={thumb}
                    className={activeThumb === i ? 'is-active' : ''}
                    onClick={() => setActiveThumb(i)}
                  >
                    <img src={`https://images.unsplash.com/${thumb}?w=200&q=80&auto=format&fit=crop`} alt="" />
                  </button>
                ))}
              </div>
              <figure className="gallery-main">
                <img src={`https://images.unsplash.com/${THUMBS[activeThumb]}?w=900&q=80&auto=format&fit=crop`} alt="HomePod 2nd Gen speaker" />
              </figure>
            </div>

            <div className="pdp-info">
              <span className="pdp-cat">⚡ Audio · Featured</span>
              <h1>Apple HomePod 2nd Gen Speaker</h1>
              <div className="rating-row">
                <span style={{ color: 'var(--amber)', fontSize: '16px' }}>★★★★★</span>
                <span>4.9 / 5 · 312 reviews</span>
                <span style={{ color: 'var(--rule-strong)' }}>|</span>
                <span style={{ color: 'var(--emerald)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', background: 'var(--emerald)', borderRadius: '999px', display: 'inline-block' }}></span>
                  In stock · 22 items
                </span>
              </div>
              <p className="desc">Spatial audio, room-sensing tech, and the centrepiece of your Apple ecosystem. Built-in S7 chip, dynamic computational audio, and seamless handoff from iPhone. The new HomePod is designed to disappear into your room and fill it with sound.</p>

              <div className="price-row">
                <span className="now">$280</span>
                <span className="was">$320</span>
                <span className="save">Save 12%</span>
              </div>

              <div className="option-block">
                <div className="label">Color</div>
                <div className="color-swatches">
                  {colors.map((c, i) => (
                    <button
                      key={c.label}
                      className={color === i ? 'is-active' : ''}
                      style={{ background: c.hex, borderRadius: '999px', outlineColor: 'var(--rule-strong)' }}
                      aria-label={c.label}
                      onClick={() => setColor(i)}
                    ></button>
                  ))}
                </div>
              </div>

              <div className="option-block">
                <div className="label">Configuration</div>
                <div className="option-pills">
                  {configs.map((c, i) => (
                    <button
                      key={c}
                      className={config === i ? 'is-active' : ''}
                      onClick={() => setConfig(i)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="option-block">
                <div className="label">AppleCare+</div>
                <div className="option-pills">
                  {carePlans.map((c, i) => (
                    <button
                      key={c}
                      className={care === i ? 'is-active' : ''}
                      onClick={() => setCare(i)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pdp-cta">
                <div className="qty">
                  <button type="button" aria-label="Decrease" onClick={decreaseQty}>−</button>
                  <input type="text" value={qty} inputMode="numeric" aria-label="Quantity" readOnly />
                  <button type="button" aria-label="Increase" onClick={increaseQty}>+</button>
                </div>
                <Link to="/cart" className="btn btn--indigo" style={{ flex: 1, minWidth: '160px' }}>Add to cart →</Link>
                <Link to="/cart" className="btn btn--ink">Buy now</Link>
                <button className="icon-btn" aria-label="Add to wishlist" style={{ background: 'var(--bg)' }}>♡</button>
              </div>

              <div className="pdp-features">
                <div className="pf"><span className="ic">⚡</span><span>Free shipping over $50</span></div>
                <div className="pf"><span className="ic">↺</span><span>30-day free returns</span></div>
                <div className="pf"><span className="ic">★</span><span>2-year limited warranty</span></div>
                <div className="pf"><span className="ic">✓</span><span>Authentic Apple product</span></div>
              </div>
            </div>

          </section>

          {/* Specs + reviews split */}
          <section className="section" style={{ paddingTop: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s8)' }}>

              <div>
                <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--s5)' }}>Specifications</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                  <tbody>
                    {SPECS.map((spec, i) => (
                      <tr key={spec.label} style={i < SPECS.length - 1 ? { borderBottom: '1px solid var(--rule)' } : undefined}>
                        <td style={tdLabelStyle}>{spec.label}</td>
                        <td style={tdValStyle}>{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--s5)' }}>Reviews</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'var(--s5)', alignItems: 'center', padding: 'var(--s5)', background: 'var(--bg)', borderRadius: 'var(--r)', marginBottom: 'var(--s5)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--ff-display)', fontSize: '48px', fontWeight: 800, color: 'var(--ink)', lineHeight: 1 }}>4.9</div>
                    <div style={{ color: 'var(--amber)', fontSize: '18px' }}>★★★★★</div>
                    <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--fg-mute)', marginTop: '4px' }}>312 reviews</div>
                  </div>
                  <div style={{ display: 'grid', gap: '6px', fontFamily: 'var(--ff-mono)', fontSize: 'var(--text-xs)', color: 'var(--fg-soft)' }}>
                    {RATING_BREAKDOWN.map((r) => (
                      <div key={r.stars} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '16px' }}>{r.stars}</span>
                        <span style={{ flex: 1, height: '6px', background: 'var(--rule)', borderRadius: '999px', overflow: 'hidden' }}>
                          <span style={{ display: 'block', width: `${r.pct}%`, height: '100%', background: 'var(--amber)' }}></span>
                        </span>
                        <span style={{ width: '28px', textAlign: 'right' }}>{r.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {REVIEWS.map((review) => (
                  <article key={review.name} style={{ borderBottom: '1px solid var(--rule)', paddingBottom: 'var(--s5)', marginBottom: 'var(--s5)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ fontFamily: 'var(--ff-display)', fontWeight: 700 }}>{review.name}</strong>
                      <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--fg-mute)' }}>{review.time}</span>
                    </div>
                    <div style={{ color: 'var(--amber)', fontSize: '14px', marginBottom: '6px' }}>{review.stars}</div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-soft)', lineHeight: 1.6 }}>{review.text}</p>
                  </article>
                ))}

                <a href="#" className="btn btn--ghost btn--block">Read all 312 reviews →</a>
              </div>

            </div>
          </section>

          {/* Related products */}
          <section className="section">
            <div className="section-head">
              <h2>You may also like</h2>
              <Link to="/shop" className="view-all">All products →</Link>
            </div>
            <div className="products">
              {RELATED.map((p) => (
                <article className="product-card" key={p.name}>
                  <div className="img-wrap">
                    {p.badge && (
                      <span className={`badge ${p.badge === 'Sale' ? 'badge--sale' : ''}`}>{p.badge}</span>
                    )}
                    <button className="wishlist">♡</button>
                    <img src={`https://images.unsplash.com/${p.img}?w=500&q=80&auto=format&fit=crop`} alt={p.name} />
                  </div>
                  <div className="stock"><span className="dot"></span>In stock · {p.stock} items</div>
                  <Link to="/product" className="name">{p.name}</Link>
                  <div className="price">
                    <span className="now">{p.price}</span>
                    {p.was && <span className="was">{p.was}</span>}
                  </div>
                  <div className="stars">{p.stars} <span className="count">({p.count})</span></div>
                  <Link to="/cart" className="btn">Order now →</Link>
                </article>
              ))}
            </div>
          </section>

        </div>
      </main>
    </>
  );
};

export default ProductDetailPage;