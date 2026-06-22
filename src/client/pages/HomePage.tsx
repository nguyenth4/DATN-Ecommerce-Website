import { useState } from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <main id="main">

      {/* HERO: bento grid */}
      <section className="hero">
        <div className="container">
          <div className="bento">

            <article className="bento-card bento-card--lg">
              <div className="sparkle"></div>
              <div>
                <span className="eyebrow">⚡ Audio · Featured</span>
                <h2>Apple HomePod<br />2nd Gen Speaker</h2>
                <p>Apple ecosystem with high-quality audio playback while serving as a hub for controlling smart home devices. Spatial audio, room-sensing tech.</p>
                <Link to="/products" className="btn btn--paper">Shop Now
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true"><path d="M1 5h12m0 0L9 1m4 4L9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </Link>
                <div className="dots"><span className="active"></span><span></span><span></span></div>
              </div>
              <img className="product" src="https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=900&q=80&auto=format&fit=crop" alt="HomePod speaker" />
            </article>

            <article className="bento-card bento-card--purple">
              <div className="sparkle"></div>
              <span className="eyebrow">Wearables</span>
              <h3 style={{ fontSize: 'var(--text-xl)', lineHeight: 1.15 }}>Explore<br />Apple Watch</h3>
              <Link to="/products" className="shop-now">Shop Now
                <svg width="12" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true"><path d="M1 5h12m0 0L9 1m4 4L9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
              <img className="product" src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80&auto=format&fit=crop" alt="Apple Watch" />
            </article>

            <article className="bento-card bento-card--teal">
              <div className="sparkle"></div>
              <span className="eyebrow">Latest Phones</span>
              <h3 style={{ fontSize: 'var(--text-xl)', lineHeight: 1.15 }}>Galaxy S24<br />Ultra · 5G</h3>
              <Link to="/products" className="shop-now">Shop Now
                <svg width="12" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true"><path d="M1 5h12m0 0L9 1m4 4L9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
              <img className="product" src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80&auto=format&fit=crop" alt="Samsung Galaxy phone" />
            </article>

            <div className="bento-row">
              <article className="bento-card bento-card--orange">
                <div className="sparkle"></div>
                <span className="eyebrow">Cameras</span>
                <h3 style={{ fontSize: 'var(--text-lg)', lineHeight: 1.2 }}>Samsung<br />Gear Camera</h3>
                <Link to="/products" className="shop-now">Shop Now
                  <svg width="12" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true"><path d="M1 5h12m0 0L9 1m4 4L9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </Link>
                <img className="product" src="https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500&q=80&auto=format&fit=crop" alt="Camera" />
              </article>

              <article className="bento-card bento-card--green">
                <div className="sparkle"></div>
                <span className="eyebrow">Audio</span>
                <h3 style={{ fontSize: 'var(--text-lg)', lineHeight: 1.2 }}>Beats<br />Studio Buds</h3>
                <Link to="/products" className="shop-now">Shop Now
                  <svg width="12" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true"><path d="M1 5h12m0 0L9 1m4 4L9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </Link>
                <img className="product" src="https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500&q=80&auto=format&fit=crop" alt="Earbuds" />
              </article>

              <article className="bento-card bento-card--black">
                <div className="sparkle"></div>
                <span className="eyebrow">DSLR</span>
                <h3 style={{ fontSize: 'var(--text-lg)', lineHeight: 1.2 }}>Hero Camera<br />X-Series</h3>
                <Link to="/products" className="shop-now">Shop Now
                  <svg width="12" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true"><path d="M1 5h12m0 0L9 1m4 4L9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </Link>
                <img className="product" src="https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&q=80&auto=format&fit=crop" alt="DSLR camera" />
              </article>
            </div>

          </div>
        </div>
      </section>

      {/* TRENDING PRODUCTS */}
      <section className="section" style={{ paddingTop: 'var(--s5)' }}>
        <div className="container">
          <div className="section-head">
            <h2>Trending Products</h2>
            <Link to="/products" className="view-all">View all
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M1 5h12m0 0L9 1m4 4L9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
          </div>

          <div className="tabs" role="tablist">
            {['Mobile', 'Watch', 'Camera', 'Accessories', 'Speaker'].map((tab, i) => (
              <button
                key={tab}
                className={`tab${activeTab === i ? ' is-active' : ''}`}
                role="tab"
                aria-selected={activeTab === i}
                onClick={() => setActiveTab(i)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="products">
            {[
              { img: 'photo-1511707171634-5f897ff02aa9', name: 'Galaxy Note 20 Ultra 5G', price: '$2,780', stock: 52, stars: '★★★★★', count: 56, badge: 'New' },
              { img: 'photo-1561154464-82e9adf32764', name: 'iPad 10th Generation', price: '$1,780', was: '$1,980', stock: 32, stars: '★★★★★', count: 124, badge: 'Sale' },
              { img: 'photo-1592899677977-9c10ca588bbd', name: 'Galaxy Note 20 Ultra 5G', price: '$2,780', stock: 41, stars: '★★★★☆', count: 89 },
              { img: 'photo-1565849904461-04a58ad377e0', name: 'Samsung S21 Ultra', price: '$2,780', stock: 24, stars: '★★★★★', count: 212, badge: 'New' },
              { img: 'photo-1592750475338-74b7b21085ab', name: 'Samsung Galaxy Note 20', price: '$2,780', stock: 67, stars: '★★★★★', count: 98 },
            ].map((p, i) => (
              <article key={i} className="product-card">
                <div className="img-wrap">
                  {p.badge && <span className={`badge${p.badge === 'Sale' ? ' badge--sale' : ''}`}>{p.badge}</span>}
                  <button className="wishlist" aria-label="Wishlist">♡</button>
                  <img src={`https://images.unsplash.com/${p.img}?w=500&q=80&auto=format&fit=crop`} alt={p.name} />
                </div>
                <div className="stock"><span className="dot"></span>In stock · {p.stock} items</div>
                <Link to="/products/1" className="name">{p.name}</Link>
                <div className="price">
                  <span className="now">{p.price}</span>
                  {p.was && <span className="was">{p.was}</span>}
                </div>
                <div className="stars">{p.stars} <span className="count">({p.count})</span></div>
                <Link to="/cart" className="btn">Order now →</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* DISCOUNT BANNERS */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="discount-row">
            <article className="discount-card discount-card--watch">
              <span className="meta">THIS WEEK ONLY</span>
              <h3>Mega Discounts<br /><span className="pct">50% Off</span></h3>
              <Link to="/products" className="shop-now">Shop Now
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M1 5h12m0 0L9 1m4 4L9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
              <img className="product" src="https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&q=80&auto=format&fit=crop" alt="Smart watch" />
            </article>
            <article className="discount-card discount-card--airpods">
              <span className="meta">LIMITED EDITION</span>
              <h3>Studio Buds Pro<br /><span className="pct">30% Off</span></h3>
              <Link to="/products" className="shop-now">Shop Now
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M1 5h12m0 0L9 1m4 4L9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
              <img className="product" src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80&auto=format&fit=crop" alt="Earbuds" />
            </article>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section" style={{ paddingTop: 'var(--s5)' }}>
        <div className="container">
          <div className="section-head">
            <h2>Shop by category</h2>
            <Link to="/products" className="view-all">View all products
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M1 5h12m0 0L9 1m4 4L9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
          </div>
          <div className="cats-grid">
            {[
              { img: 'photo-1523275335684-37898b6baf30', name: 'Watch', count: 28 },
              { img: 'photo-1502920917128-1aa500764cbd', name: 'Camera', count: 42 },
              { img: 'photo-1511707171634-5f897ff02aa9', name: 'Smart Phone', count: 76 },
              { img: 'photo-1592840496694-26d035b52b48', name: 'Accessories', count: 112 },
              { img: 'photo-1606220945770-b5b6c2c55bf1', name: 'Smart Buds', count: 35 },
            ].map((c, i) => (
              <Link key={i} to="/products" className="cat-tile">
                <div className="pic"><img src={`https://images.unsplash.com/${c.img}?w=300&q=80&auto=format&fit=crop`} alt="" /></div>
                <div className="name">{c.name}</div>
                <div className="count">{c.count} Products</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* COMPACT ROW */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <h2>Just for you</h2>
            <Link to="/products" className="view-all">More picks
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M1 5h12m0 0L9 1m4 4L9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
          </div>
          <div className="compact-row">
            {[
              { img: 'photo-1590658268037-6bf12165a8df', name: 'Apple Airpods V57', price: '$680', stock: 12 },
              { img: 'photo-1496181133206-80ce9b88a853', name: 'Apple MacBook Pro', price: '$2,780', stock: 8 },
              { img: 'photo-1592840496694-26d035b52b48', name: 'Power Wired Controller', price: '$190', stock: 24 },
              { img: 'photo-1527814050087-3793815479db', name: 'Gaming Mouse Pro', price: '$190', stock: 36 },
            ].map((p, i) => (
              <article key={i} className="compact-card">
                <div className="pic"><img src={`https://images.unsplash.com/${p.img}?w=300&q=80&auto=format&fit=crop`} alt="" /></div>
                <div>
                  <div className="stock">IN STOCK · {p.stock}</div>
                  <div className="name">{p.name}</div>
                  <div className="price">{p.price}</div>
                  <Link to="/cart" className="btn">Order Now</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* BRANDS */}
      <section className="brands">
        <div className="container">
          <div className="brand-row">
            {['HP', 'Huawei', 'Nokia', 'Samsung', 'Canon', 'Sony'].map((b) => (
              <a key={b} href="#" className="brand-logo">{b}</a>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section style={{ background: 'var(--paper)' }}>
        <div className="container">
          <div className="newsletter">
            <div className="newsletter-grid">
              <div>
                <h2>Get <strong>20% Off</strong> your first order — straight to your inbox.</h2>
                <p>Drop your email and we'll send a one-time discount, plus first-look offers on the gear we just got in. Unsubscribe anytime.</p>
              </div>
              <form
                className="newsletter-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  (e.currentTarget.querySelector('button') as HTMLButtonElement).textContent = 'Sent ✓';
                }}
              >
                <input type="email" required placeholder="Enter your email" aria-label="Email address" />
                <button className="btn" type="submit">Subscribe →</button>
              </form>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
};

export default HomePage;