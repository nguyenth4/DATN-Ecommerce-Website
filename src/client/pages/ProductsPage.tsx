import { Link } from 'react-router-dom';
import { useProductController } from '../controllers/useProductController';

const ProductsPage = () => {
  const { products, loading } = useProductController();

  if (loading) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <h2>Đang tải sản phẩm...</h2>
      </div>
    );
  }

  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <span>Sản phẩm</span>
          </div>
          <h1>TẤT CẢ SẢN PHẨM</h1>
        </div>
      </div>

      {/* PRODUCTS LAYOUT */}
      <section className="section products-section-bg">
        <div className="container">
          <div className="products-layout">

            {/* SIDEBAR FILTER */}
            <aside className="filter-sidebar">
              <div className="filter-title"><i className="bi bi-funnel-fill"></i> Bộ lọc</div>

              <div className="filter-section">
                <div className="filter-section-title">Danh mục</div>
                <label className="filter-check">
                  <input type="checkbox" defaultChecked /> Điện thoại
                  <span className="filter-check-count">(142)</span>
                </label>
                <label className="filter-check">
                  <input type="checkbox" /> Laptop
                  <span className="filter-check-count">(89)</span>
                </label>
                <label className="filter-check">
                  <input type="checkbox" /> Tai nghe
                  <span className="filter-check-count">(215)</span>
                </label>
                <label className="filter-check">
                  <input type="checkbox" /> Smartwatch
                  <span className="filter-check-count">(67)</span>
                </label>
                <label className="filter-check">
                  <input type="checkbox" /> Loa
                  <span className="filter-check-count">(53)</span>
                </label>
                <label className="filter-check">
                  <input type="checkbox" /> Gaming
                  <span className="filter-check-count">(94)</span>
                </label>
              </div>

              <div className="filter-section">
                <div className="filter-section-title">Khoảng giá (đ)</div>
                <div className="price-range">
                  <input type="number" className="price-input" placeholder="Từ" defaultValue="0" />
                  <span>—</span>
                  <input type="number" className="price-input" placeholder="Đến" />
                </div>
                <button className="btn btn-primary btn-sm btn-block mt-1">Áp dụng</button>
              </div>

              <div className="filter-section">
                <div className="filter-section-title">Thương hiệu</div>
                <label className="filter-check"><input type="checkbox" defaultChecked /> Apple <span className="filter-check-count">(88)</span></label>
                <label className="filter-check"><input type="checkbox" /> Samsung <span className="filter-check-count">(72)</span></label>
                <label className="filter-check"><input type="checkbox" /> Sony <span className="filter-check-count">(45)</span></label>
                <label className="filter-check"><input type="checkbox" /> Xiaomi <span className="filter-check-count">(61)</span></label>
                <label className="filter-check"><input type="checkbox" /> ASUS <span className="filter-check-count">(39)</span></label>
              </div>

              <div className="filter-section">
                <div className="filter-section-title">Đánh giá</div>
                <label className="filter-check"><input type="radio" name="rating" /> <span className="stars">★★★★★</span> (5 sao)</label>
                <label className="filter-check"><input type="radio" name="rating" /> <span className="stars">★★★★</span>☆ (4+ sao)</label>
                <label className="filter-check"><input type="radio" name="rating" /> <span className="stars">★★★</span>☆☆ (3+ sao)</label>
              </div>

              <button className="btn btn-outline btn-block" style={{ color: 'var(--dark)', borderColor: 'var(--border)' }} onClick={() => window.location.reload()}>
                <i className="bi bi-x-circle"></i> Xóa bộ lọc
              </button>
            </aside>

            {/* PRODUCTS MAIN */}
            <div>
              <div className="products-header">
                <span className="products-count">1.289 sản phẩm</span>
                <div className="flex-center" style={{ gap: '0.8rem' }}>
                  <div className="flex-center" style={{ gap: '0.3rem' }}>
                    <button className="btn-icon" title="Lưới"><i className="bi bi-grid"></i></button>
                    <button className="btn-icon" title="Danh sách"><i className="bi bi-list-ul"></i></button>
                  </div>
                  <select className="sort-select">
                    <option>Nổi bật nhất</option>
                    <option>Giá: Thấp đến cao</option>
                    <option>Giá: Cao đến thấp</option>
                    <option>Mới nhất</option>
                    <option>Đánh giá cao nhất</option>
                  </select>
                </div>
              </div>

              <div className="products-grid">
                {products.length === 0 ? (
                  <p>Không có sản phẩm nào.</p>
                ) : (
                  products.map((product) => (
                    <Link to={`/products/${product.id}`} className="product-card" key={product.id}>
                      <div className="product-card-img">
                        <img src={product.image || "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80"} alt={product.name} />
                        <button className="product-card-btn-add btn-add-cart" onClick={(e) => { e.preventDefault(); /* TODO: Add to cart */ }}><i className="bi bi-plus"></i></button>
                      </div>
                      <div className="product-card-body">
                        <div className="product-category">{product.category || 'Điện thoại'}</div>
                        <div className="product-name">{product.name}</div>
                        <div className="product-price-row">
                          <span className="product-price">{product.price.toLocaleString()}đ</span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              {/* PAGINATION */}
              <div className="flex-center" style={{ justifyContent: 'center', marginTop: '2.5rem' }}>
                <div className="pagination">
                  <button className="page-btn"><i className="bi bi-chevron-left"></i></button>
                  <button className="page-btn active">1</button>
                  <button className="page-btn">2</button>
                  <button className="page-btn">3</button>
                  <span style={{ padding: '0 0.3rem' }} className="text-muted">...</span>
                  <button className="page-btn">12</button>
                  <button className="page-btn"><i className="bi bi-chevron-right"></i></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductsPage;
