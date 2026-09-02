import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCompareList } from '../utils/compare';
import { getWishlist } from '../utils/wishlist';
import { 
  Zap, 
  ArrowRight, 
  ChevronRight,
  Ticket
} from 'lucide-react';
import { useProducts, useCategories, useRecommendedProducts } from '../services/product.service';
import { HomePageProductCard } from '../components/HomePageProductCard';
import toast from 'react-hot-toast';
import './HomePage.css';


const heroSlides = [
  // 1. Top-left main hero
  {
    bg: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 60%, #0f172a 100%)',
    eyebrow: 'Siêu phẩm · Nổi bật',
    eyebrowColor: 'rgba(255,255,255,0.75)',
    title: 'iPhone 16 Pro Max\nTitan Sa Mạc',
    titleColor: '#ffffff',
    descColor: 'rgba(255,255,255,0.82)',
    desc: 'Khám phá đỉnh cao công nghệ với chip A18 Pro vượt trội, nút điều khiển Camera Control thông minh và thiết kế khung viền Titan sang trọng bậc nhất.',
    img: 'https://images.unsplash.com/photo-1727079547627-836b0e391f21?w=900&q=80&auto=format&fit=crop',
    alt: 'iPhone 16 Pro Max',
    link: '/products'
  },
  // 2. Top-right first (red sale)
  {
    bg: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #7f1d1d 100%)',
    eyebrow: '⭐ Đại Lễ Quốc Khánh 2/9',
    eyebrowColor: '#fef08a',
    title: 'SIÊU SALE 2/9\nGIẢM TỚI 50%',
    titleColor: '#fef08a',
    descColor: '#fef2f2',
    desc: 'FreeShip toàn quốc · Ưu đãi cực hot dành cho tất cả sản phẩm. Nhanh tay kẻo hết!',
    img: '',
    alt: 'Siêu Sale 2/9',
    link: '/products?sale=2-9'
  },
  // 3. Top-right second (teal)
  {
    bg: 'linear-gradient(135deg, #065f46 0%, #047857 55%, #0f172a 100%)',
    eyebrow: 'Flagship Galaxy AI',
    eyebrowColor: 'rgba(167,243,208,0.85)',
    title: 'Samsung Galaxy\nS24 Ultra · 5G',
    titleColor: '#ecfdf5',
    descColor: 'rgba(209,250,229,0.85)',
    desc: 'Trải nghiệm AI thông minh tích hợp, bút S Pen sắc bén và camera 200MP đỉnh cao dành cho những khoảnh khắc hoàn hảo.',
    img: 'https://images.unsplash.com/photo-1705585175110-d25f92c183aa?w=900&q=80&auto=format&fit=crop',
    alt: 'Samsung Galaxy S24 Ultra',
    link: '/products'
  },
  // 4. Bottom-right (black)
  {
    bg: 'linear-gradient(135deg, #18181b 0%, #27272a 55%, #3f3f46 100%)',
    eyebrow: 'Hiệu năng tối đa',
    eyebrowColor: 'rgba(212,212,216,0.75)',
    title: 'Xiaomi 14 Ultra\nMàn hình Leica',
    titleColor: '#f4f4f5',
    descColor: 'rgba(228,228,231,0.82)',
    desc: 'Hệ thống camera Leica đỉnh cao, chip Snapdragon 8 Gen 3 cùng sạc nhanh HyperCharge 90W siêu tốc.',
    img: 'https://images.unsplash.com/photo-1770274813875-346bfaf0ee11?w=900&q=80&auto=format&fit=crop',
    alt: 'Xiaomi 14 Ultra',
    link: '/products'
  },
  // 5. Bottom-center (purple)
  {
    bg: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 55%, #1e1b4b 100%)',
    eyebrow: 'Đỉnh cao Apple',
    eyebrowColor: 'rgba(221,214,254,0.85)',
    title: 'iPhone 16 Pro\nTitan Tự Nhiên',
    titleColor: '#f5f3ff',
    descColor: 'rgba(237,233,254,0.82)',
    desc: 'Thiết kế khung titan thanh lịch, màn hình Super Retina XDR 6.3" sắc nét cùng hệ thống camera chuyên nghiệp đột phá.',
    img: 'https://images.unsplash.com/photo-1726732970014-f2df88c87dd3?w=900&q=80&auto=format&fit=crop',
    alt: 'iPhone 16 Pro',
    link: '/products'
  },
  // 6. Bottom-left (orange)
  {
    bg: 'linear-gradient(135deg, #b45309 0%, #92400e 55%, #1c1917 100%)',
    eyebrow: 'Nhiếp ảnh chuyên nghiệp',
    eyebrowColor: 'rgba(254,215,170,0.85)',
    title: 'OPPO Find X8\nCamera Hasselblad',
    titleColor: '#fff7ed',
    descColor: 'rgba(254,243,199,0.82)',
    desc: 'Hệ thống camera đồng thương hiệu Hasselblad cùng chip Dimensity 9400 mạnh mẽ, thiết kế premium tinh tế.',
    img: 'https://images.unsplash.com/photo-1779171443655-da6287ba0d2e?w=900&q=80&auto=format&fit=crop',
    alt: 'OPPO Find X8',
    link: '/products'
  }
];

