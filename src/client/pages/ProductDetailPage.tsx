import { Link } from 'react-router-dom';

const ProductDetailPage = () => {
  return (
    <>
      {/* BREADCRUMB */}
      <div className="page-header" style={{ padding: '1rem 2rem' }}>
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <Link to="/products">Sản phẩm</Link>
            <span>/</span>
            <Link to="/products">Tai nghe</Link>
            <span>/</span>
            <span>Sony WH-1000XM5</span>
          </div>
        </div>
      </div>

      {/* PRODUCT DETAIL */}
      <section className="section products-section-bg">
        <div className="container">
          <div className="product-detail-grid">

            {/* GALLERY */}
            <div>
              <div className="product-gallery-main">
                <img id="mainImg" src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80" alt="Sony WH-1000XM5" />
              </div>
              <div className="product-thumbnails">
                <div className="thumb active">
                  <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80" alt="" />
                </div>
                <div className="thumb">
                  <img src="https://images.unsplash.com/photo-1546435770-a3e429ad6e5a?w=200&q=80" alt="" />
                </div>
                <div className="thumb">
                  <img src="https://images.unsplash.com/photo-1484704849700-f032a568e944?w=200&q=80" alt="" />
                </div>
                <div className="thumb">
                  <img src="https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&q=80" alt="" />
                </div>
              </div>
            </div>

            {/* INFO */}
            <div>
              <div className="product-detail-cat">Tai nghe chụp tai</div>
              <h1 className="product-detail-title">Sony WH-1000XM5<br/>Wireless Noise Cancelling</h1>

              <div className="flex-center" style={{ marginBottom: '1rem' }}>
                <div className="stars">★★★★★</div>
                <span className="text-xs text-muted">4.9 (312 đánh giá)</span>
                <span style={{ width: '1px', height: '14px', background: 'var(--border)' }}></span>
                <span className="text-xs text-success" style={{ fontWeight: 600 }}><i className="bi bi-check-circle-fill"></i> Còn hàng</span>
              </div>

              <div className="product-detail-price">
                8.490.000đ <span>9.990.000đ</span>
                <span className="text-xs" style={{ background: 'var(--accent)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '3px', fontWeight: 700, verticalAlign: 'middle', marginLeft: '0.5rem' }}>-15%</span>
              </div>

              {/* COLOR */}
              <div className="variant-section">
                <div className="variant-label">Màu sắc: <strong>Đen</strong></div>
                <div className="variant-options">
                  <button className="color-btn active" style={{ background: '#111111' }} title="Đen"></button>
                  <button className="color-btn" style={{ background: '#FFFFFF', border: '1px solid var(--border)' }} title="Trắng"></button>
                  <button className="color-btn" style={{ background: '#C0C0C0' }} title="Bạc"></button>
                  <button className="color-btn" style={{ background: '#8B4513' }} title="Nâu đồng"></button>
                </div>
              </div>

              {/* QUANTITY */}
              <div className="variant-section">
                <div className="variant-label">Số lượng</div>
                <div className="qty-control">
                  <button className="qty-btn" data-action="dec"><i className="bi bi-dash"></i></button>
                  <input type="text" className="qty-value" defaultValue="1" readOnly />
                  <button className="qty-btn" data-action="inc"><i className="bi bi-plus"></i></button>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="product-actions">
                <button className="btn btn-primary btn-add-cart"><i className="bi bi-bag-plus"></i> Thêm giỏ hàng</button>
                <Link to="/checkout" className="btn btn-accent"><i className="bi bi-lightning-charge"></i> Mua ngay</Link>
                <button className="btn-icon" style={{ border: '1.5px solid var(--border)', borderRadius: 'var(--radius)' }}><i className="bi bi-heart"></i></button>
              </div>

              {/* META */}
              <div className="product-meta">
                <div className="product-meta-row">
                  <strong>Thương hiệu</strong>
                  <span>Sony</span>
                </div>
                <div className="product-meta-row">
                  <strong>SKU</strong>
                  <span>WH1000XM5-BK</span>
                </div>
                <div className="product-meta-row">
                  <strong>Kết nối</strong>
                  <span>Bluetooth 5.2, Jack 3.5mm</span>
                </div>
                <div className="product-meta-row">
                  <strong>Pin</strong>
                  <span>30 giờ (ANC bật)</span>
                </div>
                <div className="product-meta-row">
                  <strong>Trọng lượng</strong>
                  <span>250g</span>
                </div>
                <div className="product-meta-row">
                  <strong>Giao hàng</strong>
                  <span className="text-success"><i className="bi bi-truck"></i> GHN / GHTK – 1-3 ngày</span>
                </div>
              </div>

              {/* TRUST BADGES */}
              <div className="flex-center" style={{ gap: '1.5rem', marginTop: '1.5rem', padding: '1rem', background: 'var(--bg)', borderRadius: 'var(--radius)' }}>
                <div style={{ textAlign: 'center' }} className="text-xs text-muted"><i className="bi bi-shield-check" style={{ fontSize: '1.2rem', color: 'var(--success)', display: 'block', marginBottom: '0.2rem' }}></i>BH 12 tháng</div>
                <div style={{ textAlign: 'center' }} className="text-xs text-muted"><i className="bi bi-arrow-return-left" style={{ fontSize: '1.2rem', color: 'var(--info)', display: 'block', marginBottom: '0.2rem' }}></i>Đổi trả 30 ngày</div>
                <div style={{ textAlign: 'center' }} className="text-xs text-muted"><i className="bi bi-truck" style={{ fontSize: '1.2rem', color: 'var(--accent)', display: 'block', marginBottom: '0.2rem' }}></i>Giao nhanh</div>
                <div style={{ textAlign: 'center' }} className="text-xs text-muted"><i className="bi bi-credit-card" style={{ fontSize: '1.2rem', color: 'var(--dark)', display: 'block', marginBottom: '0.2rem' }}></i>Thanh toán an toàn</div>
              </div>
            </div>
          </div>

          {/* TABS: Mô tả / Đánh giá */}
          <div style={{ marginTop: '3rem' }}>
            <div className="flex-center" style={{ gap: 0, borderBottom: '2px solid var(--border)', marginBottom: '2rem' }}>
              <button id="tabDesc" style={{ padding: '0.8rem 2rem', fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: '2px solid var(--dark)', marginBottom: '-2px', color: 'var(--dark)' }}>Mô tả</button>
              <button id="tabReview" style={{ padding: '0.8rem 2rem', fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--gray)' }}>Đánh giá (312)</button>
            </div>

            <div id="panelDesc">
              <div style={{ maxWidth: '780px', lineHeight: 1.8, color: '#333' }}>
                <p style={{ marginBottom: '1rem' }}>Sony WH-1000XM5 là flagship tai nghe chống ồn của Sony với công nghệ Noise Cancelling thế hệ mới nhất. Sử dụng 8 microphone và 2 chip xử lý, WH-1000XM5 mang lại khả năng chống ồn vượt trội hơn bất kỳ sản phẩm nào trong phân khúc.</p>
                <p style={{ marginBottom: '1rem' }}>Driver 30mm mới được thiết kế từ đầu mang lại âm thanh trung thực, chi tiết với dải âm rộng. Tính năng Speak-to-Chat tự động tạm dừng nhạc khi bạn bắt đầu nói chuyện, mang lại sự tiện lợi tuyệt vời trong cuộc sống hàng ngày.</p>
                <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                  <li>Chống ồn hàng đầu ngành với 8 microphone + 2 chip xử lý</li>
                  <li>Chất âm tự nhiên, trung thực với driver 30mm mới</li>
                  <li>Pin 30 giờ, sạc nhanh 3 phút dùng được 3 giờ</li>
                  <li>Multipoint kết nối 2 thiết bị cùng lúc</li>
                  <li>Thiết kế gập gọn, trọng lượng nhẹ 250g</li>
                </ul>
              </div>
            </div>
          </div>

          {/* RELATED PRODUCTS */}
          <div style={{ marginTop: '3rem' }}>
            <div className="section-header">
              <div className="section-header-row">
                <div>
                  <div className="section-title">SẢN PHẨM LIÊN QUAN</div>
                </div>
                <Link to="/products" className="see-all">XEM TẤT CẢ <i className="bi bi-arrow-right"></i></Link>
              </div>
            </div>
            <div className="products-grid">
              <Link to="/products/1" className="product-card">
                <div className="product-card-img">
                  <img src="https://images.unsplash.com/photo-1546435770-a3e429ad6e5a?w=600&q=80" alt="" />
                  <button className="product-card-btn-add btn-add-cart" onClick={(e) => e.preventDefault()}><i className="bi bi-plus"></i></button>
                </div>
                <div className="product-card-body">
                  <div className="product-category">Tai nghe</div>
                  <div className="product-name">Bose QuietComfort 45</div>
                  <div className="product-price-row"><span className="product-price">7.990.000đ</span></div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductDetailPage;
