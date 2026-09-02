import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../services/product.service';
import { getCompareList, toggleCompareProduct, clearCompareList } from '../utils/compare';
import { 
  X, 
  Plus, 
  PlusCircle, 
  Search 
} from 'lucide-react';

const ComparisonPage = () => {
  // Quản lý danh sách ID sản phẩm đang so sánh từ localStorage
  const [compareIds, setCompareIds] = useState<string[]>(getCompareList());
  const [highlightDifferences, setHighlightDifferences] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync state when localstorage changes (via event)
  useEffect(() => {
    const handleUpdate = () => {
      setCompareIds(getCompareList());
    };
    window.addEventListener('compare-updated', handleUpdate);
    return () => {
      window.removeEventListener('compare-updated', handleUpdate);
    };
  }, []);

  // Fetch dữ liệu thật từ Medusa cho các sản phẩm trong danh sách (tận dụng cache sản phẩm)
  const { data: productsData, isLoading } = useProducts({ limit: 100 });

  // Dùng searchResults cho modal thêm sản phẩm
  const { data: searchResults, isLoading: isSearchingProducts } = useProducts({
    q: searchQuery || undefined,
    limit: 6
  });

  const products = useMemo(() => {
    if (compareIds.length === 0 || !productsData?.products) return [];
    
    // Sắp xếp các sản phẩm đúng theo thứ tự lưu trong compareIds
    return compareIds
      .map(id => productsData.products.find((p: any) => p.id === id))
      .filter(Boolean)
      .map((p: any) => {
        const meta = p.metadata || {};
        let specs = meta.specifications || meta.specs || {};
        if (typeof specs === 'string' && specs.startsWith('{')) {
          try { specs = JSON.parse(specs); } catch (e) { specs = {}; }
        }
        return {
          id: p.id,
          title: p.title,
          thumbnail: p.thumbnail,
          price: p.variants?.[0]?.prices?.[0]?.amount || 0,
          specs: {
            ...specs,
            "Kích thước (D x R x C)": (p.length && p.width && p.height) ? `${p.length} x ${p.width} x ${p.height} cm` : undefined,
            "Trọng lượng": p.weight ? `${p.weight} g` : undefined
          }
        };
      });
  }, [productsData, compareIds]);

  // Nhóm các thông số kỹ thuật (Style CellphoneS)
  const specGroups = [
    {
      title: "Màn hình",
      keys: ["Màn hình", "Công nghệ màn hình", "Độ phân giải", "Tần số quét"]
    },
    {
      title: "Cấu hình & Hiệu năng",
      keys: ["Chipset", "RAM", "Bộ nhớ trong", "Hệ điều hành"]
    },
    {
      title: "Camera",
      keys: ["Camera sau", "Camera trước", "Quay phim"]
    },
    {
      title: "Pin & Sạc",
      keys: ["Dung lượng pin", "Sạc", "Công nghệ pin"]
    },
    {
      title: "Thiết kế & Trọng lượng",
      keys: ["Kích thước (D x R x C)", "Trọng lượng"]
    }
  ];

  if (isLoading && compareIds.length > 0 && !productsData?.products) {
    return (
      <div className="container flex-center" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Đang tải dữ liệu so sánh...</p>
      </div>
    );
  }

  if (compareIds.length === 0) {
    return (
      <div className="container text-center" style={{ minHeight: '450px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '4rem 0' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--indigo-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--indigo)' }}>
          <i className="bi bi-arrow-left-right" style={{ fontSize: '2rem' }}></i>
        </div>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Danh sách so sánh trống</h2>
          <p style={{ color: 'var(--fg-mute)', maxWidth: '400px', margin: '0 auto', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Bạn chưa thêm sản phẩm nào vào danh sách so sánh. Chọn sản phẩm từ cửa hàng hoặc thêm trực tiếp tại đây.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/products" className="btn btn--indigo" style={{ padding: '0.75rem 1.5rem', borderRadius: '30px', fontWeight: 600 }}>
            Xem sản phẩm
          </Link>
          <button 
            onClick={() => setIsSearching(true)} 
            className="btn" 
            style={{ padding: '0.75rem 1.5rem', borderRadius: '30px', border: '1px solid var(--rule)', background: 'white', fontWeight: 600 }}
          >
            Thêm sản phẩm nhanh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-section-bg" style={{ minHeight: '100vh', padding: '2rem 0' }}>
      <div className="container">
        <div className="flex-between mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>So sánh sản phẩm ({products.length})</h1>
            <nav className="breadcrumb">
              <Link to="/">Trang chủ</Link> <span>/</span> <span style={{ color: 'var(--indigo)' }}>So sánh</span>
            </nav>
          </div>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button 
              onClick={clearCompareList}
              className="btn btn-sm"
              style={{ background: '#fee2e2', color: '#ef4444', borderRadius: '30px', padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, border: 'none' }}
            >
              Xóa tất cả
            </button>
            <div className="flex-center" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#fff', padding: '0.5rem 1.2rem', borderRadius: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--fg-soft)' }}>Tô sáng điểm khác biệt</span>
              <label className="switch">
                <input type="checkbox" checked={highlightDifferences} onChange={e => setHighlightDifferences(e.target.checked)} />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="comparison-container shadow-sm" style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden' }}>
          {/* Header row with images */}
          <div style={{ position: 'sticky', top: '0', zIndex: 10, background: '#fff', borderBottom: '1px solid var(--rule)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `250px repeat(${products.length + (products.length < 4 ? 1 : 0)}, 1fr)`, gap: '1px', background: 'var(--rule)' }}>
              <div style={{ background: '#fff', padding: '2rem', display: 'flex', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--fg)' }}>Thông số kỹ thuật</h3>
              </div>
              
              {products.map(p => (
                <div key={p.id} style={{ background: '#fff', padding: '1.5rem', textAlign: 'center', position: 'relative' }}>
                  <button 
                    onClick={() => toggleCompareProduct(p.id, p.title)}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--bg-soft)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-mute)', transition: 'all 0.2s' }}
                    title="Xóa khỏi so sánh"
                  >
                    <X size={16} />
                  </button>
                  <div style={{ height: '100px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={p.thumbnail} alt="" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, height: '40px', overflow: 'hidden', marginBottom: '0.5rem', color: 'var(--fg)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {p.title}
                  </div>
                  <div style={{ color: 'var(--indigo)', fontWeight: 800, fontSize: '0.95rem' }}>
                    {p.price > 0 ? `${p.price.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
                  </div>
                </div>
              ))}

              {products.length < 4 && (
                <div style={{ background: '#fff', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', border: '2px dashed var(--rule-strong)', borderRadius: '12px', padding: '1rem', minHeight: '180px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-mute)' }}>
                      <Plus size={20} />
                    </div>
                    <button 
                      className="btn btn-sm btn-outline" 
                      onClick={() => setIsSearching(true)}
                      style={{ border: '1px solid var(--rule-strong)', borderRadius: '20px', padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: 600, background: 'white' }}
                    >
                      Thêm sản phẩm
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Specs rows grouped by category */}
          <div className="comparison-body">
            {specGroups.map((group, groupIdx) => (
              <React.Fragment key={groupIdx}>
                <div style={{ background: 'var(--bg-soft)', padding: '0.8rem 1.5rem', fontWeight: 800, fontSize: '0.85rem', color: 'var(--fg)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {group.title}
                </div>
                {group.keys.map((key, keyIdx) => {
                  const values = products.map(p => p.specs[key] || '-');
                  const isDifferent = highlightDifferences && new Set(values).size > 1;

                  return (
                    <div 
                      key={keyIdx} 
                      style={{ 
                        display: 'grid', 
                        gridTemplateColumns: `250px repeat(${products.length + (products.length < 4 ? 1 : 0)}, 1fr)`, 
                        gap: '1px', 
                        background: 'var(--rule)',
                        backgroundColor: isDifferent ? '#fffbeb' : '#fff'
                      }}
                    >
                      <div style={{ background: isDifferent ? '#fffbeb' : '#fff', padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--fg-mute)' }}>
                        {key}
                      </div>
                      {products.map(p => {
                        const val = p.specs[key];
                        return (
                          <div key={p.id} style={{ background: isDifferent ? '#fffbeb' : '#fff', padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'var(--fg)' }}>
                            {val ? val : <span style={{ color: 'var(--ink-faint)' }}>—</span>}
                          </div>
                        );
                      })}
                      {products.length < 4 && <div style={{ background: '#fff' }}></div>}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Search Modal */}
        {isSearching && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '520px', padding: '2rem', borderRadius: '20px', background: '#fff', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--rule)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--fg)' }}>Thêm sản phẩm so sánh</h3>
                <button 
                  onClick={() => { setIsSearching(false); setSearchQuery(''); }} 
                  style={{ background: 'var(--bg-soft)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--fg-mute)' }}
                >
                  <X size={16} />
                </button>
              </div>
              
              <div style={{ position: 'relative', marginBottom: '1.2rem' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Tìm kiếm điện thoại, laptop, audio..." 
                  autoFocus 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                />
                <Search size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-mute)' }} />
              </div>
              
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--fg-mute)', marginBottom: '0.8rem' }}>
                {searchQuery ? 'Kết quả tìm kiếm' : 'Sản phẩm gợi ý'}
              </div>
              
              {isSearchingProducts ? (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--fg-mute)' }}>
                  <div style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid var(--indigo-line)', borderTopColor: 'var(--indigo)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }}></div>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>Đang tìm kiếm...</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '320px', overflowY: 'auto', paddingRight: '4px' }}>
                  {searchResults?.products?.map((p: any) => {
                    const isAlreadyCompared = compareIds.includes(p.id);
                    return (
                      <div 
                        key={p.id} 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          padding: '0.75rem', 
                          border: '1px solid var(--rule)', 
                          borderRadius: '12px', 
                          background: isAlreadyCompared ? 'var(--bg)' : 'white',
                          cursor: isAlreadyCompared ? 'default' : 'pointer',
                          transition: 'all 150ms ease'
                        }}
                        className={isAlreadyCompared ? '' : 'hover-bg-light'}
                        onClick={() => {
                          if (!isAlreadyCompared) {
                            toggleCompareProduct(p.id, p.title);
                            setIsSearching(false);
                            setSearchQuery('');
                          }
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <img src={p.thumbnail} alt="" style={{ width: '40px', height: '40px', objectFit: 'contain', background: 'var(--bg-soft)', borderRadius: '6px' }} />
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--fg)' }}>{p.title}</span>
                        </div>
                        {isAlreadyCompared ? (
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--emerald)', background: '#ecfdf5', padding: '2px 8px', borderRadius: '12px' }}>Đã thêm</span>
                        ) : (
                          <PlusCircle size={20} style={{ color: 'var(--indigo)' }} />
                        )}
                      </div>
                    );
                  })}
                  {(!searchResults?.products || searchResults.products.length === 0) && (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--fg-mute)', fontSize: '0.875rem' }}>
                      Không tìm thấy sản phẩm nào phù hợp.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      <style>{`
        .switch { position: relative; display: inline-block; width: 44px; height: 22px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--rule-strong); transition: .4s; }
        .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 4px; bottom: 3px; background-color: white; transition: .4s; }
        input:checked + .slider { background-color: var(--indigo); }
        input:checked + .slider:before { transform: translateX(20px); }
        .slider.round { border-radius: 34px; }
        .slider.round:before { border-radius: 50%; }
        .hover-bg-light:hover { background-color: var(--bg-soft); }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default ComparisonPage;
