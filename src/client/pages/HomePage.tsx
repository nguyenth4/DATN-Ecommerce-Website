import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCategories, useProducts } from '../services/product.service';
import ProductCard from '../components/ProductCard';

// Icon mapping for known category names
const getCategoryIcon = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes('điện thoại') || n.includes('phone')) return 'bi-phone';
  if (n.includes('laptop') || n.includes('máy tính')) return 'bi-laptop';
  if (n.includes('tai nghe') || n.includes('headphone')) return 'bi-headphones';
  if (n.includes('smartwatch') || n.includes('đồng hồ')) return 'bi-watch';
  if (n.includes('loa') || n.includes('speaker')) return 'bi-speaker';
  if (n.includes('máy ảnh') || n.includes('camera')) return 'bi-camera';
  if (n.includes('gaming') || n.includes('game')) return 'bi-controller';
  if (n.includes('phụ kiện') || n.includes('accessory')) return 'bi-usb-plug';
  if (n.includes('tablet') || n.includes('máy tính bảng')) return 'bi-tablet';
  return 'bi-box';
};

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Fetch categories and products from Medusa
  const { data: categories, isLoading: catsLoading } = useCategories();
  const { data: productData, isLoading: prodsLoading } = useProducts(
    selectedCategoryId
      ? { category_id: [selectedCategoryId], limit: 4 }
      : { limit: 4 }
  );

  const handleCategoryClick = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
  };

  const handleSeeAll = () => {
    if (selectedCategoryId) {
      navigate(`/products?category_id=${selectedCategoryId}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-bg">
          <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&q=80" alt="Hero" />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge"><i className="bi bi-lightning-charge-fill"></i> Đỉnh Cao Công Nghệ 2025</div>
          <h1 className="hero-title">TRẢI NGHIỆM <em>VƯỢT</em><br/>GIỚI HẠN</h1>
          <p className="hero-desc">Khám phá bộ sưu tập thiết bị công nghệ đẳng cấp thế giới. Thiết kế sang trọng, hiệu năng vượt trội.</p>
          <div className="hero-btns">
            <Link to="/products" className="btn btn-primary btn-lg">MUA NGAY</Link>
            <Link to="/products" className="btn btn-outline btn-lg">TÌM HIỂU THÊM</Link>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES (Dynamic from Medusa API) ===== */}
      <section className="section-sm categories-section">
        <div className="container">
          <div className="categories-strip">
            {/* Chip "Tất cả" */}
            <div
              className={`cat-chip ${selectedCategoryId === null ? 'active' : ''}`}
              onClick={() => handleCategoryClick(null)}
              style={{ cursor: 'pointer' }}
            >
              <i className="bi bi-grid"></i> Tất cả
            </div>

            {/* Chips từ API */}
            {catsLoading ? (
              // Loading skeleton chips
              [1, 2, 3].map((i) => (
                <div key={i} className="cat-chip" style={{ opacity: 0.4, cursor: 'default', minWidth: '90px' }}>
                  <i className="bi bi-hourglass"></i> ...
                </div>
              ))
            ) : (
              categories
                // Lọc chỉ lấy category cha (không có parent) hoặc tất cả
                ?.filter((cat: any) => !cat.parent_category_id)
                .map((cat: any) => (
                  <div
                    key={cat.id}
                    className={`cat-chip ${selectedCategoryId === cat.id ? 'active' : ''}`}
                    onClick={() => handleCategoryClick(cat.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className={`bi ${getCategoryIcon(cat.name)}`}></i> {cat.name}
                  </div>
                ))
            )}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="section products-section-bg">
        <div className="container">
          <div className="section-header">
            <div className="section-header-row">
              <div>
                <div className="section-title">
                  {selectedCategoryId && categories
                    ? categories.find((c: any) => c.id === selectedCategoryId)?.name?.toUpperCase() || 'SẢN PHẨM NỔI BẬT'
                    : 'SẢN PHẨM NỔI BẬT'}
                </div>
                <p className="section-subtitle">
                  {selectedCategoryId
                    ? 'Danh sách sản phẩm theo danh mục đã chọn'
                    : 'Những thiết bị được yêu thích nhất trong tháng'}
                </p>
              </div>
              <span onClick={handleSeeAll} className="see-all" style={{ cursor: 'pointer' }}>
                XEM TẤT CẢ <i className="bi bi-arrow-right"></i>
              </span>
            </div>
          </div>

          {prodsLoading ? (
            // Loading skeleton
            <div className="products-grid">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{
                  background: 'white',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}>
                  <div style={{ height: '260px', background: '#f0f0f0' }} />
                  <div style={{ padding: '1rem' }}>
                    <div style={{ height: '12px', background: '#f0f0f0', borderRadius: '4px', marginBottom: '0.5rem', width: '60%' }} />
                    <div style={{ height: '16px', background: '#f0f0f0', borderRadius: '4px', marginBottom: '0.5rem' }} />
                    <div style={{ height: '20px', background: '#f0f0f0', borderRadius: '4px', width: '40%' }} />
                  </div>
                </div>
              ))}
              <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
            </div>
          ) : productData?.products?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--gray)' }}>
              <i className="bi bi-inbox" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}></i>
              <p>Chưa có sản phẩm nào trong danh mục này.</p>
            </div>
          ) : (
            <div className="products-grid">
              {productData?.products?.slice(0, 4).map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== PROMO BANNER ===== */}
      <section className="section promo-section-bg">
        <div className="container">
          <div className="promo-banner">
            <div className="promo-banner-text">
              <h2>FLASH SALE<br/>CUỐI TUẦN</h2>
              <p>Hàng nghìn sản phẩm giảm giá sốc. Số lượng có hạn!</p>
              <Link to="/products" className="btn btn-accent" style={{ marginTop: '1.5rem' }}>MUA NGAY <i className="bi bi-arrow-right"></i></Link>
            </div>
            <div className="promo-badge">GIẢM<br/>ĐẾN 50%</div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="section-sm features-section">
        <div className="container">
          <div className="features-grid" style={{ textAlign: 'center' }}>
            <div>
              <div className="feature-icon"><i className="bi bi-truck"></i></div>
              <div className="fw-700 text-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>Giao hàng nhanh</div>
              <div className="text-xs text-muted">Tích hợp GHN & GHTK</div>
            </div>
            <div>
              <div className="feature-icon"><i className="bi bi-shield-check"></i></div>
              <div className="fw-700 text-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>Bảo hành chính hãng</div>
              <div className="text-xs text-muted">12–24 tháng tại hãng</div>
            </div>
            <div>
              <div className="feature-icon"><i className="bi bi-arrow-return-left"></i></div>
              <div className="fw-700 text-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>Đổi trả 30 ngày</div>
              <div className="text-xs text-muted">Miễn phí đổi trả</div>
            </div>
            <div>
              <div className="feature-icon"><i className="bi bi-credit-card"></i></div>
              <div className="fw-700 text-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>Thanh toán đa dạng</div>
              <div className="text-xs text-muted">VNPay, MoMo, ZaloPay, COD</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;


