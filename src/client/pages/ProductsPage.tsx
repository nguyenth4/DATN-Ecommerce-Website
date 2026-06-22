import { useState } from 'react';
import { Link } from 'react-router-dom';

const PRODUCTS = [
  { id: '1', img: 'photo-1511707171634-5f897ff02aa9', name: 'Galaxy Note 20 Ultra 5G', price: '$2,780', stock: 52, stars: '★★★★★', count: 56, badge: 'New' },
  { id: '2', img: 'photo-1561154464-82e9adf32764', name: 'iPad 10th Generation', price: '$1,780', was: '$1,980', stock: 32, stars: '★★★★★', count: 124, badge: 'Sale' },
  { id: '3', img: 'photo-1496181133206-80ce9b88a853', name: 'Apple MacBook Pro M3', price: '$2,480', stock: 18, stars: '★★★★★', count: 89 },
  { id: '4', img: 'photo-1502920917128-1aa500764cbd', name: 'Canon EOS R7 DSLR', price: '$1,920', stock: 24, stars: '★★★★☆', count: 67 },
  { id: '5', img: 'photo-1523275335684-37898b6baf30', name: 'Apple Watch Series 9', price: '$680', stock: 41, stars: '★★★★★', count: 245, badge: 'New' },
  { id: '6', img: 'photo-1606220945770-b5b6c2c55bf1', name: 'Beats Studio Buds Pro', price: '$280', stock: 67, stars: '★★★★☆', count: 312 },
  { id: '7', img: 'photo-1608043152269-423dbba4e7e1', name: 'Apple HomePod 2nd Gen', price: '$280', was: '$320', stock: 22, stars: '★★★★★', count: 98, badge: 'Sale' },
  { id: '8', img: 'photo-1592840496694-26d035b52b48', name: 'Power Wired Controller', price: '$190', stock: 34, stars: '★★★★★', count: 78 },
  { id: '9', img: 'photo-1592899677977-9c10ca588bbd', name: 'Galaxy S24 Ultra Mint', price: '$1,420', stock: 19, stars: '★★★★☆', count: 56 },
];

