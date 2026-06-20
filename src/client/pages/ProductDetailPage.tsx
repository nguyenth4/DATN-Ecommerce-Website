import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockProduct, mockRelatedProducts } from './mockProductData';
import ProductGallery from '../components/ProductDetail/ProductGallery';
import ProductInfo from '../components/ProductDetail/ProductInfo';
import ProductSpecsTable from '../components/ProductDetail/ProductSpecsTable';
import ProductReviewsTab from '../components/ProductDetail/ProductReviewsTab';

const ProductDetailPage = () => {
  const product = mockProduct;

  // Ép kiểu rõ ràng để tránh lỗi TypeScript do kiểu hỗn hợp trong mockProduct.options
  const colors = product.options[0].values as Array<{ name: string; hex: string; img: string; }>;
  const storages = product.options[1].values as string[];

  // 1. Quản lý State lựa chọn Biến thể
  const [selectedColor, setSelectedColor] = useState(colors[0].name);
  const [selectedStorage, setSelectedStorage] = useState("128GB");
  const [activeVariant, setActiveVariant] = useState(product.variants[0]);
  const [qty, setQty] = useState(1);

  // 2. Quản lý Gallery Ảnh
  const [activeImage, setActiveImage] = useState(colors[0].img);

  // 3. Quản lý Tabs
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews'>('desc');

  // 4. Quản lý Danh sách Đánh giá (hỗ trợ submit đánh giá mới động)
  const [reviews, setReviews] = useState(product.reviewsList);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');

  // Tự động tìm variant phù hợp mỗi khi người dùng đổi Color hoặc Storage
  useEffect(() => {
    const variant = product.variants.find(
      v => v.color === selectedColor && v.storage === selectedStorage
    );
    if (variant) {
      setActiveVariant(variant);
      // Đặt lại số lượng mua nếu vượt quá tồn kho của biến thể mới
      if (qty > variant.stock && variant.stock > 0) {
        setQty(variant.stock);
      }
    }
  }, [selectedColor, selectedStorage]);

  // Cập nhật ảnh chính tương ứng khi đổi màu sắc
  const handleColorChange = (colorName: string, colorImg: string) => {
    setSelectedColor(colorName);
    setActiveImage(colorImg);
  };

  // Tăng giảm số lượng mua hàng
  const handleQtyChange = (action: 'inc' | 'dec') => {
    if (action === 'dec') {
      if (qty > 1) setQty(qty - 1);
    } else {
      if (qty < activeVariant.stock) {
        setQty(qty + 1);
      }
    }
  };

  // Xử lý gửi đánh giá mới
  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) {
      alert("Vui lòng nhập đầy đủ thông tin tên và nội dung bình luận!");
      return;
    }

    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

    const newReview = {
      name: newReviewName,
      rating: newReviewRating,
      date: formattedDate,
      comment: newReviewComment
    };

    setReviews([newReview, ...reviews]);
    setNewReviewName('');
    setNewReviewComment('');
    setNewReviewRating(5);
    alert("Cảm ơn bạn đã gửi đánh giá sản phẩm! 🎉");
  };

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
            <Link to="/products">{product.category}</Link>
            <span>/</span>
            <span>{product.title}</span>
          </div>
        </div>
      </div>

      {/* PRODUCT DETAIL */}
      <section className="section products-section-bg">
        <div className="container">
          <div className="product-detail-grid">
            
            {/* Gallery Component */}
            <ProductGallery
              activeImage={activeImage}
              images={colors}
              onImageClick={(img) => setActiveImage(img)}
              productTitle={product.title}
              videoUrl={product.metadata.video_url}
            />

            {/* Info Component */}
            <ProductInfo
              product={product}
              colors={colors}
              storages={storages}
              selectedColor={selectedColor}
              selectedStorage={selectedStorage}
              activeVariant={activeVariant}
              qty={qty}
              reviewsCount={reviews.length}
              onColorChange={handleColorChange}
              onStorageChange={setSelectedStorage}
              onQtyChange={handleQtyChange}
            />

          </div>

          {/* TABS: Mô tả / Đánh giá */}
          <div style={{ marginTop: '4rem' }}>
            <div className="flex-center" style={{ gap: 0, borderBottom: '2px solid var(--border)', marginBottom: '2rem' }}>
              <button 
                id="tabDesc" 
                style={{ 
                  padding: '0.8rem 2rem', 
                  fontFamily: 'var(--font-body)', 
                  fontSize: '0.85rem', 
                  fontWeight: 700, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px', 
                  border: 'none', 
                  background: 'none', 
                  cursor: 'pointer', 
                  borderBottom: activeTab === 'desc' ? '2px solid var(--dark)' : '2px solid transparent', 
                  marginBottom: '-2px', 
                  color: activeTab === 'desc' ? 'var(--dark)' : 'var(--gray)' 
                }}
                onClick={() => setActiveTab('desc')}
              >
                Mô tả sản phẩm
              </button>
              <button 
                id="tabReview" 
                style={{ 
                  padding: '0.8rem 2rem', 
                  fontFamily: 'var(--font-body)', 
                  fontSize: '0.85rem', 
                  fontWeight: 700, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px', 
                  border: 'none', 
                  background: 'none', 
                  cursor: 'pointer', 
                  borderBottom: activeTab === 'reviews' ? '2px solid var(--dark)' : '2px solid transparent', 
                  marginBottom: '-2px', 
                  color: activeTab === 'reviews' ? 'var(--dark)' : 'var(--gray)' 
                }}
                onClick={() => setActiveTab('reviews')}
              >
                Đánh giá ({reviews.length})
              </button>
            </div>

            {/* TAB PANEL: MÔ TẢ */}
            {activeTab === 'desc' && (
              <div id="panelDesc" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem' }}>
                {/* Mô tả bên trái */}
                <div style={{ lineHeight: 1.8, color: '#333' }}>
                  <p style={{ marginBottom: '1.2rem', fontSize: '1rem' }}>{product.description}</p>
                  
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '1.5rem 0 0.8rem' }}>Đặc điểm nổi bật</h3>
                  <ul style={{ paddingLeft: '1.2rem', marginBottom: '2rem' }}>
                    {product.keyFeatures.map((feat, idx) => (
                      <li key={idx} style={{ marginBottom: '0.6rem', listStyleType: 'disc' }}>{feat}</li>
                    ))}
                  </ul>

                  {/* KHUYẾN MÃI & ƯU ĐÃI (FPT Shop / CellphoneS Style) */}
                  <div style={{ background: '#fff9f9', border: '1px solid #ffcccc', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
                    <h4 style={{ color: '#d9534f', fontSize: '1.05rem', fontWeight: 700, margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <i className="bi bi-gift-fill" style={{ fontSize: '1.2rem' }}></i> KHUYẾN MÃI & ƯU ĐÃI ĐẶC BIỆT
                    </h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      <li style={{ display: 'flex', gap: '0.6rem', alignItems: 'start', fontSize: '0.9rem' }}>
                        <i className="bi bi-check-circle-fill" style={{ color: '#28a745', marginTop: '3px' }}></i>
                        <span><strong>Miễn phí vận chuyển:</strong> Giao hàng siêu tốc toàn quốc cho đơn hàng từ 10.000.000đ.</span>
                      </li>
                      <li style={{ display: 'flex', gap: '0.6rem', alignItems: 'start', fontSize: '0.9rem' }}>
                        <i className="bi bi-check-circle-fill" style={{ color: '#28a745', marginTop: '3px' }}></i>
                        <span><strong>Ưu đãi chủ thẻ:</strong> Giảm thêm 500.000đ khi thanh toán trả góp 0% qua thẻ tín dụng Techcombank, VIB.</span>
                      </li>
                      <li style={{ display: 'flex', gap: '0.6rem', alignItems: 'start', fontSize: '0.9rem' }}>
                        <i className="bi bi-check-circle-fill" style={{ color: '#28a745', marginTop: '3px' }}></i>
                        <span><strong>Thu cũ đổi mới:</strong> Hỗ trợ trợ giá lên tới 2.000.000đ (Định giá máy cũ nhanh chóng tại cửa hàng).</span>
                      </li>
                      <li style={{ display: 'flex', gap: '0.6rem', alignItems: 'start', fontSize: '0.9rem' }}>
                        <i className="bi bi-check-circle-fill" style={{ color: '#28a745', marginTop: '3px' }}></i>
                        <span><strong>Combo phụ kiện:</strong> Giảm giá thêm 15% khi mua kèm Cáp sạc nhanh Anker hoặc Tai nghe Bluetooth.</span>
                      </li>
                    </ul>
                  </div>

                  {/* CAM KẾT VÀ QUYỀN LỢI */}
                  <div style={{ background: '#f8f9fa', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <i className="bi bi-shield-fill-check" style={{ fontSize: '1.2rem', color: 'var(--success)' }}></i> CAM KẾT CHẤT LƯỢNG & DỊCH VỤ
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'start' }}>
                        <div style={{ background: '#e8f5e9', color: '#2e7d32', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <i className="bi bi-award" style={{ fontSize: '1.2rem' }}></i>
                        </div>
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.85rem' }}>100% Hàng Chính Hãng</strong>
                          <span style={{ fontSize: '0.75rem', color: '#666', lineHeight: 1.4, display: 'block' }}>Sản phẩm mới nguyên seal, nhập khẩu chính ngạch Apple Việt Nam (AAR).</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'start' }}>
                        <div style={{ background: '#e3f2fd', color: '#1565c0', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <i className="bi bi-arrow-repeat" style={{ fontSize: '1.2rem' }}></i>
                        </div>
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.85rem' }}>Lỗi Là Đổi Mới</strong>
                          <span style={{ fontSize: '0.75rem', color: '#666', lineHeight: 1.4, display: 'block' }}>Hỗ trợ 1 đổi 1 trong vòng 30 ngày nếu phát sinh lỗi từ nhà sản xuất.</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'start' }}>
                        <div style={{ background: '#fff8e1', color: '#f57f17', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <i className="bi bi-tools" style={{ fontSize: '1.2rem' }}></i>
                        </div>
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.85rem' }}>Hỗ Trợ Kỹ Thuật 24/7</strong>
                          <span style={{ fontSize: '0.75rem', color: '#666', lineHeight: 1.4, display: 'block' }}>Miễn phí chuyển dữ liệu từ máy cũ, cài đặt phần mềm trọn đời máy.</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'start' }}>
                        <div style={{ background: '#f3e5f5', color: '#6a1b9a', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <i className="bi bi-gem" style={{ fontSize: '1.2rem' }}></i>
                        </div>
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.85rem' }}>Thành Viên Premium</strong>
                          <span style={{ fontSize: '0.75rem', color: '#666', lineHeight: 1.4, display: 'block' }}>Tích lũy điểm khi mua hàng, nhận voucher sinh nhật & giảm giá dịch vụ sửa chữa.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Thông số kỹ thuật Component bên phải */}
                <ProductSpecsTable specifications={product.metadata.specifications} />
              </div>
            )}

            {/* TAB PANEL: ĐÁNH GIÁ */}
            {activeTab === 'reviews' && (
              <ProductReviewsTab
                reviews={reviews}
                rating={product.rating}
                newReviewName={newReviewName}
                newReviewRating={newReviewRating}
                newReviewComment={newReviewComment}
                setNewReviewName={setNewReviewName}
                setNewReviewRating={setNewReviewRating}
                setNewReviewComment={setNewReviewComment}
                onAddReview={handleAddReview}
              />
            )}
          </div>

          {/* RELATED PRODUCTS */}
          <div style={{ marginTop: '5rem' }}>
            <div className="section-header">
              <div className="section-header-row">
                <div>
                  <div className="section-title">SẢN PHẨM LIÊN QUAN</div>
                </div>
                <Link to="/products" className="see-all">XEM TẤT CẢ <i className="bi bi-arrow-right"></i></Link>
              </div>
            </div>
            <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
              {mockRelatedProducts.map((p) => (
                <Link key={p.id} to={`/products/${p.id}`} className="product-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                  <div className="product-card-img" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fff', borderRadius: 'var(--radius)', overflow: 'hidden', height: '220px', border: '1px solid var(--border)' }}>
                    <img src={p.img} alt={p.name} style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
                    <button className="product-card-btn-add btn-add-cart" onClick={(e) => { e.preventDefault(); alert(`Đã thêm ${p.name} vào giỏ hàng!`); }}><i className="bi bi-plus"></i></button>
                  </div>
                  <div className="product-card-body" style={{ padding: '1rem 0' }}>
                    <div className="product-category" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#999', fontWeight: 600 }}>{p.category}</div>
                    <div className="product-name" style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0.3rem 0', color: 'var(--dark)' }}>{p.name}</div>
                    <div className="product-price-row"><span className="product-price" style={{ color: 'var(--accent)', fontWeight: 800 }}>{p.price}</span></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </section>
    </>
  );
};

export default ProductDetailPage;
