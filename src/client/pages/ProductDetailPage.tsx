import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useProduct, useProducts } from '../services/product.service';
import ProductGallery from '../components/ProductDetail/ProductGallery';
import ProductInfo from '../components/ProductDetail/ProductInfo';
import ProductSpecsTable from '../components/ProductDetail/ProductSpecsTable';
import ProductReviewsTab from '../components/ProductDetail/ProductReviewsTab';

// Color mapper to display colors dynamically on the client side
const getColorHexAndImg = (colorName: string, fallbackImg: string) => {
  const map: Record<string, { hex: string; img: string }> = {
    "Titan Sa Mạc": { hex: "#c2b4a4", img: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-16-pro-titan-sa-mac.png" },
    "Titan Đen": { hex: "#3b3c3e", img: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-16-pro-titan-den.png" },
    "Titan Trắng": { hex: "#f2f1ed", img: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-16-pro-titan-trang.png" },
    "Titan Tự Nhiên": { hex: "#a4a09c", img: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-16-pro-titan-tu-nhien.png" },
    "Titan Xám": { hex: "#7a7d80", img: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/s/a/samsung-s25-ultra-gray.png" },
    "Xanh Titan": { hex: "#2e3b4e", img: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/s/a/samsung-s25-ultra-blue.png" },
  };
  return map[colorName] || { hex: "#cccccc", img: fallbackImg };
};

// Fallback technical specifications and YouTube review videos based on handle
const getSpecsAndVideo = (handle: string = '', title: string = '') => {
  const lowercaseHandle = handle.toLowerCase();
  if (lowercaseHandle.includes('iphone-16')) {
    return {
      videoUrl: 'https://www.youtube.com/watch?v=eDqfg_W9VDo',
      specifications: {
        "Màn hình": "6.3 inches, Super Retina XDR OLED, 120Hz",
        "Hệ điều hành": "iOS 18",
        "Camera sau": "48 MP + 48 MP + 12 MP",
        "Camera trước": "12 MP",
        "Chipset": "Apple A18 Pro",
        "RAM": "8 GB",
        "Dung lượng pin": "3582 mAh, sạc nhanh 25W"
      }
    };
  }
  if (lowercaseHandle.includes('samsung-galaxy-s25') || lowercaseHandle.includes('s25')) {
    return {
      videoUrl: 'https://www.youtube.com/watch?v=FcoW0gK4H-s',
      specifications: {
        "Màn hình": "6.8 inches, Dynamic AMOLED 2X, 120Hz",
        "Hệ điều hành": "Android 15, One UI 7",
        "Camera sau": "200 MP + 50 MP + 12 MP + 10 MP",
        "Camera trước": "12 MP",
        "Chipset": "Snapdragon 8 Elite",
        "RAM": "12 GB",
        "Dung lượng pin": "5000 mAh, sạc nhanh 45W"
      }
    };
  }
  return {
    videoUrl: '',
    specifications: {
      "Màn hình": "Màn hình tràn viền độ phân giải cao",
      "Hệ điều hành": "Hệ điều hành mới nhất",
      "Camera": "Độ phân giải sắc nét",
      "Chipset": "Hiệu năng mạnh mẽ",
      "Dung lượng pin": "Pin dung lượng lớn, sạc nhanh"
    }
  };
};

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useProduct(id || '');

  // 1. Quản lý State lựa chọn Biến thể
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews'>('desc');

  // 2. Map Options từ Medusa API
  const colors = useMemo(() => {
    if (!product || !product.options) return [];
    const colorOpt = product.options.find((o: any) => o.title === 'Màu sắc' || o.title === 'Color');
    return colorOpt?.values?.map((v: any) => {
      const info = getColorHexAndImg(v.value, product.thumbnail || '');
      return { name: v.value, hex: info.hex, img: info.img };
    }) || [];
  }, [product]);

  const storages = useMemo(() => {
    if (!product || !product.options) return [];
    const storageOpt = product.options.find((o: any) => o.title === 'Dung lượng' || o.title === 'Storage');
    return storageOpt?.values?.map((v: any) => v.value) || [];
  }, [product]);

  // Khởi tạo lựa chọn ban đầu khi dữ liệu tải xong
  useEffect(() => {
    if (product) {
      if (colors.length > 0) {
        setSelectedColor(colors[0].name);
        setActiveImage(colors[0].img);
      }
      if (storages.length > 0) {
        setSelectedStorage(storages[0]);
      }
    }
  }, [product, colors, storages]);

  // Tìm active variant tương ứng với màu và dung lượng đang chọn
  const activeVariant = useMemo(() => {
    if (!product || !product.variants) return null;
    const colorOptionId = product.options?.find((o: any) => o.title === 'Màu sắc' || o.title === 'Color')?.id;
    const storageOptionId = product.options?.find((o: any) => o.title === 'Dung lượng' || o.title === 'Storage')?.id;

    return product.variants.find((v: any) => {
      let matchColor = true;
      let matchStorage = true;

      if (colorOptionId) {
        matchColor = v.options?.some((opt: any) => opt.option_id === colorOptionId && opt.value === selectedColor);
      }
      if (storageOptionId) {
        matchStorage = v.options?.some((opt: any) => opt.option_id === storageOptionId && opt.value === selectedStorage);
      }

      return matchColor && matchStorage;
    });
  }, [product, selectedColor, selectedStorage]);

  // Mapped active variant props cho Component con
  const activeVariantMapped = useMemo(() => {
    const price = activeVariant?.prices?.find((p: any) => p.currency_code === 'vnd')?.amount || activeVariant?.prices?.[0]?.amount || 0;
    return {
      price: price,
      oldPrice: price * 1.15, // Tạo giá cũ giả lập để hiển thị tag giảm giá đẹp mắt
      stock: activeVariant?.inventory_quantity ?? 100, // Mặc định 100 nếu không quản lý kho chi tiết
      sku: activeVariant?.sku || 'SKU-GENERIC',
    };
  }, [activeVariant]);

  // 3. Fetch sản phẩm liên quan
  const categoryId = product?.categories?.[0]?.id;
  const { data: relatedData } = useProducts(
    categoryId ? { category_id: [categoryId], limit: 5 } : undefined
  );

  const relatedProducts = useMemo(() => {
    if (!relatedData?.products) return [];
    return relatedData.products
      .filter((p: any) => p.id !== id)
      .slice(0, 4)
      .map((p: any) => {
        const price = p.variants?.[0]?.prices?.find((pr: any) => pr.currency_code === 'vnd')?.amount || p.variants?.[0]?.prices?.[0]?.amount || 0;
        return {
          id: p.id,
          name: p.title,
          img: p.thumbnail || 'https://via.placeholder.com/350',
          price: price.toLocaleString('vi-VN') + 'đ',
          category: p.categories?.[0]?.name || 'Sản phẩm',
        };
      });
  }, [relatedData, id]);

  // 4. Quản lý reviews cục bộ
  const [reviews, setReviews] = useState<Array<{ name: string; rating: number; date: string; comment: string }>>([
    { name: "Nguyễn Văn A", rating: 5, date: "15/06/2026", comment: "Sản phẩm dùng cực kỳ mượt mà, chụp ảnh đẹp xuất sắc. Rất đáng đồng tiền bát gạo!" },
    { name: "Trần Thị B", rating: 4, date: "10/06/2026", comment: "Giao hàng nhanh, máy đẹp nguyên seal. Tuy nhiên hộp hơi móp nhẹ lúc vận chuyển." }
  ]);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');

  // Thay đổi màu sắc và ảnh chính
  const handleColorChange = (colorName: string, colorImg: string) => {
    setSelectedColor(colorName);
    setActiveImage(colorImg);
  };

  // Tăng giảm số lượng
  const handleQtyChange = (action: 'inc' | 'dec') => {
    if (action === 'dec') {
      if (qty > 1) setQty(qty - 1);
    } else {
      if (qty < activeVariantMapped.stock) {
        setQty(qty + 1);
      }
    }
  };

  // Gửi review mới
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

  // Phân tích thông tin bổ sung và video của sản phẩm
  const { videoUrl, specifications } = useMemo(() => {
    return getSpecsAndVideo(product?.handle, product?.title);
  }, [product]);

  if (isLoading) {
    return (
      <div className="container flex-center" style={{ minHeight: '400px', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p className="text-muted">Đang tải thông tin sản phẩm...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2>Không tìm thấy sản phẩm</h2>
        <p className="text-muted" style={{ margin: '1rem 0 2rem' }}>Sản phẩm có thể đã bị xóa hoặc không tồn tại.</p>
        <Link to="/products" className="btn btn-primary">Quay lại danh sách</Link>
      </div>
    );
  }

  const categoryName = product.categories?.[0]?.name || 'Sản phẩm';

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
            <span>{categoryName}</span>
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
              activeImage={activeImage || product.thumbnail || ''}
              images={colors}
              onImageClick={(img) => setActiveImage(img)}
              productTitle={product.title}
              videoUrl={videoUrl}
            />

            {/* Info Component */}
            <ProductInfo
              product={{
                category: categoryName,
                title: product.title,
                subtitle: product.subtitle || '',
                rating: 4.8, // Đánh giá mặc định
              }}
              colors={colors}
              storages={storages}
              selectedColor={selectedColor}
              selectedStorage={selectedStorage}
              activeVariant={activeVariantMapped}
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
                  <p style={{ marginBottom: '1.2rem', fontSize: '1rem' }}>{product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}</p>
                  
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '1.5rem 0 0.8rem' }}>Đặc điểm nổi bật</h3>
                  <ul style={{ paddingLeft: '1.2rem', marginBottom: '2rem' }}>
                    <li style={{ marginBottom: '0.6rem', listStyleType: 'disc' }}>Thiết kế sang trọng, gia công tỉ mỉ với chất liệu cao cấp.</li>
                    <li style={{ marginBottom: '0.6rem', listStyleType: 'disc' }}>Hiệu năng mạnh mẽ vượt trội, tối ưu tốt cho mọi tác vụ hàng ngày.</li>
                    <li style={{ marginBottom: '0.6rem', listStyleType: 'disc' }}>Hệ thống camera cải tiến, ghi lại hình ảnh sắc nét trong mọi điều kiện ánh sáng.</li>
                    <li style={{ marginBottom: '0.6rem', listStyleType: 'disc' }}>Thời lượng pin bền bỉ, tích hợp công nghệ sạc nhanh thông minh.</li>
                  </ul>

                  {/* KHUYẾN MÃI & ƯU ĐÃI (CellphoneS Style) */}
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
                        <span><strong>Ưu đãi chủ thẻ:</strong> Giảm thêm 500.000đ khi trả góp 0% qua thẻ tín dụng Techcombank, VIB.</span>
                      </li>
                      <li style={{ display: 'flex', gap: '0.6rem', alignItems: 'start', fontSize: '0.9rem' }}>
                        <i className="bi bi-check-circle-fill" style={{ color: '#28a745', marginTop: '3px' }}></i>
                        <span><strong>Thu cũ đổi mới:</strong> Hỗ trợ trợ giá lên tới 2.000.000đ khi thu mua máy cũ tại cửa hàng.</span>
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
                          <span style={{ fontSize: '0.75rem', color: '#666', lineHeight: 1.4, display: 'block' }}>Sản phẩm mới nguyên seal, chính ngạch, cam kết hoàn tiền nếu phát hiện hàng nhái.</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'start' }}>
                        <div style={{ background: '#e3f2fd', color: '#1565c0', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <i className="bi bi-arrow-repeat" style={{ fontSize: '1.2rem' }}></i>
                        </div>
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.85rem' }}>1 Đổi 1 Trong 30 Ngày</strong>
                          <span style={{ fontSize: '0.75rem', color: '#666', lineHeight: 1.4, display: 'block' }}>Hỗ trợ 1 đổi 1 nhanh chóng nếu có lỗi từ nhà sản xuất trong tháng đầu.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Thông số kỹ thuật Component bên phải */}
                <ProductSpecsTable specifications={specifications} />
              </div>
            )}

            {/* TAB PANEL: ĐÁNH GIÁ */}
            {activeTab === 'reviews' && (
              <ProductReviewsTab
                reviews={reviews}
                rating={4.8}
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
          {relatedProducts.length > 0 && (
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
                {relatedProducts.map((p) => (
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
          )}

        </div>
      </section>
    </>
  );
};

export default ProductDetailPage;