const ProductsPage = () => {
  const [sort, setSort] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <main id="main">
        <section className="page-head">
          <div className="container">
            <div className="crumbs">
              <Link to="/">Home</Link> <span className="sep">›</span> <span>Shop · All products</span>
            </div>
            <h1>All Products</h1>
            <p>314 products across smartphones, laptops, audio, cameras, wearables, and gaming. Use the filters on the left to narrow down by brand, price, rating, or availability.</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="shop-layout">

              <aside className="filters" aria-label="Filters">
                <div className="filter-block">
                  <h3>Category</h3>
                  <label><input type="checkbox" defaultChecked /> Smartphones <span className="ct">76</span></label>
                  <label><input type="checkbox" /> Laptops &amp; Desktops <span className="ct">42</span></label>
                  <label><input type="checkbox" /> Smart Watches <span className="ct">28</span></label>
                  <label><input type="checkbox" /> Cameras <span className="ct">42</span></label>
                  <label><input type="checkbox" /> Headphones &amp; Buds <span className="ct">35</span></label>
                  <label><input type="checkbox" /> Gaming <span className="ct">31</span></label>
                  <label><input type="checkbox" /> Accessories <span className="ct">112</span></label>
                </div>
                <div className="filter-block">
                  <h3>Price range</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--fg-mute)' }}>
                    <span>$120</span><span>$3,400</span>
                  </div>
                  <div className="range-bar" aria-hidden="true"></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--ff-mono)', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--ink)', marginTop: 'var(--s2)' }}>
                    <span>$420</span><span>$2,380</span>
                  </div>
                </div>
                <div className="filter-block">
                  <h3>Brand</h3>
                  <label><input type="checkbox" /> Apple <span className="ct">84</span></label>
                  <label><input type="checkbox" defaultChecked /> Samsung <span className="ct">72</span></label>
                  <label><input type="checkbox" /> Sony <span className="ct">36</span></label>
                  <label><input type="checkbox" /> Canon <span className="ct">22</span></label>
                  <label><input type="checkbox" /> HP <span className="ct">28</span></label>
                  <label><input type="checkbox" /> Huawei <span className="ct">19</span></label>
                  <label><input type="checkbox" /> Logitech <span className="ct">31</span></label>
                </div>
                <div className="filter-block">
                  <h3>Rating</h3>
                  <label><input type="checkbox" /> ★★★★★ &amp; up <span className="ct">186</span></label>
                  <label><input type="checkbox" /> ★★★★☆ &amp; up <span className="ct">242</span></label>
                  <label><input type="checkbox" /> ★★★☆☆ &amp; up <span className="ct">296</span></label>
                </div>
                <div className="filter-block">
                  <h3>Availability</h3>
                  <label><input type="checkbox" defaultChecked /> In stock <span className="ct">298</span></label>
                  <label><input type="checkbox" /> On sale <span className="ct">64</span></label>
                  <label><input type="checkbox" /> New arrivals <span className="ct">28</span></label>
                </div>
                <a href="#" className="btn btn--indigo btn--block">Apply filters</a>
              </aside>

              <div>
                <div className="shop-toolbar">
                  <span className="count">Showing 1 – {PRODUCTS.length} of 314 products</span>
                  <div style={{ display: 'flex', gap: 'var(--s3)', alignItems: 'center' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-mute)', fontFamily: 'var(--ff-mono)' }}>SORT</span>
                    <select value={sort} onChange={(e) => setSort(e.target.value)}>
                      <option value="popular">Most popular</option>
                      <option value="price-asc">Price: low to high</option>
                      <option value="price-desc">Price: high to low</option>
                      <option value="newest">Newest first</option>
                      <option value="rating">Highest rated</option>
                    </select>
                  </div>
                </div>

                <div className="shop-grid">
                  {PRODUCTS.map((p) => (
                    <article className="product-card" key={p.id}>
                      <div className="img-wrap">
                        {p.badge && (
                          <span className={`badge ${p.badge === 'Sale' ? 'badge--sale' : ''}`}>{p.badge}</span>
                        )}
                        <button className="wishlist">♡</button>
                        <img
                          src={`https://images.unsplash.com/${p.img}?w=500&q=80&auto=format&fit=crop`}
                          alt={p.name}
                        />
                      </div>
                      <div className="stock"><span className="dot"></span>In stock · {p.stock} items</div>
                      <Link to={`/product/${p.id}`} className="name">{p.name}</Link>
                      <div className="price">
                        <span className="now">{p.price}</span>
                        {p.was && <span className="was">{p.was}</span>}
                      </div>
                      <div className="stars">{p.stars} <span className="count">({p.count})</span></div>
                      <Link to="/cart" className="btn">Order now →</Link>
                    </article>
                  ))}
                </div>

                <div className="pagination">
                  <a href="#" className="pg">‹</a>
                  <a href="#" className="pg is-active">1</a>
                  <a href="#" className="pg">2</a>
                  <a href="#" className="pg">3</a>
                  <a href="#" className="pg">…</a>
                  <a href="#" className="pg">26</a>
                  <a href="#" className="pg">›</a>
                </div>
              </div>

            </div>
          </div>
        </section>

        <section className="brands">
          <div className="container">
            <div className="brand-row">
              <a href="#" className="brand-logo">HP</a>
              <a href="#" className="brand-logo">Huawei</a>
              <a href="#" className="brand-logo">Nokia</a>
              <a href="#" className="brand-logo">Samsung</a>
              <a href="#" className="brand-logo">Canon</a>
              <a href="#" className="brand-logo">Sony</a>
            </div>
          </div>
        </section>

      </main>
    </>
  );
};

export default ProductsPage;