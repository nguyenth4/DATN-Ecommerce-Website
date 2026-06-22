import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, 
  Heart, 
  ChevronRight, 
  ChevronLeft 
} from 'lucide-react';

const PRODUCTS = [
  { id: '1', img: 'photo-1511707171634-5f897ff02aa9', name: 'Galaxy Note 20 Ultra 5G', price: '2.780.000đ', stock: 52, stars: '★★★★★', count: 56, badge: 'New' },
  { id: '2', img: 'photo-1561154464-82e9adf32764', name: 'iPad 10th Generation', price: '1.780.000đ', was: '1.980.000đ', stock: 32, stars: '★★★★★', count: 124, badge: 'Sale' },
  { id: '3', img: 'photo-1496181133206-80ce9b88a853', name: 'Apple MacBook Pro M3', price: '2.480.000đ', stock: 18, stars: '★★★★★', count: 89 },
  { id: '4', img: 'photo-1502920917128-1aa500764cbd', name: 'Canon EOS R7 DSLR', price: '1.920.000đ', stock: 24, stars: '★★★★☆', count: 67 },
  { id: '5', img: 'photo-1523275335684-37898b6baf30', name: 'Apple Watch Series 9', price: '680.000đ', stock: 41, stars: '★★★★★', count: 245, badge: 'New' },
  { id: '6', img: 'photo-1606220945770-b5b6c2c55bf1', name: 'Beats Studio Buds Pro', price: '280.000đ', stock: 67, stars: '★★★★☆', count: 312 },
  { id: '7', img: 'photo-1608043152269-423dbba4e7e1', name: 'Apple HomePod 2nd Gen', price: '280.000đ', was: '320.000đ', stock: 22, stars: '★★★★★', count: 98, badge: 'Sale' },
  { id: '8', img: 'photo-1592840496694-26d035b52b48', name: 'Power Wired Controller', price: '190.000đ', stock: 34, stars: '★★★★★', count: 78 },
  { id: '9', img: 'photo-1592899677977-9c10ca588bbd', name: 'Galaxy S24 Ultra Mint', price: '1.420.000đ', stock: 19, stars: '★★★★☆', count: 56 },
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
              <Link to="/">Trang chủ</Link> <span className="sep">/</span> <span>Cửa hàng · Tất cả sản phẩm</span>
            </div>
            <h1>Tất cả sản phẩm</h1>
            <p>314 sản phẩm bao gồm điện thoại thông minh, máy tính xách tay, âm thanh, máy ảnh, thiết bị đeo và chơi game. Sử dụng bộ lọc bên trái để tìm kiếm theo thương hiệu, giá cả, đánh giá hoặc tình trạng hàng.</p>
          </div>
        </section>


        <section className="section">
          <div className="container">
            <div className="shop-layout">

              <aside className="filters" aria-label="Bộ lọc">
                <div className="filter-block">
                  <h3>Danh mục</h3>
                  <label><input type="checkbox" defaultChecked /> Điện thoại <span className="ct">76</span></label>
                  <label><input type="checkbox" /> Máy tính &amp; Laptop <span className="ct">42</span></label>
                  <label><input type="checkbox" /> Đồng hồ thông minh <span className="ct">28</span></label>
                  <label><input type="checkbox" /> Máy ảnh <span className="ct">42</span></label>
                  <label><input type="checkbox" /> Tai nghe &amp; Buds <span className="ct">35</span></label>
                  <label><input type="checkbox" /> Chơi game <span className="ct">31</span></label>
                  <label><input type="checkbox" /> Phụ kiện <span className="ct">112</span></label>
                </div>
                <div className="filter-block">
                  <h3>Khoảng giá</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--fg-mute)' }}>
                    <span>120.000đ</span><span>30.000.000đ</span>
                  </div>
                  <div className="range-bar" aria-hidden="true"></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--ink)', marginTop: 'var(--s2)' }}>
                    <span>420.000đ</span><span>20.380.000đ</span>
                  </div>
                </div>

                <div className="filter-block">
                  <h3>Thương hiệu</h3>
                  <label><input type="checkbox" /> Apple <span className="ct">84</span></label>
                  <label><input type="checkbox" defaultChecked /> Samsung <span className="ct">72</span></label>
                  <label><input type="checkbox" /> Sony <span className="ct">36</span></label>
                  <label><input type="checkbox" /> Canon <span className="ct">22</span></label>
                  <label><input type="checkbox" /> HP <span className="ct">28</span></label>
                  <label><input type="checkbox" /> Huawei <span className="ct">19</span></label>
                  <label><input type="checkbox" /> Logitech <span className="ct">31</span></label>
                </div>
                <div className="filter-block">
                  <h3>Đánh giá</h3>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><input type="checkbox" /> 5 sao &amp; lên <span className="ct">186</span></label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><input type="checkbox" /> 4 sao &amp; lên <span className="ct">242</span></label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><input type="checkbox" /> 3 sao &amp; lên <span className="ct">296</span></label>
                </div>
                <div className="filter-block">
                  <h3>Tình trạng</h3>
                  <label><input type="checkbox" defaultChecked /> Còn hàng <span className="ct">298</span></label>
                  <label><input type="checkbox" /> Đang giảm giá <span className="ct">64</span></label>
                  <label><input type="checkbox" /> Sản phẩm mới <span className="ct">28</span></label>
                </div>
                <a href="#" className="btn btn--indigo btn--block">Áp dụng bộ lọc</a>
              </aside>


              <div>
                <div className="shop-toolbar">
                  <span className="count">Hiển thị 1 – {PRODUCTS.length} của 314 sản phẩm</span>
                  <div style={{ display: 'flex', gap: 'var(--s3)', alignItems: 'center' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-mute)' }}>SẮP XẾP</span>
                    <select value={sort} onChange={(e) => setSort(e.target.value)}>
                      <option value="popular">Phổ biến nhất</option>
                      <option value="price-asc">Giá: thấp đến cao</option>
                      <option value="price-desc">Giá: cao đến thấp</option>
                      <option value="newest">Mới nhất</option>
                      <option value="rating">Đánh giá cao nhất</option>
                    </select>
                  </div>
                </div>

                <div className="shop-grid">
                  {PRODUCTS.map((p) => (
                    <article className="product-card" key={p.id}>
                      <div className="img-wrap">
                        {p.badge && (
                          <span className={`badge ${p.badge === 'Sale' ? 'badge--sale' : ''}`}>{p.badge === 'Sale' ? 'Giảm giá' : 'Mới'}</span>
                        )}
                        <button className="wishlist"><Heart size={18} /></button>
                        <img
                          src={`https://images.unsplash.com/${p.img}?w=500&q=80&auto=format&fit=crop`}
                          alt={p.name}
                        />
                      </div>
                      <div className="stock"><span className="dot"></span>Còn hàng · {p.stock} sản phẩm</div>
                      <Link to={`/product/${p.id}`} className="name">{p.name}</Link>
                      <div className="price">
                        <span className="now">{p.price}</span>
                        {p.was && <span className="was">{p.was}</span>}
                      </div>
                      <div className="stars">
                         <div style={{ display: 'flex', gap: '2px', color: '#fbbf24' }}>
                           {[...Array(5)].map((_, idx) => (
                             <Star key={idx} size={14} fill={idx < 4 ? "#fbbf24" : "none"} />
                           ))}
                         </div>
                         <span className="count">({p.count})</span>
                      </div>
                      <Link to="/cart" className="btn">Đặt ngay <ChevronRight size={16} /></Link>
                    </article>
                  ))}
                </div>

                <div className="pagination">
                  <a href="#" className="pg"><ChevronLeft size={16} /></a>
                  <a href="#" className="pg is-active">1</a>
                  <a href="#" className="pg">2</a>
                  <a href="#" className="pg">3</a>
                  <a href="#" className="pg">...</a>
                  <a href="#" className="pg">26</a>
                  <a href="#" className="pg"><ChevronRight size={16} /></a>
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