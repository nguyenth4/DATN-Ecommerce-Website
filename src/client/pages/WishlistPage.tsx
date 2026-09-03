import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Heart, ChevronRight } from 'lucide-react';
import { useProducts } from '../services/product.service';
import { getWishlist, toggleWishlistProduct, clearWishlist } from '../utils/wishlist';
import ProductCard from '../components/ProductCard';

const WishlistPage = () => {
  const [wishlistIds, setWishlistIds] = useState<string[]>(getWishlist());

  // Listen to wishlist updates to sync state
  useEffect(() => {
    const handleUpdate = () => {
      setWishlistIds(getWishlist());
    };
    window.addEventListener('wishlist-updated', handleUpdate);
    return () => {
      window.removeEventListener('wishlist-updated', handleUpdate);
    };
  }, []);

  // Fetch product data from Medusa leveraging cached products list ({ limit: 100 })
  const { data: productsData, isLoading } = useProducts({ limit: 100 });

  const wishlistProducts = useMemo(() => {
    if (wishlistIds.length === 0 || !(productsData as any)?.products) return [];
    
    // Maintain sequence of wishlistIds
    return wishlistIds
      .map(id => (productsData as any).products.find((p: any) => p.id === id))
      .filter(Boolean);
  }, [productsData, wishlistIds]);

  if (isLoading && wishlistIds.length > 0 && !(productsData as any)?.products) {
    return (
      <div className="container flex-center" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--indigo-line)', borderTopColor: 'var(--indigo)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ color: 'var(--fg-mute)', fontWeight: 500 }}>Đang tải danh sách yêu thích...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (wishlistIds.length === 0) {
    return (
      <div className="container text-center" style={{ minHeight: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '4rem 0' }}>
        <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'var(--rose-soft, #fff1f2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--rose)' }}>
          <Heart size={44} fill="var(--rose)" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--fg)', marginBottom: '0.6rem', fontFamily: 'var(--ff-display)' }}>Danh sách yêu thích trống</h2>
          <p style={{ color: 'var(--fg-mute)', maxWidth: '420px', margin: '0 auto', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Không có sản phẩm nào trong danh sách yêu thích của bạn. Hãy quay lại cửa hàng để khám phá và lưu lại những sản phẩm bạn ưng ý nhất!
          </p>
        </div>
        <Link to="/products" className="btn btn--indigo" style={{ padding: '0.75rem 2rem', borderRadius: '30px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: 'var(--shadow-indigo)' }}>
          Khám phá ngay <ChevronRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="products-section-bg" style={{ minHeight: '100vh', padding: '2.5rem 0', background: 'var(--bg)' }}>
      <div className="container">
        <div className="flex-between mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <nav className="breadcrumb" style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--fg-mute)', marginBottom: '0.5rem' }}>
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Trang chủ</Link>
              <span>/</span>
              <span style={{ color: 'var(--indigo)', fontWeight: 500 }}>Yêu thích</span>
            </nav>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--fg)', margin: 0, fontFamily: 'var(--ff-display)' }}>
              Sản phẩm yêu thích ({wishlistIds.length})
            </h1>
          </div>
          
          <button 
            onClick={clearWishlist}
            className="btn"
            style={{ 
              background: '#fee2e2', 
              color: '#ef4444', 
              borderRadius: '30px', 
              padding: '0.6rem 1.5rem', 
              fontSize: '0.875rem', 
              fontWeight: 600, 
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            <Trash2 size={16} /> Xóa tất cả
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '2rem' }}>
          {wishlistProducts.map(product => (
            <div key={product.id} className="wishlist-item-wrapper" style={{ position: 'relative' }}>
              <ProductCard product={product} />
              
              <button
                onClick={() => toggleWishlistProduct(product.id, product.title)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'var(--paper)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  color: 'var(--rose)',
                  zIndex: 10,
                  transition: 'transform 0.2s ease'
                }}
                title="Xóa khỏi yêu thích"
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
