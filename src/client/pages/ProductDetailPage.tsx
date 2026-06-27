import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, 
  Heart, 
  Check, 
  ChevronRight, 
  ArrowRight
} from 'lucide-react';
import { useProduct, useProducts } from '../services/product.service';
import ProductGallery from '../components/ProductDetail/ProductGallery';
import ProductInfo from '../components/ProductDetail/ProductInfo';
import ProductSpecsTable from '../components/ProductDetail/ProductSpecsTable';
import ProductReviewsTab from '../components/ProductDetail/ProductReviewsTab';



// Loading Skeleton Component
const SkeletonLoader = () => (
  <div className="container" style={{ paddingTop: 'var(--s5)' }}>
    <style>{`
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: .5; }
      }
    `}</style>
    <div style={{ height: '24px', width: '200px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '2rem', animation: 'pulse 1.5s infinite' }}></div>
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', marginBottom: '3rem' }}>
      <div>
        <div style={{ height: '400px', background: '#e2e8f0', borderRadius: '12px', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }}></div>
        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ width: '70px', height: '70px', background: '#e2e8f0', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
          ))}
        </div>
      </div>
      <div>
        <div style={{ height: '14px', width: '80px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '0.5rem', animation: 'pulse 1.5s infinite' }}></div>
        <div style={{ height: '36px', width: '80%', background: '#e2e8f0', borderRadius: '6px', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }}></div>
        <div style={{ height: '20px', width: '60%', background: '#e2e8f0', borderRadius: '4px', marginBottom: '1.5rem', animation: 'pulse 1.5s infinite' }}></div>
        <div style={{ height: '60px', background: '#e2e8f0', borderRadius: '8px', marginBottom: '1.5rem', animation: 'pulse 1.5s infinite' }}></div>
        <div style={{ height: '40px', background: '#e2e8f0', borderRadius: '8px', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }}></div>
        <div style={{ height: '50px', background: '#e2e8f0', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
      </div>
    </div>
  </div>
);

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  // Fetch product dynamically using the hook
  const { data: fetchedProduct, isLoading } = useProduct(id || "");

  // Fetch related products dynamically by category (placed here to follow React Rules of Hooks)
  const categoryId = fetchedProduct?.categories?.[0]?.id;
  const { data: relatedData } = useProducts(categoryId ? { category_id: [categoryId] } : undefined);
  const { data: allProductsData } = useProducts();

  // Local States
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedStorage, setSelectedStorage] = useState("");
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState("");
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");

  // Sync reviews and initial selection when product data is loaded
  useEffect(() => {
    if (fetchedProduct) {
      const colorOption = fetchedProduct.options?.find((o: any) => o.title === 'Màu sắc' || o.title === 'Color');
      const storageOption = fetchedProduct.options?.find((o: any) => o.title === 'Dung lượng' || o.title === 'Storage');
      const colorNames = colorOption?.values?.map((v: any) => typeof v === 'string' ? v : v.value) || [];
      const storages = storageOption?.values?.map((v: any) => typeof v === 'string' ? v : v.value) || [];

      if (colorNames.length > 0) {
        setSelectedColor(colorNames[0]);
      }
      if (storages.length > 0) {
        setSelectedStorage(storages[0]);
      }
      setActiveImage(fetchedProduct.thumbnail || "");

      if (fetchedProduct.metadata?.reviewsList) {
        setReviews(fetchedProduct.metadata.reviewsList);
      } else {
        setReviews([]);
      }
    }
  }, [fetchedProduct]);

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (!fetchedProduct) {
    return (
      <div className="container" style={{ padding: '8rem 0', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 800 }}>Không tìm thấy sản phẩm</h2>
        <p style={{ color: 'var(--fg-mute)', marginBottom: '2rem' }}>Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <Link to="/products" className="btn btn--indigo">Quay lại cửa hàng</Link>
      </div>
    );
  }

  const productData = fetchedProduct;

  // Extract Options
  const colorOption = productData.options?.find((o: any) => o.title === 'Màu sắc' || o.title === 'Color');
  const storageOption = productData.options?.find((o: any) => o.title === 'Dung lượng' || o.title === 'Storage');

  const storages = storageOption?.values?.map((v: any) => typeof v === 'string' ? v : v.value) || [];
  const colorNames = colorOption?.values?.map((v: any) => typeof v === 'string' ? v : v.value) || [];

  // Fallback mappings for colors if not defined in metadata
  const colorFallbacks: Record<string, { hex: string, img: string }> = {
    "Titan Tự Nhiên": { hex: "#8E8E8A", img: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-16-pro-titan-tu-nhien.png" },
    "Titan Sa Mạc": { hex: "#D1C0B0", img: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-16-pro-titan-sa-mac.png" },
    "Titan Đen": { hex: "#2C2C2C", img: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-16-pro-titan-den.png" },
    "Titan Trắng": { hex: "#F5F5F0", img: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-16-pro-titan-trang.png" },
    "Đen": { hex: "#0F172A", img: productData.thumbnail || "" },
    "Trắng": { hex: "#FFFFFF", img: productData.thumbnail || "" },
    "Cam": { hex: "#F97316", img: productData.thumbnail || "" },
    "Tím": { hex: "#4F46E5", img: productData.thumbnail || "" }
  };

  const colors = colorNames.map((name: string) => {
    const fallback = colorFallbacks[name] || { hex: "#cccccc", img: productData.thumbnail || "" };
    const optionVal = colorOption?.values?.find((v: any) => v.name === name);
    return {
      name,
      hex: optionVal?.hex || fallback.hex,
      img: optionVal?.img || fallback.img
    };
  });

  // Find active variant by matching options
  const activeVariant = productData.variants?.find((v: any) => {
    if (v.options && !Array.isArray(v.options)) {
      const vColor = v.options["Màu sắc"] || v.options["Color"];
      const vStorage = v.options["Dung lượng"] || v.options["Storage"];
      return (!selectedColor || vColor === selectedColor) && (!selectedStorage || vStorage === selectedStorage);
    }
    if (Array.isArray(v.options)) {
      const matchColor = !selectedColor || v.options.some((o: any) => o.value === selectedColor);
      const matchStorage = !selectedStorage || v.options.some((o: any) => o.value === selectedStorage);
      return matchColor && matchStorage;
    }
    return false;
  }) || productData.variants?.[0] || { price: 0, oldPrice: 0, stock: 0, sku: "SPRYLO-PROD" };

  const price = activeVariant.prices?.find((p: any) => p.currency_code === 'vnd')?.amount 
    || activeVariant.prices?.[0]?.amount 
    || activeVariant.price 
    || productData.basePrice 
    || 0;

  const oldPrice = activeVariant.oldPrice || (price * 1.15);

  // Specifications
  const specifications = productData.metadata?.specifications || {};

  // Video embed url
  const videoUrl = productData.metadata?.video_url || "";

  // Seller Reputation Data
  const seller = productData.metadata?.seller;

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) return;
    const newRev = {
      name: newReviewName,
      rating: newReviewRating,
      date: 'Vừa xong',
      comment: newReviewComment
    };
    setReviews([newRev, ...reviews]);
    setNewReviewName("");
    setNewReviewComment("");
  };

  // Gallery Images
  const galleryImages = (productData.images && productData.images.length > 0)
    ? productData.images.map((img: any) => img.url)
    : [productData.thumbnail || ""];

  const relatedProducts = (relatedData?.products || allProductsData?.products || [])
    ?.filter((p: any) => p.id !== productData.id)
    ?.slice(0, 5) || [];

  return (
    <>
      <main id="main">
        <div className="container">
          <div className="crumbs" style={{ paddingTop: 'var(--s5)' }}>
            <Link to="/">Trang chủ</Link> <span className="sep">›</span> <Link to="/products">Sản phẩm</Link> <span className="sep">›</span> <span>{productData.title}</span>
          </div>

          <section className="product-detail" style={{ 
            display: 'grid', 
            gridTemplateColumns: '1.2fr 1fr', 
            gap: '3rem', 
            marginBottom: '1rem',
            paddingBottom: '0'
          }}>
            
            {/* LEFT COLUMN: Gallery, Trust Badges & Seller Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <ProductGallery
                activeImage={activeImage || productData.thumbnail || galleryImages[0] || ""}
                images={galleryImages}
                onImageClick={(img) => setActiveImage(img)}
                productTitle={productData.title}
                videoUrl={videoUrl}
              />

              {/* TRUST BADGES */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '0.75rem', 
                padding: '1rem', 
                background: 'var(--bg, #f8fafc)', 
                borderRadius: '12px',
                border: '1px solid var(--border, #e2e8f0)' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--fg-soft, #475569)' }}>
                  <i className="bi bi-shield-check" style={{ fontSize: '1.2rem', color: 'var(--success, #10b981)' }}></i>
                  <span>Bảo hành 12 tháng</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--fg-soft, #475569)' }}>
                  <i className="bi bi-arrow-return-left" style={{ fontSize: '1.2rem', color: 'var(--info, #0284c7)' }}></i>
                  <span>Đổi trả 30 ngày</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--fg-soft, #475569)' }}>
                  <i className="bi bi-truck" style={{ fontSize: '1.2rem', color: 'var(--accent, #f43f5e)' }}></i>
                  <span>Giao hàng miễn phí</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--fg-soft, #475569)' }}>
                  <i className="bi bi-credit-card" style={{ fontSize: '1.2rem', color: 'var(--dark, #0f172a)' }}></i>
                  <span>Thanh toán an toàn</span>
                </div>
              </div>

              {/* SELLER REPUTATION CARD */}
              {seller && (
                <div className="seller-card" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.2rem',
                  background: 'var(--bg, #f8fafc)',
                  borderRadius: '12px',
                  border: '1px solid var(--border, #e2e8f0)',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* Seller Logo */}
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}>
                      {seller.name?.charAt(0) || "S"}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, color: 'var(--ink, #0f172a)' }}>{seller.name}</span>
                        {seller.is_verified && (
                          <span style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: '#fff',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.4rem',
                            borderRadius: '999px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px',
                            boxShadow: '0 2px 4px rgb(16 185 129 / 0.2)'
                          }}>
                            <Check size={10} strokeWidth={3} /> {seller.badge_text || "Uy Tín"}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--fg-mute, #64748b)', marginTop: '0.25rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#f59e0b', fontWeight: 600 }}>
                          ★ {seller.rating || "5.0"}
                        </span>
                        {seller.review_count && <span>({seller.review_count} đánh giá)</span>}
                        {seller.response_rate && (
                          <>
                            <span>•</span>
                            <span>Phản hồi {seller.response_rate}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn--ghost btn--sm" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      <i className="bi bi-shop" style={{ marginRight: '4px' }}></i> Xem shop
                    </button>
                    <button className="btn btn--indigo btn--sm" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', whiteSpace: 'nowrap', background: 'var(--indigo, #4f46e5)' }}>
                      <i className="bi bi-chat-dots" style={{ marginRight: '4px' }}></i> Chat ngay
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Product Info & Actions */}
            <div className="pdp-info">
              <ProductInfo
                product={{
                  category: productData.categories?.[0]?.name || "Thiết bị",
                  title: productData.title,
                  subtitle: productData.subtitle || productData.metadata?.subtitle || "",
                  rating: Number(productData.metadata?.rating || 5.0),
                  rawProduct: productData
                }}
                colors={colors}
                storages={storages}
                selectedColor={selectedColor}
                selectedStorage={selectedStorage}
                activeVariant={{
                  price: price,
                  oldPrice: oldPrice,
                  stock: activeVariant.stock !== undefined ? activeVariant.stock : 0,
                  sku: activeVariant.sku || "SPRYLO-PROD"
                }}
                qty={qty}
                reviewsCount={reviews.length}
                onColorChange={(colorName, colorImg) => {
                  setSelectedColor(colorName);
                  if (colorImg) setActiveImage(colorImg);
                }}
                onStorageChange={(storageName) => setSelectedStorage(storageName)}
                onQtyChange={(action) => setQty(q => action === 'inc' ? q + 1 : Math.max(1, q - 1))}
              />
            </div>
          </section>

          {/* DETAIL DESCRIPTION, VIDEO & SPECIFICATIONS SECTION */}
          <section className="section" style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '3.5rem' }}>
              
              {/* Left Column: Description & YouTube Video Embed */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '1.2rem', fontWeight: 800 }}>Mô tả chi tiết sản phẩm</h2>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      maxHeight: isDescExpanded ? 'none' : '260px',
                      overflow: 'hidden',
                      position: 'relative',
                      transition: 'max-height 0.3s ease-out'
                    }}>
                      <div className="product-desc-content" style={{ fontSize: '0.95rem', lineHeight: '1.75', color: 'var(--fg-soft, #334155)' }}>
                        {(productData.description || "Chưa có mô tả chi tiết cho sản phẩm này.").split('\n').map((para: string, i: number) => (
                          <p key={i} style={{ marginBottom: '1rem' }}>{para}</p>
                        ))}
                      </div>
                      
                      {!isDescExpanded && (
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '90px',
                          background: 'linear-gradient(to top, var(--bg-body, #ffffff), transparent)',
                          pointerEvents: 'none'
                        }}></div>
                      )}
                    </div>
                    
                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                      <button 
                        onClick={() => setIsDescExpanded(!isDescExpanded)}
                        className="btn btn--ghost"
                        style={{
                          fontWeight: 600,
                          color: 'var(--indigo, #4f46e5)',
                          fontSize: '0.85rem',
                          padding: '0.5rem 1.5rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border, #e2e8f0)',
                          cursor: 'pointer'
                        }}
                      >
                        {isDescExpanded ? "Thu gọn nội dung" : "Xem thêm mô tả chi tiết"}
                      </button>
                    </div>
                  </div>
                </div>


              </div>

              {/* Right Column: Dynamic Specifications Table */}
              <div>
                <ProductSpecsTable specifications={specifications} />
              </div>
            </div>
          </section>

          {/* REVIEWS SECTION */}
          <section className="section" style={{ borderTop: '1px solid var(--border)', paddingTop: '3rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', fontWeight: 800 }}>Đánh giá của khách hàng</h2>
            <ProductReviewsTab
              reviews={reviews}
              rating={Number(productData.metadata?.rating || 5.0)}
              newReviewName={newReviewName}
              newReviewRating={newReviewRating}
              newReviewComment={newReviewComment}
              setNewReviewName={setNewReviewName}
              setNewReviewRating={setNewReviewRating}
              setNewReviewComment={setNewReviewComment}
              onAddReview={handleAddReview}
            />
          </section>

          {/* RELATED PRODUCTS */}
          {relatedProducts.length > 0 && (
            <section className="section" style={{ borderTop: '1px solid var(--border)', paddingTop: '3rem' }}>
              <div className="section-head">
                <h2 style={{ fontWeight: 800 }}>Có thể bạn sẽ thích</h2>
                <Link to="/products" className="view-all">Tất cả sản phẩm <ChevronRight size={16} /></Link>
              </div>

              <div className="products">
                {relatedProducts.map((p: any) => {
                  const pPrice = p.variants?.[0]?.prices?.find((pr: any) => pr.currency_code === 'vnd')?.amount 
                    || p.variants?.[0]?.prices?.[0]?.amount 
                    || p.variants?.[0]?.price 
                    || p.price 
                    || 0;
                  
                  const displayPrice = typeof pPrice === 'number' && pPrice > 0 ? pPrice.toLocaleString('vi-VN') + 'đ' : 'Liên hệ';
                  const imgUrl = p.thumbnail || 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80&auto=format&fit=crop';

                  return (
                    <article className="product-card" key={p.id || p.name}>
                      <div className="img-wrap">
                        <button className="wishlist"><Heart size={18} /></button>
                        <img src={imgUrl} alt={p.title || p.name} style={{ objectFit: 'contain' }} />
                      </div>
                      <div className="stock"><span className="dot"></span>Còn hàng</div>
                      <Link to={`/product/${p.id}`} className="name">{p.title || p.name}</Link>
                      <div className="price">
                        <span className="now">{displayPrice}</span>
                      </div>
                      <div className="stars">
                        <div style={{ display: 'flex', gap: '2px', color: 'var(--amber)' }}>
                          {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < 5 ? "currentColor" : "none"} />)}
                        </div>
                        <span className="count">({p.metadata?.review_count || 10})</span>
                      </div>
                      <Link to="/cart" className="btn">Đặt hàng ngay <ArrowRight size={16} /></Link>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

        </div>
      </main>
    </>
  );
};

export default ProductDetailPage;