import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getCompareList, toggleCompareProduct } from '../utils/compare';
import { getWishlist, toggleWishlistProduct } from '../utils/wishlist';
import {
  Star,
  Heart,
  ChevronRight,
  ChevronLeft,
  Search,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { useProducts, useCategories, useProductPriceRange } from '../services/product.service';
import { ProductCardSkeleton } from '../components/ProductCardSkeleton';
import toast from 'react-hot-toast';
import './ProductsPage.css';

// ── Format tiền VND ──────────────────────────────────────────────────────────
const fmtVND = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + ' triệu';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
  return n.toLocaleString('vi-VN') + 'đ';
};

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [compareList, setCompareList] = useState(getCompareList());
  const [wishlist, setWishlist] = useState(getWishlist());

  // Filter states
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [sortBy, setSortBy] = useState(searchParams.get('order') || 'popular');
  const [selectedCats, setSelectedCats] = useState<string[]>(
    searchParams.get('category_id')?.split(',') || []
  );
  const [page, setPage] = useState(1);
  const limit = 12;

  // ── Price range state ─────────────────────────────────────────────────────
  // priceRange = giá trị slider hiện tại [min, max]
  // appliedPrice = giá trị đang áp dụng để lọc (chỉ set khi bấm "Áp dụng")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50_000_000]);
  const [appliedPrice, setAppliedPrice] = useState<[number, number] | null>(null);
  const prevBoundsRef = useRef<string>('');

  // Fetch price bounds theo danh mục đang chọn
  const { data: priceBounds } = useProductPriceRange(selectedCats);
  const boundsMin = priceBounds?.min ?? 0;
  const boundsMax = priceBounds?.max ?? 50_000_000;

  // Khi bounds thay đổi (do đổi danh mục) → reset slider về toàn bộ range
  useEffect(() => {
    const key = `${boundsMin}_${boundsMax}`;
    if (key !== prevBoundsRef.current) {
      prevBoundsRef.current = key;
      setPriceRange([boundsMin, boundsMax]);
      setAppliedPrice(null); // Bỏ filter giá cũ
    }
  }, [boundsMin, boundsMax]);

  // Listen for compare list updates
  // Listen for compare list & wishlist updates
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

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      if (search) searchParams.set('q', search);
      else searchParams.delete('q');
      setSearchParams(searchParams);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch data from Medusa
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({
    limit,
    offset: (page - 1) * limit,
    q: debouncedSearch || undefined,
    category_id: selectedCats.length > 0 ? selectedCats : undefined,
    order: sortBy === 'popular' ? undefined : sortBy
  });

  const { data: categoriesData } = useCategories();

  // ── Lọc giá trên products đã fetch ────────────────────────────────────────
  const rawProducts = productsData?.products || [];
  const totalCount = productsData?.count || 0;
  const categories = categoriesData || [];

  const getProductPrice = (p: any): number => {
    return p.variants?.[0]?.prices?.find((pr: any) => pr.currency_code === 'vnd')?.amount
      || p.variants?.[0]?.prices?.[0]?.amount
      || p.variants?.[0]?.price
      || p.price
      || 0;
  };

  const products = appliedPrice
    ? rawProducts.filter((p: any) => {
      const price = getProductPrice(p);
      return price >= appliedPrice[0] && price <= appliedPrice[1];
    })
    : rawProducts;

  const getProductImage = (p: any) => {
    return p.thumbnail || (p.images?.[0]?.url) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';
  };

  // ── Dual-thumb slider handler ─────────────────────────────────────────────
  const handleRangeMin = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setPriceRange(prev => [Math.min(val, prev[1] - 500_000), prev[1]]);
  }, []);

  const handleRangeMax = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setPriceRange(prev => [prev[0], Math.max(val, prev[0] + 500_000)]);
  }, []);

  // Handle category toggle
  const toggleCategory = (id: string) => {
    setSelectedCats(prev => {
      const next = prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id];
      // Sync with URL
      if (next.length > 0) searchParams.set('category_id', next.join(','));
      else searchParams.delete('category_id');
      setSearchParams(searchParams);
      return next;
    });
    setPage(1); // Reset to first page
  };

  // Handle sort change
  const handleSortChange = (val: string) => {
    setSortBy(val);
    if (val !== 'popular') searchParams.set('order', val);
    else searchParams.delete('order');
    setSearchParams(searchParams);
    setPage(1);
  };

  // Tính % vị trí thumb trên track
  const span = boundsMax - boundsMin || 1;
  const leftPc = ((priceRange[0] - boundsMin) / span) * 100;
  const rightPc = 100 - ((priceRange[1] - boundsMin) / span) * 100;

  const isPriceFiltered = appliedPrice !== null
    && (appliedPrice[0] > boundsMin || appliedPrice[1] < boundsMax);

  return (
    <>
      <main id="main">
        <section className="page-head">
          <div className="container">
            <div className="crumbs">
              <Link to="/">Trang chủ</Link> <span className="sep">/</span> <span>Cửa hàng · Tất cả sản phẩm</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--s4)' }}>
              <div>
                <h1>Tất cả sản phẩm</h1>
                <p>Khám phá bộ sưu tập công nghệ mới nhất từ điện thoại, máy tính đến phụ kiện âm thanh.</p>
              </div>

              {/* Search Implementation */}
              <div className="search-bar" style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-mute)' }} />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 16px 10px 40px',
                    borderRadius: '50px',
                    border: '1px solid var(--border)',
                    background: 'var(--paper)',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            {/* Mobile Filter Trigger */}
            <button
              className="btn btn--paper mobile-filter-btn"
              onClick={() => setDrawerOpen(true)}
              style={{ display: 'none', marginBottom: 'var(--s4)', width: '100%', justifyContent: 'center' }}
            >
              <SlidersHorizontal size={18} /> Bộ lọc
            </button>

            <div className="shop-layout">

              <aside className={`filters${drawerOpen ? ' is-open' : ''}`} aria-label="Bộ lọc">
                <div className="drawer-head" style={{ display: 'none', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s6)' }}>
                  <h3>Bộ lọc</h3>
                  <button onClick={() => setDrawerOpen(false)}><X size={24} /></button>
                </div>

                <div className="filter-block">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s3)' }}>
                    <h3>Danh mục</h3>
                    {selectedCats.length > 0 && (
                      <button
                        onClick={() => { setSelectedCats([]); searchParams.delete('category_id'); setSearchParams(searchParams); }}
                        style={{ fontSize: '12px', color: 'var(--indigo)', fontWeight: 600 }}
                      >
                        Xoá lọc
                      </button>
                    )}
                  </div>
                  {categories.map((cat: any) => (
                    <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px 0' }}>
                      <input
                        type="checkbox"
                        checked={selectedCats.includes(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                      />
                      {cat.name}
                      <span className="ct" style={{ marginLeft: 'auto', opacity: 0.5, fontSize: '12px' }}>
                        {cat.products?.length || ''}
                      </span>
                    </label>
                  ))}
                </div>

                {/* ── Khoảng giá — dynamic theo danh mục ── */}
                <div className="filter-block">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s3)' }}>
                    <h3>Khoảng giá</h3>
                    {isPriceFiltered && (
                      <button
                        onClick={() => { setAppliedPrice(null); setPriceRange([boundsMin, boundsMax]); }}
                        style={{ fontSize: '12px', color: 'var(--indigo)', fontWeight: 600 }}
                      >
                        Xoá lọc
                      </button>
                    )}
                  </div>

                  {/* Giá min/max của range đang chọn */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{
                      fontSize: '12px', fontWeight: 700, color: 'var(--indigo)',
                      background: 'var(--indigo-light, #eef2ff)', padding: '3px 8px', borderRadius: '6px'
                    }}>
                      {fmtVND(priceRange[0])}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--fg-mute)' }}>—</span>
                    <span style={{
                      fontSize: '12px', fontWeight: 700, color: 'var(--indigo)',
                      background: 'var(--indigo-light, #eef2ff)', padding: '3px 8px', borderRadius: '6px'
                    }}>
                      {fmtVND(priceRange[1])}
                    </span>
                  </div>

                  {/* Dual-thumb range slider */}
                  <div style={{ position: 'relative', height: '28px', display: 'flex', alignItems: 'center' }}>
                    {/* Track background */}
                    <div style={{
                      position: 'absolute', left: 0, right: 0,
                      height: '4px', background: 'var(--border, #e2e8f0)', borderRadius: '2px'
                    }} />
                    {/* Active track (highlight giữa 2 thumbs) */}
                    <div style={{
                      position: 'absolute',
                      left: `${leftPc}%`,
                      right: `${rightPc}%`,
                      height: '4px',
                      background: 'var(--indigo, #4f46e5)',
                      borderRadius: '2px',
                      transition: 'left 0.05s, right 0.05s',
                    }} />
                    {/* Thumb MIN */}
                    <input
                      type="range"
                      min={boundsMin}
                      max={boundsMax}
                      step={Math.max(500_000, Math.round((boundsMax - boundsMin) / 100))}
                      value={priceRange[0]}
                      onChange={handleRangeMin}
                      aria-label="Giá thấp nhất"
                      style={{
                        position: 'absolute', width: '100%',
                        appearance: 'none', background: 'transparent',
                        pointerEvents: 'auto', zIndex: priceRange[0] > boundsMax - (boundsMax - boundsMin) * 0.1 ? 3 : 2,
                      }}
                      className="price-thumb"
                    />
                    {/* Thumb MAX */}
                    <input
                      type="range"
                      min={boundsMin}
                      max={boundsMax}
                      step={Math.max(500_000, Math.round((boundsMax - boundsMin) / 100))}
                      value={priceRange[1]}
                      onChange={handleRangeMax}
                      aria-label="Giá cao nhất"
                      style={{
                        position: 'absolute', width: '100%',
                        appearance: 'none', background: 'transparent',
                        pointerEvents: 'auto', zIndex: 2,
                      }}
                      className="price-thumb"
                    />
                  </div>

                  {/* Giá bounds hiển thị dưới track */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--fg-mute)', marginTop: '6px' }}>
                    <span>{fmtVND(boundsMin)}</span>
                    <span>{fmtVND(boundsMax)}</span>
                  </div>

                  {/* Nút áp dụng */}
                  <button
                    className="btn btn--indigo btn--block"
                    style={{ marginTop: '12px', fontSize: '13px', padding: '8px' }}
                    onClick={() => { setAppliedPrice([priceRange[0], priceRange[1]]); setPage(1); }}
                  >
                    Áp dụng
                  </button>
                </div>

                <div className="filter-block">
                  <h3>Tình trạng</h3>
                  <label><input type="checkbox" defaultChecked /> Còn hàng</label>
                  <label><input type="checkbox" /> Đang giảm giá</label>
                  <label><input type="checkbox" /> Sản phẩm mới</label>
                </div>

                <button className="btn btn--indigo btn--block" onClick={() => setDrawerOpen(false)}>
                  Xem {products.length} sản phẩm
                </button>
              </aside>

              <div>
                <div className="shop-toolbar">
                  <span className="count">
                    {isLoadingProducts ? 'Đang tải...' : `Hiển thị ${(page - 1) * limit + 1} – ${Math.min(page * limit, totalCount)} của ${totalCount} sản phẩm`}
                  </span>
                  <div style={{ display: 'flex', gap: 'var(--s3)', alignItems: 'center' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-mute)', fontWeight: 600 }}>SẮP XẾP</span>
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--paper)', fontSize: '14px' }}
                    >
                      <option value="popular">Phổ biến nhất</option>
                      <option value="views">Lượt xem nhiều nhất</option>
                      <option value="sales">Bán chạy nhất</option>
                      <option value="rating">Đánh giá cao nhất</option>
                      <option value="createdAt">Mới nhất</option>
                      <option value="price_asc">Giá: thấp đến cao</option>
                      <option value="price_desc">Giá: cao đến thấp</option>
                    </select>
                  </div>
                </div>

                {isLoadingProducts ? (
                  <div className="shop-grid">
                    {[...Array(12)].map((_, i) => (
                      <ProductCardSkeleton key={i} />
                    ))}
                  </div>
                ) : products.length > 0 ? (
                  <div className="shop-grid">
                    {(() => {
                      let sortedProducts = [...products];

                      // Client-side sorting for custom options
                      if (sortBy === 'views') {
                        sortedProducts.sort((a, b) => (Number(b.metadata?.view_count || b.metadata?.views || 0) - Number(a.metadata?.view_count || a.metadata?.views || 0)));
                      } else if (sortBy === 'sales') {
                        sortedProducts.sort((a, b) => (Number(b.metadata?.sale_count || b.metadata?.sales || 0) - Number(a.metadata?.sale_count || a.metadata?.sales || 0)));
                      } else if (sortBy === 'rating') {
                        sortedProducts.sort((a, b) => (Number(b.metadata?.rating || 0) - Number(a.metadata?.rating || 0)));
                      } else if (sortBy === 'popular') {
                        // Default popular sorting (combined score or just rating)
                        sortedProducts.sort((a, b) => {
                          const scoreA = (Number(a.metadata?.rating || 5) * 10) + (Number(a.metadata?.view_count || 10));
                          const scoreB = (Number(b.metadata?.rating || 5) * 10) + (Number(b.metadata?.view_count || 10));
                          return scoreB - scoreA;
                        });
                      } else if (sortBy === 'price_asc') {
                        sortedProducts.sort((a, b) => {
                          const priceA = a.variants?.[0]?.prices?.find((pr: any) => pr.currency_code === 'vnd')?.amount || a.variants?.[0]?.prices?.[0]?.amount || a.variants?.[0]?.price || a.price || 0;
                          const priceB = b.variants?.[0]?.prices?.find((pr: any) => pr.currency_code === 'vnd')?.amount || b.variants?.[0]?.prices?.[0]?.amount || b.variants?.[0]?.price || b.price || 0;
                          return priceA - priceB;
                        });
                      } else if (sortBy === 'price_desc') {
                        sortedProducts.sort((a, b) => {
                          const priceA = a.variants?.[0]?.prices?.find((pr: any) => pr.currency_code === 'vnd')?.amount || a.variants?.[0]?.prices?.[0]?.amount || a.variants?.[0]?.price || a.price || 0;
                          const priceB = b.variants?.[0]?.prices?.find((pr: any) => pr.currency_code === 'vnd')?.amount || b.variants?.[0]?.prices?.[0]?.amount || b.variants?.[0]?.price || b.price || 0;
                          return priceB - priceA;
                        });
                      }

                      return sortedProducts.map((p: any) => {
                        const pPrice = p.variants?.[0]?.prices?.find((pr: any) => pr.currency_code === 'vnd')?.amount
                          || p.variants?.[0]?.prices?.[0]?.amount
                          || p.variants?.[0]?.price
                          || p.price
                          || 0;

                        const displayPrice = typeof pPrice === 'number' && pPrice > 0 ? pPrice.toLocaleString('vi-VN') + 'đ' : 'Liên hệ';
                        const oldPrice = p.variants?.[0]?.oldPrice;
                        const displayOldPrice = oldPrice ? oldPrice.toLocaleString('vi-VN') + 'đ' : null;

                        const stock = p.variants?.reduce((acc: number, v: any) => {
                          const vStock = (v.inventory_quantity !== undefined && v.inventory_quantity !== null) 
                            ? v.inventory_quantity 
                            : ((v.stock !== undefined && v.stock !== null) ? v.stock : 10);
                          return acc + vStock;
                        }, 0) || 10;
                        const imgUrl = getProductImage(p);
                        const rating = Number(p.metadata?.rating || 5);
                        const ratingCount = p.metadata?.review_count || 10;

                        return (
                          <article className="product-card" key={p.id}>
                            <div className="img-wrap">
                              {oldPrice && <span className="badge badge--sale">Giảm giá</span>}
                              <button
                                className="wishlist"
                                aria-label="Add to wishlist"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleWishlistProduct(p.id, p.title);
                                }}
                                style={{
                                  opacity: wishlist.includes(p.id) ? 1 : undefined,
                                  color: wishlist.includes(p.id) ? 'var(--rose)' : undefined,
                                }}
                              >
                                <Heart size={18} fill={wishlist.includes(p.id) ? 'var(--rose)' : 'none'} stroke={wishlist.includes(p.id) ? 'var(--rose)' : 'currentColor'} />
                              </button>
                              <img src={imgUrl} alt={p.title} style={{ objectFit: 'contain' }} />
                            </div>
                            <div className="stock"><span className="dot"></span>Còn hàng · {stock > 0 ? `${stock} sản phẩm` : 'Sẵn hàng'}</div>
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
                                  onChange={() => {
                                    toggleCompareProduct(p.id, p.title);
                                    if (!compareList.includes(p.id)) {
                                      toast.success('Đã thêm vào danh sách so sánh', { icon: '✨' });
                                    } else {
                                      toast('Đã gỡ khỏi danh sách so sánh', { icon: '🗑️' });
                                    }
                                  }}
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
                      });
                    })()}
                  </div>
                ) : (
                  <div className="flex-center" style={{ minHeight: '400px', flexDirection: 'column', textAlign: 'center' }}>
                    <div style={{ background: 'var(--paper)', padding: 'var(--s8)', borderRadius: '24px', maxWidth: '400px' }}>
                      <Search size={48} color="var(--fg-mute)" style={{ marginBottom: 'var(--s4)' }} />
                      <h3>Không tìm thấy sản phẩm</h3>
                      <p style={{ color: 'var(--fg-mute)', marginTop: 'var(--s2)' }}>
                        Rất tiếc, chúng tôi không tìm thấy sản phẩm nào khớp với bộ lọc của bạn. Hãy thử thay đổi từ khóa hoặc bộ lọc khác.
                      </p>
                      <button
                        className="btn btn--indigo"
                        style={{ marginTop: 'var(--s6)' }}
                        onClick={() => {
                          setSearch('');
                          setSelectedCats([]);
                          setSortBy('popular');
                          setAppliedPrice(null);
                          setPriceRange([boundsMin, boundsMax]);
                          setSearchParams({});
                        }}
                      >
                        Xoá tất cả bộ lọc
                      </button>
                    </div>
                  </div>
                )}

                {totalCount > limit && (
                  <div className="pagination">
                    <button
                      className="pg"
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {[...Array(Math.ceil(totalCount / limit))].map((_, i) => (
                      <button
                        key={i}
                        className={`pg${page === i + 1 ? ' is-active' : ''}`}
                        onClick={() => setPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      className="pg"
                      disabled={page === Math.ceil(totalCount / limit)}
                      onClick={() => setPage(p => p + 1)}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}

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