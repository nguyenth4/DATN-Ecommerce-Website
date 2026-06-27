import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCompareList, toggleCompareProduct } from '../utils/compare';
import { 
  Zap, 
  ArrowRight, 
  ChevronRight, 
  Heart, 
  Star
} from 'lucide-react';
import { useProducts } from '../services/product.service';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [compareList, setCompareList] = useState(getCompareList());

  // Fetch trending products from Medusa & Supabase
  const { data, isLoading } = useProducts({ limit: 12 });
  const products = data?.products || [];

  useEffect(() => {
    const handleUpdate = () => {
      setCompareList(getCompareList());
    };
    window.addEventListener('compare-updated', handleUpdate);
    return () => {
      window.removeEventListener('compare-updated', handleUpdate);
    };
  }, []);

  // Filter products by active tab categories if they are mapped
  // Since categories are fetched dynamically, let's map tab index to category names
  const categoryTabs = ['Điện thoại', 'Đồng hồ', 'Máy ảnh', 'Phụ kiện', 'Loa'];
  const filteredProducts = products.filter(p => {
    if (activeTab === 0) return true; // Show all by default
    const targetCat = categoryTabs[activeTab].toLowerCase();
    return p.categories?.some((cat: any) => 
      cat.name.toLowerCase().includes(targetCat) || 
      (targetCat === 'đồng hồ' && cat.name.toLowerCase().includes('watch')) ||
      (targetCat === 'máy ảnh' && cat.name.toLowerCase().includes('camera')) ||
      (targetCat === 'loa' && cat.name.toLowerCase().includes('speaker')) ||
      (targetCat === 'phụ kiện' && cat.name.toLowerCase().includes('accessory'))
    );
  }).slice(0, 5);

  const trendingProducts = filteredProducts.length > 0 ? filteredProducts : products.slice(0, 5);
  const forYouProducts = products.slice(5, 9);

  return (
    <main id="main">

      {/* HERO: bento grid */}
      <section className="hero">
        <div className="container">
          <div className="bento">

            <article className="bento-card bento-card--lg">
              <div className="sparkle"></div>
              <div>
                <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Zap size={14} fill="currentColor" /> Âm thanh · Nổi bật
                </span>
                <h2>Apple HomePod<br />Loa Thế hệ 2</h2>
                <p>Hệ sinh thái Apple với khả năng phát âm thanh chất lượng cao, đồng thời là trung tâm điều khiển các thiết bị nhà thông minh. Âm thanh không gian, công nghệ cảm biến phòng.</p>
                <Link to="/products" className="btn btn--paper">Mua ngay
                  <ChevronRight size={16} />
                </Link>
                <div className="dots"><span className="active"></span><span></span><span></span></div>
              </div>
              <img className="product" src="https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=900&q=80&auto=format&fit=crop" alt="HomePod speaker" />
            </article>

            <article className="bento-card bento-card--purple">
              <div className="sparkle"></div>
              <span className="eyebrow">Thiết bị đeo</span>
              <h3 style={{ fontSize: 'var(--text-xl)', lineHeight: 1.15 }}>Khám phá<br />Apple Watch</h3>
              <Link to="/products" className="shop-now">Mua ngay
                <ChevronRight size={14} />
              </Link>
              <img className="product" src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80&auto=format&fit=crop" alt="Apple Watch" />
            </article>

            <article className="bento-card bento-card--teal">
              <div className="sparkle"></div>
              <span className="eyebrow">Điện thoại mới nhất</span>
              <h3 style={{ fontSize: 'var(--text-xl)', lineHeight: 1.15 }}>Galaxy S24<br />Ultra · 5G</h3>
              <Link to="/products" className="shop-now">Mua ngay
                <ChevronRight size={14} />
              </Link>
              <img className="product" src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80&auto=format&fit=crop" alt="Samsung Galaxy phone" />
            </article>

            <div className="bento-row">
              <article className="bento-card bento-card--orange">
                <div className="sparkle"></div>
                <span className="eyebrow">Máy ảnh</span>
                <h3 style={{ fontSize: 'var(--text-lg)', lineHeight: 1.2 }}>Samsung<br />Gear Camera</h3>
                <Link to="/products" className="shop-now">Mua ngay
                  <ChevronRight size={14} />
                </Link>
                <img className="product" src="https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500&q=80&auto=format&fit=crop" alt="Camera" />
              </article>

              <article className="bento-card bento-card--green">
                <div className="sparkle"></div>
                <span className="eyebrow">Âm thanh</span>
                <h3 style={{ fontSize: 'var(--text-lg)', lineHeight: 1.2 }}>Beats<br />Studio Buds</h3>
                <Link to="/products" className="shop-now">Mua ngay
                  <ChevronRight size={14} />
                </Link>
                <img className="product" src="https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500&q=80&auto=format&fit=crop" alt="Earbuds" />
              </article>

              <article className="bento-card bento-card--black">
                <div className="sparkle"></div>
                <span className="eyebrow">Máy ảnh DSLR</span>
                <h3 style={{ fontSize: 'var(--text-lg)', lineHeight: 1.2 }}>Hero Camera<br />X-Series</h3>
                <Link to="/products" className="shop-now">Mua ngay
                  <ChevronRight size={14} />
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
            <h2>Sản phẩm thịnh hành</h2>
            <Link to="/products" className="view-all">Xem tất cả
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="tabs" role="tablist">
            {categoryTabs.map((tab, i) => (
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
            {isLoading ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 0', color: 'var(--fg-mute)' }}>
                Đang tải sản phẩm...
              </div>
            ) : trendingProducts.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 0', color: 'var(--fg-mute)' }}>
                Chưa có sản phẩm nào.
              </div>
            ) : (
              trendingProducts.map((p: any) => {
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
                  <article key={p.id} className="product-card">
                    <div className="img-wrap">
                      {oldPrice && <span className="badge badge--sale">Giảm giá</span>}
                      <button className="wishlist" aria-label="Wishlist"><Heart size={18} /></button>
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
        </div>
      </section>

      {/* DISCOUNT BANNERS */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="discount-row">
            <article className="discount-card discount-card--watch">
              <span className="meta">CHỈ TRONG TUẦN NÀY</span>
              <h3>Ưu Đãi Lớn<br /><span className="pct">Giảm 50%</span></h3>
              <Link to="/products" className="shop-now">Mua ngay
                <ChevronRight size={14} />
              </Link>
              <img className="product" src="https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&q=80&auto=format&fit=crop" alt="Smart watch" />
            </article>
            <article className="discount-card discount-card--airpods">
              <span className="meta">PHIÊN BẢN GIỚI HẠN</span>
              <h3>Studio Buds Pro<br /><span className="pct">Giảm 30%</span></h3>
              <Link to="/products" className="shop-now">Mua ngay
                <ChevronRight size={14} />
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
            <h2>Mua sắm theo danh mục</h2>
            <Link to="/products" className="view-all">Xem tất cả sản phẩm
              <ChevronRight size={16} />
            </Link>
          </div>
          <div className="cats-grid">
            {[
              { img: 'photo-1523275335684-37898b6baf30', name: 'Đồng hồ', count: 28 },
              { img: 'photo-1502920917128-1aa500764cbd', name: 'Máy ảnh', count: 42 },
              { img: 'photo-1511707171634-5f897ff02aa9', name: 'Điện thoại', count: 76 },
              { img: 'photo-1592840496694-26d035b52b48', name: 'Phụ kiện', count: 112 },
              { img: 'photo-1606220945770-b5b6c2c55bf1', name: 'Tai nghe', count: 35 },
            ].map((c, i) => (
              <Link key={i} to="/products" className="cat-tile">
                <div className="pic"><img src={`https://images.unsplash.com/${c.img}?w=300&q=80&auto=format&fit=crop`} alt="" /></div>
                <div className="name">{c.name}</div>
                <div className="count">{c.count} Sản phẩm</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* COMPACT ROW */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <h2>Dành cho bạn</h2>
            <Link to="/products" className="view-all">Nhiều lựa chọn hơn
              <ChevronRight size={16} />
            </Link>
          </div>
          <div className="compact-row">
            {isLoading ? (
              <div style={{ textAlign: 'center', width: '100%', padding: '2rem 0', color: 'var(--fg-mute)' }}>
                Đang tải...
              </div>
            ) : forYouProducts.length === 0 ? (
              <div style={{ textAlign: 'center', width: '100%', padding: '2rem 0', color: 'var(--fg-mute)' }}>
                Chưa có sản phẩm gợi ý.
              </div>
            ) : (
              forYouProducts.map((p: any) => {
                const pPrice = p.variants?.[0]?.prices?.find((pr: any) => pr.currency_code === 'vnd')?.amount 
                  || p.variants?.[0]?.prices?.[0]?.amount 
                  || p.variants?.[0]?.price 
                  || p.price 
                  || 0;
                
                const displayPrice = typeof pPrice === 'number' && pPrice > 0 ? pPrice.toLocaleString('vi-VN') + 'đ' : 'Liên hệ';
                const stock = p.variants?.[0]?.stock !== undefined ? p.variants[0].stock : 10;
                const imgUrl = p.thumbnail || 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&q=80&auto=format&fit=crop';

                return (
                  <article key={p.id} className="compact-card">
                    <div className="pic"><img src={imgUrl} alt={p.title} style={{ objectFit: 'contain' }} /></div>
                    <div>
                      <div className="stock">CÒN HÀNG · {stock}</div>
                      <div className="name">{p.title}</div>
                      <div className="price">{displayPrice}</div>
                      <Link to={`/product/${p.id}`} className="btn">Đặt Ngay</Link>
                    </div>
                  </article>
                );
              })
            )}
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
                <h2>Nhận ngay <strong>GIẢM 20%</strong> cho đơn hàng đầu tiên — gửi trực tiếp đến hộp thư của bạn.</h2>
                <p>Để lại email của bạn và chúng tôi sẽ gửi mã giảm giá một lần, cùng những ưu đãi mới nhất về các thiết bị chúng tôi vừa nhập về. Huỷ đăng ký bất cứ lúc nào.</p>
              </div>
              <form
                className="newsletter-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  (e.currentTarget.querySelector('button') as HTMLButtonElement).textContent = 'Đã gửi ✓';
                }}
              >
                <input type="email" required placeholder="Nhập email của bạn" aria-label="Địa chỉ Email" />
                <button className="btn" type="submit">Đăng ký <ArrowRight size={18} /></button>
              </form>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
};

export default HomePage;