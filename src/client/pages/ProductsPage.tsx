import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { addToCart, isLoggedIn } from '../utils/cart';
import { getCompareList, toggleCompareProduct } from '../utils/compare';
import { getWishlist, toggleWishlistProduct } from '../utils/wishlist';
import {
  Star,
  Heart,
  ChevronRight,
  ChevronLeft,
  Search
} from 'lucide-react';
import { useProducts, useCategories } from '../services/product.service';
import { ProductCardSkeleton } from '../components/ProductCardSkeleton';
import toast from 'react-hot-toast';
import './ProductsPage.css';

const ProductsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [compareList, setCompareList] = useState(getCompareList());
  const [wishlist, setWishlist] = useState(getWishlist());

  // Filter states
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [sortBy, setSortBy] = useState(searchParams.get('order') || 'popular');
  const [selectedCats, setSelectedCats] = useState<string[]>(
    searchParams.get('category_id')?.split(',').filter(Boolean) || []
  );
  const isSaleFilter = searchParams.get('sale') === '2-9' || searchParams.get('on_sale') === 'true';
  const [page, setPage] = useState(1);
  const limit = 15;

  // Sync selectedCats when URL changes (e.g. navigating from HomePage category tiles)
  useEffect(() => {
    const catFromUrl = searchParams.get('category_id')?.split(',').filter(Boolean) || [];
    setSelectedCats(catFromUrl);
  }, [searchParams.get('category_id')]);

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
      setSearchParams(params => {
        if (search) params.set('q', search);
        else params.delete('q');
        return params;
      });
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch full data list from Medusa once
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({
    limit: 100
  });

  const { data: categoriesData } = useCategories();

  const allProducts = productsData?.products || [];
  const categories = (categoriesData || []).filter((c: any) =>
    (c.name || '').toLowerCase() !== 'điện thoại'
  );

  // Filter & Sort instantly in memory (0ms delay)
  const filteredAndSortedProducts = useMemo(() => {
    let list = [...allProducts];

    // Filter by Category
    if (selectedCats.length > 0) {
      list = list.filter((p: any) => {
        const catIds = (p.categories || []).map((c: any) => c.id);
        return selectedCats.some((catId) => catIds.includes(catId));
      });
    }

    // Filter by Sale 2/9
    if (isSaleFilter) {
      list = list.filter((p: any) => {
        const variant = p.variants?.[0];
        if (variant?.calculated_price) {
          const pPrice = Number(variant.calculated_price.calculated_amount ?? 0);
          const origAmt = Number(variant.calculated_price.original_amount ?? pPrice);
          return origAmt > pPrice;
        }
        const saleP = variant?.prices?.find((pr: any) => pr.price_list_id);
        return Boolean(saleP);
      });
    }

    // Filter by Search
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase().trim();
      list = list.filter((p: any) => {
        const titleMatch = (p.title || '').toLowerCase().includes(q);
        const catMatch = (p.categories || []).some((c: any) => (c.name || '').toLowerCase().includes(q));
        return titleMatch || catMatch;
      });
    }

    // Sorting
    if (sortBy === 'views') {
      list.sort((a, b) => (Number(b.metadata?.view_count || b.metadata?.views || 0) - Number(a.metadata?.view_count || a.metadata?.views || 0)));
    } else if (sortBy === 'sales') {
      list.sort((a, b) => (Number(b.metadata?.sale_count || b.metadata?.sales || 0) - Number(a.metadata?.sale_count || a.metadata?.sales || 0)));
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (Number(b.metadata?.rating || 0) - Number(a.metadata?.rating || 0)));
    } else if (sortBy === 'popular') {
      list.sort((a, b) => {
        const scoreA = (Number(a.metadata?.rating || 5) * 10) + (Number(a.metadata?.view_count || 10));
        const scoreB = (Number(b.metadata?.rating || 5) * 10) + (Number(b.metadata?.view_count || 10));
        return scoreB - scoreA;
      });
    } else if (sortBy === 'price_asc') {
      list.sort((a, b) => {
        const priceA = a.variants?.[0]?.prices?.find((pr: any) => pr.currency_code === 'vnd')?.amount || a.variants?.[0]?.prices?.[0]?.amount || a.variants?.[0]?.price || a.price || 0;
        const priceB = b.variants?.[0]?.prices?.find((pr: any) => pr.currency_code === 'vnd')?.amount || b.variants?.[0]?.prices?.[0]?.amount || b.variants?.[0]?.price || b.price || 0;
        return priceA - priceB;
      });
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => {
        const priceA = a.variants?.[0]?.prices?.find((pr: any) => pr.currency_code === 'vnd')?.amount || a.variants?.[0]?.prices?.[0]?.amount || a.variants?.[0]?.price || a.price || 0;
        const priceB = b.variants?.[0]?.prices?.find((pr: any) => pr.currency_code === 'vnd')?.amount || b.variants?.[0]?.prices?.[0]?.amount || b.variants?.[0]?.price || b.price || 0;
        return priceB - priceA;
      });
    } else if (sortBy === 'createdAt') {
      list.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });
    }

    return list;
  }, [allProducts, selectedCats, isSaleFilter, debouncedSearch, sortBy]);

  const totalCount = filteredAndSortedProducts.length;

  const getProductImage = (p: any) => {
    return p.thumbnail || (p.images?.[0]?.url) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';
  };



  // Handle category toggle
  const toggleCategory = (id: string) => {
    const next = selectedCats.includes(id)
      ? selectedCats.filter(c => c !== id)
      : [...selectedCats, id];
    setSelectedCats(next);
    setSearchParams(params => {
      if (next.length > 0) params.set('category_id', next.join(','));
      else params.delete('category_id');
      params.delete('sale');
      params.delete('on_sale');
      return params;
    });
    setPage(1);
  };

  // Handle sort change
  const handleSortChange = (val: string) => {
    setSortBy(val);
    setSearchParams(params => {
      if (val !== 'popular') params.set('order', val);
      else params.delete('order');
      return params;
    });
    setPage(1);
  };



  return (
    <>
      <main id="main">
        <section className="page-head" style={{ borderBottom: 'none' }}>
          <div className="container">
            <div className="crumbs">
              <Link to="/">Trang chủ</Link> <span className="sep">/</span> <span>Điện thoại</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--s4)' }}>
              <div>
                <h1>{isSaleFilter ? 'Chương trình Siêu Sale 2/9' : 'Tất cả sản phẩm'}</h1>
                <p>{isSaleFilter ? 'Danh sách các sản phẩm đang được áp dụng chương trình giảm giá đặc biệt mừng đại lễ Quốc Khánh 2/9.' : 'Khám phá bộ sưu tập công nghệ mới nhất từ điện thoại, máy tính đến phụ kiện âm thanh.'}</p>
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

        <section className="brands" style={{ background: 'var(--paper)', padding: '12px 0', border: 'none' }}>
          <div className="container">
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'var(--ff-display)', marginBottom: '16px', color: 'var(--ink)' }}>Điện thoại</h2>
            <div className="brand-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingBottom: '4px', justifyContent: 'flex-start' }}>
              <button
                className="brand-logo"
                onClick={() => {
                  setSelectedCats([]);
                  setSearchParams(params => {
                    params.delete('category_id');
                    params.delete('sale');
                    params.delete('on_sale');
                    return params;
                  });
                }}
                style={{
                  background: 'var(--paper)',
                  border: (selectedCats.length === 0 && !isSaleFilter) ? '1px solid var(--indigo)' : '1px solid var(--border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: (selectedCats.length === 0 && !isSaleFilter) ? '600' : '500',
                  color: (selectedCats.length === 0 && !isSaleFilter) ? 'var(--indigo)' : 'var(--fg)',
                  padding: '8px 16px',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '80px',
                  height: '36px'
                }}
              >
                TẤT CẢ
              </button>
              {categories.map((cat: any) => (
                <button
                  key={cat.id}
                  className="brand-logo"
                  onClick={() => toggleCategory(cat.id)}
                  style={{
                    background: 'var(--paper)',
                    border: selectedCats.includes(cat.id) ? '1px solid var(--indigo)' : '1px solid var(--border)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: selectedCats.includes(cat.id) ? '600' : '500',
                    color: selectedCats.includes(cat.id) ? 'var(--indigo)' : 'var(--fg)',
                    padding: '8px 16px',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '80px',
                    height: '36px'
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'var(--ff-display)', color: 'var(--ink)', margin: 0 }}>Sắp xếp theo</h2>
                  <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => handleSortChange('createdAt')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '8px 16px', border: '1px solid var(--border)',
                      borderRadius: '24px', background: sortBy === 'createdAt' ? 'var(--indigo)' : 'var(--paper)',
                      color: sortBy === 'createdAt' ? 'white' : 'inherit',
                      cursor: 'pointer', fontSize: '14px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                    Phổ Biến
                  </button>
                  <button
                    onClick={() => handleSortChange('price_asc')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '8px 16px', border: '1px solid var(--border)',
                      borderRadius: '24px', background: sortBy === 'price_asc' ? 'var(--indigo)' : 'var(--paper)',
                      color: sortBy === 'price_asc' ? 'white' : 'inherit',
                      cursor: 'pointer', fontSize: '14px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {/* sort ascending: short-to-long lines + up arrow */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 11h4"></path>
                      <path d="M11 15h7"></path>
                      <path d="M11 19h10"></path>
                      <path d="M3 7l3-3 3 3"></path>
                      <path d="M6 4v16"></path>
                    </svg>
                    Giá Thấp - Cao
                  </button>
                  <button
                    onClick={() => handleSortChange('price_desc')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '8px 16px', border: '1px solid var(--border)',
                      borderRadius: '24px', background: sortBy === 'price_desc' ? 'var(--indigo)' : 'var(--paper)',
                      color: sortBy === 'price_desc' ? 'white' : 'inherit',
                      cursor: 'pointer', fontSize: '14px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {/* sort descending: long-to-short lines + down arrow */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 5h10"></path>
                      <path d="M11 9h7"></path>
                      <path d="M11 13h4"></path>
                      <path d="M3 17l3 3 3-3"></path>
                      <path d="M6 4v16"></path>
                    </svg>
                    Giá Cao - Thấp
                  </button>
                  </div>
                </div>

                {(isLoadingProducts && allProducts.length === 0) ? (
                  <div className="shop-grid">
                    {[...Array(12)].map((_, i) => (
                      <ProductCardSkeleton key={i} />
                    ))}
                  </div>
                ) : filteredAndSortedProducts.length > 0 ? (
                  <div className="shop-grid">
                    {(() => {
                      const paginatedProducts = filteredAndSortedProducts.slice((page - 1) * limit, page * limit);

                      return paginatedProducts.map((p: any) => {
                        const variant = p.variants?.[0];
                        let pPrice = 0;
                        let oldPrice = 0;

                        if (variant?.calculated_price) {
                          pPrice = Number(variant.calculated_price.calculated_amount ?? 0);
                          const origAmt = Number(variant.calculated_price.original_amount ?? pPrice);
                          if (origAmt > pPrice) oldPrice = origAmt;
                        } else {
                          const saleP = variant?.prices?.find((pr: any) => pr.currency_code === 'vnd' && pr.price_list_id)
                            || variant?.prices?.find((pr: any) => pr.price_list_id);
                          const baseP = variant?.prices?.find((pr: any) => pr.currency_code === 'vnd' && !pr.price_list_id)
                            || variant?.prices?.find((pr: any) => !pr.price_list_id)
                            || variant?.prices?.[0];

                          pPrice = saleP ? Number(saleP.amount) : (baseP ? Number(baseP.amount) : (p.price || 0));
                          oldPrice = saleP && baseP ? Number(baseP.amount) : (variant?.oldPrice || 0);
                        }

                        const displayPrice = typeof pPrice === 'number' && pPrice > 0 ? pPrice.toLocaleString('vi-VN') + 'đ' : 'Liên hệ';
                        const displayOldPrice = oldPrice && oldPrice > pPrice ? oldPrice.toLocaleString('vi-VN') + 'đ' : null;

                        // Tính tổng stock từ các variants
                        // - manage_inventory=false → không quản lý tồn kho → luôn còn hàng
                        // - inventory_quantity=null → chưa cấu hình → coi là còn hàng
                        const allVariants = p.variants || [];
                        const hasAnyUnmanaged = allVariants.some((v: any) => v.manage_inventory === false);
                        const allNullInventory = allVariants.length > 0 && allVariants.every(
                          (v: any) => v.inventory_quantity === null || v.inventory_quantity === undefined
                        );
                        const rawStock = allVariants.reduce((acc: number, v: any) => {
                          if (v.manage_inventory === false) return acc; // skip unmanaged
                          const vStock = (v.inventory_quantity !== null && v.inventory_quantity !== undefined)
                            ? Number(v.inventory_quantity)
                            : 0;
                          return acc + vStock;
                        }, 0);
                        const stock = rawStock;
                        // isInStock = true khi: có variant không quản lý tồn kho, HOẶC
                        //   tất cả inventory_quantity đều null (chưa setup), HOẶC stock > 0
                        const isInStock = hasAnyUnmanaged || allNullInventory || stock > 0;
                        const imgUrl = getProductImage(p);
                        const rating = Number(p.metadata?.rating || 0);
                        const ratingCount = p.metadata?.review_count || 0;

                        return (
                          <article className="product-card" key={p.id}>
                            <div className="img-wrap">
                              {oldPrice > pPrice && <span className="badge badge--sale">Giảm giá</span>}
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
                              <img
                                src={imgUrl}
                                alt={p.title}
                                style={{ objectFit: 'contain' }}
                                loading="lazy"
                                decoding="async"
                                width={300}
                                height={300}
                              />
                            </div>
                            <div className="stock">
                              <span className="dot" style={{ background: isInStock ? 'var(--success)' : 'var(--rose)' }}></span>
                              {isInStock ? (stock > 0 ? `Còn hàng · ${stock} sản phẩm` : 'Còn hàng') : 'Hết hàng'}
                            </div>
                            <Link to={`/product/${p.id}`} className="name">{p.title}</Link>
                            <div className="price">
                              <span className="now">{displayPrice}</span>
                              {displayOldPrice && <span className="was">{displayOldPrice}</span>}
                            </div>
                            <div className="stars">
                              {ratingCount > 0 ? (
                                <>
                                  <div style={{ display: 'flex', gap: '2px', color: '#fbbf24' }}>
                                    {[...Array(5)].map((_, idx) => (
                                      <Star key={idx} size={14} fill={idx < Math.round(rating) ? "#fbbf24" : "none"} />
                                    ))}
                                  </div>
                                  <span className="count">({ratingCount})</span>
                                </>
                              ) : (
                                <span className="count" style={{ marginLeft: 0 }}>Chưa có đánh giá</span>
                              )}
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
                            <button
                              className="btn"
                              style={{ marginTop: '0.65rem', width: '100%', cursor: 'pointer' }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const variant = p.variants?.[0];
                                if (!variant) return;
                                const price = variant.prices?.find((pr: any) => pr.currency_code === 'vnd')?.amount
                                  || variant.prices?.[0]?.amount
                                  || variant.price
                                  || 0;
                                const imgUrl2 = getProductImage(p);
                                addToCart({
                                  id: variant.id,
                                  productId: p.id,
                                  name: p.title,
                                  variant: variant.title || '',
                                  price,
                                  qty: 1,
                                  img: imgUrl2,
                                });
                                if (!isLoggedIn()) return;
                                window.dispatchEvent(new Event('cart-updated'));
                                navigate('/checkout');
                              }}
                            >
                              Đặt ngay <ChevronRight size={16} />
                            </button>
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
                      onClick={() => {
                        setPage(p => p - 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {[...Array(Math.ceil(totalCount / limit))].map((_, i) => (
                      <button
                        key={i}
                        className={`pg${page === i + 1 ? ' is-active' : ''}`}
                        onClick={() => {
                          setPage(i + 1);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      className="pg"
                      disabled={page === Math.ceil(totalCount / limit)}
                      onClick={() => {
                        setPage(p => p + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}

              </div>

          </div>
        </section>



      </main>
    </>
  );
};

export default ProductsPage;