const HomePage = () => {
  const [heroIdx, setHeroIdx] = useState(0);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [compareList, setCompareList] = useState(getCompareList());
  const [wishlist, setWishlist] = useState(getWishlist());
  
  const [promotions, setPromotions] = useState<any[]>([]);
  const [copiedCodes, setCopiedCodes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIdx(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await fetch('http://localhost:9000/store/promotions', {
          headers: {
            'x-publishable-api-key': 'pk_a2f0825ab169a70b98f5a520693ca5e8e633f36c1b5dabd5548326c5451c4e6d'
          }
        });
        if (res.ok) {
          const data = await res.json();
          setPromotions(data.promotions || []);
        }
      } catch (err) {
        console.error("Failed to fetch promotions in homepage:", err);
      }
    };
    fetchPromotions();
  }, []);

  const activePromos = promotions.length > 0 ? promotions : [
    {
      id: 'fallback-1',
      code: 'GIAM100K',
      app_method_type: 'fixed',
      app_method_value: 100000,
      is_automatic: false
    },
    {
      id: 'fallback-2',
      code: 'GIAM50K',
      app_method_type: 'fixed',
      app_method_value: 50000,
      is_automatic: true
    }
  ];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã ${code}!`);
    setCopiedCodes(prev => ({ ...prev, [code]: true }));
    setTimeout(() => {
      setCopiedCodes(prev => ({ ...prev, [code]: false }));
    }, 3000);
  };

  const getPromotionRuleLabel = (promo: any) => {
    if (!promo.target_rules || promo.target_rules.length === 0) {
      return promo.is_automatic ? 'Áp dụng khi thanh toán' : 'Nhập mã để nhận ưu đãi';
    }
    
    const rulesText = promo.target_rules.map((rule: any) => {
      if (rule.collection_title) {
        return `dòng ${rule.collection_title}`;
      }
      if (rule.product_title) {
        return `sản phẩm ${rule.product_title}`;
      }
      return '';
    }).filter(Boolean).join(', ');

    if (rulesText) {
      return `Chỉ áp dụng cho ${rulesText}`;
    }
    return promo.is_automatic ? 'Áp dụng khi thanh toán' : 'Nhập mã để nhận ưu đãi';
  };



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
  const { data: recommendedProductsData } = useRecommendedProducts(sessionId);
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
  // Nếu có recommended products thì hiển thị, nếu không thì fallback về mảng lấy ngẫu nhiên/cắt từ list chung
  const fallbackProducts = products.filter((p: any) => !trendingProducts.includes(p));
  const forYouProducts = recommendedProductsList.length > 0 
    ? recommendedProductsList.slice(0, 4)
    : (fallbackProducts.length >= 4 ? fallbackProducts.slice(0, 4) : products.slice(0, 4));

  // Lấy sessionId từ localStorage (giả lập đơn giản cho user vãng lai)

  return (
    <main id="main">

      {/* HERO: bento grid */}
      <section className="hero" style={{ paddingTop: 'var(--s4)' }}>
        <div className="container">
          <div className="bento">

            <article className="bento-card bento-card--lg" style={{
              background: heroSlides[heroIdx].bg,
              transition: 'background 0.8s ease'
            }}>
              <div className="sparkle"></div>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '4px', transition: 'opacity 0.5s', color: heroSlides[heroIdx].eyebrowColor }}>
                  <Zap size={14} fill="currentColor" /> {heroSlides[heroIdx].eyebrow}
                </span>
                <h2 key={`title-${heroIdx}`} style={{ animation: 'heroFadeIn 0.6s ease', color: heroSlides[heroIdx].titleColor }}>
                  {heroSlides[heroIdx].title.split('\n').map((line, i) => (
                    <span key={i}>{line}{i < heroSlides[heroIdx].title.split('\n').length - 1 && <br />}</span>
                  ))}
                </h2>
                <p key={`desc-${heroIdx}`} style={{ animation: 'heroFadeIn 0.7s ease', color: heroSlides[heroIdx].descColor }}>
                  {heroSlides[heroIdx].desc}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '50px', marginTop: '1.5rem' }}>
                  <Link to={heroSlides[heroIdx].link} className="btn btn--paper">
                    Mua ngay
                    <ChevronRight size={16} />
                  </Link>
                  <div className="dots" style={{ margin: 0 }}>
                    {heroSlides.map((_, i) => (
                      <span
                        key={i}
                        className={i === heroIdx ? 'active' : ''}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setHeroIdx(i)}
                      />
                    ))}
                  </div>
                </div>
              </div>
              {heroSlides[heroIdx].img ? (
                <img
                  key={`img-${heroIdx}`}
                  className="product"
                  src={heroSlides[heroIdx].img}
                  alt={heroSlides[heroIdx].alt}
                  style={{ animation: 'heroSlideIn 0.7s ease' }}
                />
              ) : (
                /* Ngôi sao trang trí lớn cho slide SIÊU SALE 2/9 */
                <span style={{
                  position: 'absolute',
                  right: '-20px',
                  bottom: '-40px',
                  fontSize: '320px',
                  color: 'rgba(254, 240, 138, 0.10)',
                  lineHeight: 1,
                  pointerEvents: 'none',
                  userSelect: 'none',
                  animation: 'heroFadeIn 0.8s ease',
                  fontWeight: 900
                }}>★</span>
              )}
            </article>

            <article className="bento-card bento-card--sale29">
              <div className="sparkle"></div>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', zIndex: 2 }}>
                <div>
                  <span className="eyebrow" style={{ color: '#fef08a', fontWeight: 800, letterSpacing: '0.5px', background: 'rgba(0, 0, 0, 0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                    ⭐ ĐẠI LỄ QUỐC KHÁNH 2/9
                  </span>
                  <h3 style={{ fontSize: '22px', fontWeight: 900, lineHeight: 1.15, color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.3)', marginTop: '8px', marginBottom: '6px' }}>
                    SIÊU SALE 2/9<br /><span style={{ color: '#fef08a' }}>GIẢM TỚI 50%</span>
                  </h3>
                  <p style={{ fontSize: '12px', color: '#fef2f2', margin: 0, opacity: 0.95, fontWeight: 500 }}>
                    FreeShip toàn quốc · Ưu đãi cực hot
                  </p>
                </div>
                <Link to="/products?sale=2-9" className="shop-now" style={{ color: '#7f1d1d', background: '#fef08a', padding: '6px 14px', borderRadius: '8px', fontWeight: 800, width: 'fit-content', marginTop: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                  Xem khuyến mãi
                  <ChevronRight size={14} />
                </Link>
              </div>
            </article>

            <article className="bento-card bento-card--teal">
              <div className="sparkle"></div>
              <span className="eyebrow">Flagship Galaxy AI</span>
              <h3 style={{ fontSize: 'var(--text-xl)', lineHeight: 1.15 }}>Galaxy S24<br />Ultra · 5G</h3>
              <Link to="/products" className="shop-now">Mua ngay
                <ChevronRight size={14} />
              </Link>
              <img className="product" src="https://images.unsplash.com/photo-1705585175110-d25f92c183aa?w=600&q=80&auto=format&fit=crop" alt="Samsung Galaxy S24 Ultra" />
            </article>

            <div className="bento-row">
              <article className="bento-card bento-card--orange">
                <div className="sparkle"></div>
                <span className="eyebrow">Nhiếp ảnh chuyên nghiệp</span>
                <h3 style={{ fontSize: 'var(--text-lg)', lineHeight: 1.2 }}>OPPO Find X8<br />Camera Hasselblad</h3>
                <Link to="/products" className="shop-now">Mua ngay
                  <ChevronRight size={14} />
                </Link>
                <img className="product" src="https://images.unsplash.com/photo-1779171443655-da6287ba0d2e?w=500&q=80&auto=format&fit=crop" alt="OPPO Find X8" />
              </article>

              <article className="bento-card bento-card--purple">
                <div className="sparkle"></div>
                <span className="eyebrow">Đỉnh cao Apple</span>
                <h3 style={{ fontSize: 'var(--text-lg)', lineHeight: 1.2 }}>iPhone 16 Pro<br />Titan Tự Nhiên</h3>
                <Link to="/products" className="shop-now">Mua ngay
                  <ChevronRight size={14} />
                </Link>
                <img className="product" src="https://images.unsplash.com/photo-1726732970014-f2df88c87dd3?w=500&q=80&auto=format&fit=crop" alt="iPhone 16 Pro" />
              </article>

              <article className="bento-card bento-card--black">
                <div className="sparkle"></div>
                <span className="eyebrow">Hiệu năng tối đa</span>
                <h3 style={{ fontSize: 'var(--text-lg)', lineHeight: 1.2 }}>Xiaomi 14 Ultra<br />Màn hình Leica</h3>
                <Link to="/products" className="shop-now">Mua ngay
                  <ChevronRight size={14} />
                </Link>
                <img className="product" src="https://images.unsplash.com/photo-1770274813875-346bfaf0ee11?w=500&q=80&auto=format&fit=crop" alt="Xiaomi 14 Ultra" />
              </article>
            </div>

          </div>
        </div>
      </section>
  
      {/* VOUCHER BOARD */}
      <section className="voucher-board-section">
        <div className="container">
          <div className="voucher-board-title">
            <Ticket size={22} style={{ color: 'var(--primary)' }} />
            <span>Mã Giảm Giá Dành Cho Bạn</span>
          </div>
          <div className="voucher-grid">
            {activePromos.map((promo: any) => {
              const valueFormatted = promo.app_method_type === 'percentage' 
                ? `${promo.app_method_value}%` 
                : `${Number(promo.app_method_value).toLocaleString('vi-VN')}đ`;

              return (
                <div key={promo.id} className="voucher-card">
                  <div className="voucher-ticket-left">
                    <span className={`voucher-type-badge ${promo.is_automatic ? 'automatic' : 'manual'}`}>
                      {promo.is_automatic ? 'Tự động' : 'Mã giảm giá'}
                    </span>
                    <div className="voucher-discount">Giảm {valueFormatted}</div>
                    <span className="voucher-limit-label">
                      {getPromotionRuleLabel(promo)}
                    </span>
                  </div>
                  
                  <div className="voucher-dashed-divider"></div>
                  
                  <div className="voucher-ticket-right">
                    <span className="voucher-code">{promo.code}</span>
                    {promo.is_automatic ? (
                      <span className="voucher-btn auto">Tự động</span>
                    ) : (
                      <button 
                        className={`voucher-btn ${copiedCodes[promo.code] ? 'copied' : ''}`}
                        onClick={() => handleCopyCode(promo.code)}
                        disabled={copiedCodes[promo.code]}
                      >
                        {copiedCodes[promo.code] ? 'Đã lưu ✓' : 'Sao chép'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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
            {categories
              .filter((cat: any) => {
                if (cat.parent_category_id) return false;
                const name = cat.name?.toLowerCase() || '';
                return !['laptop', 'phụ kiện', 'accessories', 'đồng hồ', 'watch', 'sạc', 'cáp', 'tai nghe', 'loa', 'âm thanh'].some(term => name.includes(term));
              })
              .map((cat: any) => {
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

      {/* CATEGORIES */}
      <section className="section" style={{ paddingTop: 'var(--s4)' }}>
        <div className="container">
          <div className="section-head">
            <h2>Mua sắm theo danh mục</h2>
            <Link to="/products" className="view-all">Xem tất cả sản phẩm
              <ChevronRight size={16} />
            </Link>
          </div>
          <div className="cats-grid">
            {categories
              .filter((c: any) => {
                const name = c.name?.toLowerCase() || '';
                return !['laptop', 'phụ kiện', 'accessories', 'đồng hồ', 'watch', 'sạc', 'cáp', 'tai nghe', 'loa', 'âm thanh'].some(term => name.includes(term));
              })
              .slice(0, 5)
              .map((c: any) => {
                return (
                  <Link key={c.id} to={`/products?category_id=${c.id}`} className="cat-tile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', minHeight: '60px' }}>
                    <div className="name" style={{ fontSize: '16px', fontWeight: 600 }}>{c.name}</div>
                  </Link>
                );
              })}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="discount-row">
            <article className="discount-card discount-card--watch">
              <span className="meta">ƯU ĐÃI LỚN GALAXY</span>
              <h3>Galaxy S24 Series<br /><span className="pct">Giảm 20%</span></h3>
              <Link to="/products" className="shop-now">Mua ngay
                <ChevronRight size={14} />
              </Link>
              <img className="product" src="https://images.unsplash.com/photo-1705585175110-d25f92c183aa?w=500&q=80&auto=format&fit=crop" alt="Galaxy S24" />
            </article>
            <article className="discount-card discount-card--airpods">
              <span className="meta">ĐỈNH CAO APPLE</span>
              <h3>iPhone 15 Pro<br /><span className="pct">Giảm 15%</span></h3>
              <Link to="/products" className="shop-now">Mua ngay
                <ChevronRight size={14} />
              </Link>
              <img className="product" src="https://images.unsplash.com/photo-1710023038502-ba80a70a9f53?w=500&q=80&auto=format&fit=crop" alt="iPhone 15 Pro" />
            </article>
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