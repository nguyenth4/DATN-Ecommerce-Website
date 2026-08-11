import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCompareList, toggleCompareProduct } from '../utils/compare';
import { getWishlist, toggleWishlistProduct } from '../utils/wishlist';
import { 
  Zap, 
  ArrowRight, 
  ChevronRight, 
  Heart, 
  Star
} from 'lucide-react';
import { useProducts, useCategories, useRecommendedProducts } from '../services/product.service';
import { HomePageProductCard } from '../components/HomePageProductCard';

const getCategoryFallbackImage = (name: string) => {
  if (!name) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80&auto=format&fit=crop';
  const n = name.toLowerCase();
  
  if (n.includes('laptop') || n.includes('máy tính')) return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&q=80&auto=format&fit=crop';
  if (n.includes('iphone') || n.includes('apple')) return 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=300&q=80&auto=format&fit=crop';
  if (n.includes('samsung') || n.includes('galaxy')) return 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&q=80&auto=format&fit=crop';
  if (n.includes('oppo') || n.includes('vivo') || n.includes('xiaomi')) return 'https://images.unsplash.com/photo-1598327105666-5b893c0bcce0?w=300&q=80&auto=format&fit=crop';
  if (n.includes('điện thoại') || n.includes('phone')) return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80&auto=format&fit=crop';
  if (n.includes('tai nghe') || n.includes('headphone') || n.includes('audio')) return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80&auto=format&fit=crop';
  if (n.includes('đồng hồ') || n.includes('watch')) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80&auto=format&fit=crop';
  if (n.includes('máy ảnh') || n.includes('camera')) return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&q=80&auto=format&fit=crop';
  
  return 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=300&q=80&auto=format&fit=crop';
};

const HomePage = () => {
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [compareList, setCompareList] = useState(getCompareList());
  const [wishlist, setWishlist] = useState(getWishlist());

  // Lấy sessionId từ localStorage (giả lập đơn giản cho user vãng lai)
  const sessionId = typeof window !== 'undefined' ? (localStorage.getItem('session_id') || Math.random().toString(36).substring(7)) : undefined;
  if (typeof window !== 'undefined' && !localStorage.getItem('session_id') && sessionId) {
    localStorage.setItem('session_id', sessionId);
  }

  // Fetch categories & products
  const { data: categories = [] } = useCategories();
  const { data, isLoading } = useProducts({ 
    limit: 20,
    ...(selectedCatId ? { category_id: [selectedCatId] } : {})
  });
  const products = data?.products || [];

  // Lấy dữ liệu gợi ý cho user
  const { data: recommendedProductsData, isLoading: isLoadingRecommended } = useRecommendedProducts(sessionId);
  const recommendedProductsList = recommendedProductsData || [];

  useEffect(() => {
    const handleUpdate = () => {
      setCompareList(getCompareList());
    };
    const handleWishlistUpdate = () => {
      setWishlist(getWishlist());
    };
    window.addEventListener('compare-updated', handleUpdate);
    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    return () => {
      window.removeEventListener('compare-updated', handleUpdate);
      window.removeEventListener('wishlist-updated', handleWishlistUpdate);
    };
  }, []);

  const trendingProducts = products.slice(0, 10);
  // Nếu có recommended products thì hiển thị, nếu không thì fallback về mảng cắt từ list chung
  const forYouProducts = recommendedProductsList.length > 0 
    ? recommendedProductsList 
    : (products.length > 5 ? products.slice(5, 9) : products.slice(0, 4));

  return (
    <main id="main">
      {/* HERO: bento grid */}
      <section className="hero" style={{ paddingTop: 'var(--s4)' }}>
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
                <img className="product" src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80&auto=format&fit=crop" alt="Camera" />
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

          <div className="tabs" role="tablist" style={{ overflow: 'visible', flexWrap: 'wrap', paddingBottom: '4px', position: 'relative', zIndex: 30 }}>
            <button
              className={`tab${selectedCatId === null ? ' is-active' : ''}`}
              role="tab"
              aria-selected={selectedCatId === null}
              onClick={() => setSelectedCatId(null)}
            >
              Tất cả
            </button>
            {categories.filter((cat: any) => !cat.parent_category_id).map((cat: any) => {
              const hasChildren = cat.category_children && cat.category_children.length > 0;
              const isCatOrChildActive = selectedCatId === cat.id || cat.category_children?.some((c: any) => c.id === selectedCatId);

              if (!hasChildren) {
                return (
                  <button
                    key={cat.id}
                    className={`tab${selectedCatId === cat.id ? ' is-active' : ''}`}
                    role="tab"
                    aria-selected={selectedCatId === cat.id}
                    onClick={() => setSelectedCatId(cat.id)}
                  >
                    {cat.name}
                  </button>
                );
              }

              return (
                <div key={cat.id} className="tab-dropdown-wrap" style={{ position: 'relative', display: 'inline-block' }}>
                  <button
                    className={`tab${isCatOrChildActive ? ' is-active' : ''}`}
                    role="tab"
                    onClick={() => setSelectedCatId(cat.id)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    {cat.name}
                    <ChevronRight size={14} style={{ transform: 'rotate(90deg)', transition: 'transform 0.2s' }} />
                  </button>

                  <div className="tab-dropdown-menu">
                    {cat.category_children.map((child: any) => (
                      <button
                        key={child.id}
                        className={`tab-dropdown-item${selectedCatId === child.id ? ' is-selected' : ''}`}
                        onClick={() => setSelectedCatId(child.id)}
                      >
                        {child.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="products">
            {isLoading ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 0', color: 'var(--fg-mute)' }}>
                Đang tải sản phẩm...
              </div>
            ) : trendingProducts.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 0', color: 'var(--fg-mute)' }}>
                Chưa có sản phẩm nào trong danh mục này.
              </div>
            ) : (
              trendingProducts.map((p: any) => (
                <HomePageProductCard key={p.id} p={p} compareList={compareList} wishlist={wishlist} />
              ))
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
            {categories.slice(0, 5).map((c: any) => {
              return (
                <Link key={c.id} to="/products" className="cat-tile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="name" style={{ fontSize: '16px' }}>{c.name}</div>
                </Link>
              );
            })}
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
          <div className="products" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
            {isLoading ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', width: '100%', padding: '2rem 0', color: 'var(--fg-mute)' }}>
                Đang tải...
              </div>
            ) : forYouProducts.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', width: '100%', padding: '2rem 0', color: 'var(--fg-mute)' }}>
                Chưa có sản phẩm gợi ý.
              </div>
            ) : (
              forYouProducts.map((p: any) => (
                <HomePageProductCard key={p.id} p={p} compareList={compareList} wishlist={wishlist} />
              ))
            )}
          </div>
        </div>
      </section>



      {/* NEWSLETTER */}
      <section style={{ background: 'var(--paper)' }}>
        <div className="container">
          <div className="newsletter">
            <div className="newsletter-grid">
              <div>
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