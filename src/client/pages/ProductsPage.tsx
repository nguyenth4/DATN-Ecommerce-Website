import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCompareList, toggleCompareProduct } from '../utils/compare';
import { 
  Star, 
  Heart, 
  ChevronRight, 
  ChevronLeft 
} from 'lucide-react';
import { useProducts } from '../services/product.service';

const ProductsPage = () => {
  const [sort, setSort] = useState('');
  const [compareList, setCompareList] = useState(getCompareList());

  // Fetch products dynamically from the database
  const { data, isLoading } = useProducts();
  const products = data?.products || [];
  const totalCount = data?.count || 0;

  useEffect(() => {
    const handleUpdate = () => {
      setCompareList(getCompareList());
    };
    window.addEventListener('compare-updated', handleUpdate);
    return () => {
      window.removeEventListener('compare-updated', handleUpdate);
    };
  }, []);

  return (
    <>
      <main id="main">
        <section className="page-head">
          <div className="container">
            <div className="crumbs">
              <Link to="/">Trang chủ</Link> <span className="sep">/</span> <span>Cửa hàng · Tất cả sản phẩm</span>
            </div>
            <h1>Tất cả sản phẩm</h1>
            <p>{totalCount} sản phẩm bao gồm điện thoại thông minh, máy tính xách tay, âm thanh, máy ảnh, thiết bị đeo và chơi game. Sử dụng bộ lọc bên trái để tìm kiếm theo thương hiệu, giá cả, đánh giá hoặc tình trạng hàng.</p>
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
                  <span className="count">Hiển thị 1 – {products.length} của {totalCount} sản phẩm</span>
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
                  {isLoading ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 0', color: 'var(--fg-mute, #64748b)' }}>
                      <div className="spinner" style={{ margin: '0 auto 1rem', width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: 'var(--indigo)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                      Đang tải danh sách sản phẩm...
                    </div>
                  ) : products.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 0', color: 'var(--fg-mute, #64748b)' }}>
                      Không tìm thấy sản phẩm nào trong cơ sở dữ liệu.
                    </div>
                  ) : (
                    products.map((p: any) => {
                      const pPrice = p.variants?.[0]?.prices?.find((pr: any) => pr.currency_code === 'vnd')?.amount 
                        || p.variants?.[0]?.prices?.[0]?.amount 
                        || p.variants?.[0]?.price 
                        || p.price 
                        || 0;

                      const displayPrice = typeof pPrice === 'number' && pPrice > 0 ? pPrice.toLocaleString('vi-VN') + 'đ' : 'Liên hệ';
                      const oldPrice = p.variants?.[0]?.oldPrice;
                      const displayOldPrice = oldPrice ? oldPrice.toLocaleString('vi-VN') + 'đ' : null;

                      const stock = p.variants?.[0]?.stock !== undefined ? p.variants[0].stock : 10;
                      const imgUrl = p.thumbnail || 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80&auto=format&fit=crop';
                      const rating = Number(p.metadata?.rating || 5);
                      const ratingCount = p.metadata?.review_count || 10;

                      return (
                        <article className="product-card" key={p.id}>
                          <div className="img-wrap">
                            {oldPrice && <span className="badge badge--sale">Giảm giá</span>}
                            <button className="wishlist"><Heart size={18} /></button>
                            <img src={imgUrl} alt={p.title} style={{ objectFit: 'contain' }} />
                          </div>
                          <div className="stock"><span className="dot"></span>Còn hàng · {stock} sản phẩm</div>
                          <Link to={`/product/${p.id}`} className="name">{p.title}</Link>
                          <div className="price">
                            <span className="now">{displayPrice}</span>
                            {displayOldPrice && <span className="was">{displayOldPrice}</span>}
                          </div>
                          <div className="stars">
                            <div style={{ display: 'flex', gap: '2px', color: '#fbbf24' }}>
                              {[...Array(5)].map((_, idx) => (
                                <Star key={idx} size={14} fill={idx < Math.round(rating) ? "#fbbf24" : "none"} />
                              ))}
                            </div>
                            <span className="count">({ratingCount})</span>
                          </div>
                          <div 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            style={{
                              marginTop: '0.65rem',
                              paddingTop: '0.65rem',
                              borderTop: '1px dashed var(--rule, #eaeaea)',
                              display: 'flex',
                              alignItems: 'center',
                              fontSize: '0.8rem',
                              color: 'var(--fg-mute, #64748b)'
                            }}
                          >
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', margin: 0 }}>
                              <input 
                                type="checkbox" 
                                checked={compareList.includes(p.id)}
                                onChange={() => toggleCompareProduct(p.id, p.title)}
                                style={{ 
                                  cursor: 'pointer', 
                                  accentColor: 'var(--indigo, #4f46e5)',
                                  width: '14px',
                                  height: '14px'
                                }}
                              />
                              <span style={{ fontWeight: 500 }}>So sánh</span>
                            </label>
                          </div>
                          <Link to="/cart" className="btn" style={{ marginTop: '0.65rem' }}>Đặt ngay <ChevronRight size={16} /></Link>
                        </article>
                      );
                    })
                  )}
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