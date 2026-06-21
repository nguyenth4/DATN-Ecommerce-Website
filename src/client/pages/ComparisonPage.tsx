import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../services/product.service';

const ComparisonPage = () => {
  // Quản lý danh sách ID sản phẩm đang so sánh (mặc định lấy 2 cái đầu tiên để demo)
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [highlightDifferences, setHighlightDifferences] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch dữ liệu thật từ Medusa
  const { data: productsData, isLoading } = useProducts({
    id: compareIds.length > 0 ? compareIds : undefined,
    limit: 4
  });

  // Nếu chưa có ID nào, lấy 3 sản phẩm đầu tiên làm mẫu
  useEffect(() => {
    if (!isLoading && productsData?.products && compareIds.length === 0) {
      setCompareIds(productsData.products.slice(0, 3).map((p: any) => p.id));
    }
  }, [productsData, isLoading, compareIds]);

  const products = useMemo(() => {
    if (!productsData?.products) return [];
    return productsData.products.map((p: any) => {
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
        specs: specs
      };
    });
  }, [productsData]);

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
    }
  ];

  if (isLoading && compareIds.length === 0) {
    return <div className="container flex-center" style={{ minHeight: '400px' }}><p>Đang tải dữ liệu so sánh...</p></div>;
  }

  return (
    <div className="products-section-bg" style={{ minHeight: '100vh', padding: '2rem 0' }}>
      <div className="container">
        <div className="flex-between mb-4">
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>So sánh sản phẩm</h1>
            <nav className="breadcrumb">
              <Link to="/">Trang chủ</Link> <span>/</span> <span>So sánh</span>
            </nav>
          </div>
          <div className="flex-center" style={{ gap: '1rem', background: '#fff', padding: '0.6rem 1.2rem', borderRadius: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--gray)' }}>Hiển thị sự khác biệt</span>
            <label className="switch">
              <input type="checkbox" checked={highlightDifferences} onChange={e => setHighlightDifferences(e.target.checked)} />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        <div className="comparison-card shadow-sm" style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden' }}>
          {/* Header row with images */}
          <div style={{ position: 'sticky', top: '0', zIndex: 10, background: '#fff', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `250px repeat(${products.length + (products.length < 4 ? 1 : 0)}, 1fr)`, gap: '1px', background: 'var(--border)' }}>
              <div style={{ background: '#fff', padding: '2rem', display: 'flex', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Thông số kỹ thuật</h3>
              </div>
              
              {products.map(p => (
                <div key={p.id} style={{ background: '#fff', padding: '1.5rem', textAlign: 'center', position: 'relative' }}>
                  <button 
                    onClick={() => setCompareIds(compareIds.filter(id => id !== p.id))}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: '#f5f5f5', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                  <div style={{ height: '100px', marginBottom: '1rem' }}>
                    <img src={p.thumbnail} alt="" style={{ height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, height: '40px', overflow: 'hidden', marginBottom: '0.5rem' }}>{p.title}</div>
                  <div style={{ color: 'var(--accent)', fontWeight: 800 }}>{p.price.toLocaleString('vi-VN')}đ</div>
                </div>
              ))}

              {products.length < 4 && (
                <div style={{ background: '#fafafa', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', border: '2px dashed var(--border)', margin: '1rem', borderRadius: '12px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <i className="bi bi-plus-lg" style={{ fontSize: '1.5rem', color: 'var(--gray)' }}></i>
                  </div>
                  <button className="btn btn-sm btn-outline" onClick={() => setIsSearching(true)}>Thêm sản phẩm</button>
                </div>
              )}
            </div>
          </div>

          {/* Specs rows grouped by category */}
          <div className="comparison-body">
            {specGroups.map((group, groupIdx) => (
              <React.Fragment key={groupIdx}>
                <div style={{ background: '#f8f9fa', padding: '0.8rem 1.5rem', fontWeight: 800, fontSize: '0.9rem', color: 'var(--dark)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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
                        background: 'var(--border)',
                        backgroundColor: isDifferent ? '#fffbe6' : '#fff'
                      }}
                    >
                      <div style={{ background: isDifferent ? '#fffbe6' : '#fff', padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray)' }}>
                        {key}
                      </div>
                      {products.map(p => (
                        <div key={p.id} style={{ background: isDifferent ? '#fffbe6' : '#fff', padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'var(--dark)' }}>
                          {p.specs[key] || <span style={{ color: '#ccc' }}>N/A</span>}
                        </div>
                      ))}
                      {products.length < 4 && <div style={{ background: '#fdfdfd' }}></div>}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Search Modal Simulation */}
        {isSearching && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', borderRadius: '20px' }}>
              <div className="flex-between mb-4">
                <h3 style={{ margin: 0 }}>Thêm máy so sánh</h3>
                <button onClick={() => setIsSearching(false)} className="btn-icon"><i className="bi bi-x-lg"></i></button>
              </div>
              <input type="text" className="form-control mb-4" placeholder="Nhập tên sản phẩm cần tìm..." autoFocus />
              <div className="text-sm text-muted mb-4">Sản phẩm gợi ý:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div className="p-2 border rounded flex-between cursor-pointer hover-bg-light" style={{ cursor: 'pointer' }} onClick={() => setIsSearching(false)}>
                  <span>iPhone 15 Pro Max</span>
                  <i className="bi bi-plus-circle text-accent"></i>
                </div>
                <div className="p-2 border rounded flex-between cursor-pointer hover-bg-light" style={{ cursor: 'pointer' }} onClick={() => setIsSearching(false)}>
                  <span>Xiaomi 14 Ultra</span>
                  <i className="bi bi-plus-circle text-accent"></i>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      <style>{`
        .switch { position: relative; display: inline-block; width: 44px; height: 22px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; }
        .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 4px; bottom: 3px; background-color: white; transition: .4s; }
        input:checked + .slider { background-color: var(--accent); }
        input:checked + .slider:before { transform: translateX(20px); }
        .slider.round { border-radius: 34px; }
        .slider.round:before { border-radius: 50%; }
        .hover-bg-light:hover { background-color: #f8f9fa; }
      `}</style>
    </div>
  );
};

export default ComparisonPage;
