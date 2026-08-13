import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Check, 
  ChevronRight
} from 'lucide-react';
import { useProduct, useProducts } from '../services/product.service';
import ProductGallery from '../components/ProductDetail/ProductGallery';
import ProductInfo from '../components/ProductDetail/ProductInfo';
import ProductSpecsTable from '../components/ProductDetail/ProductSpecsTable';
import ProductReviewsTab from '../components/ProductDetail/ProductReviewsTab';
import { ProductDetailSkeleton } from '../components/ProductDetailSkeleton';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

// Removed inline skeleton, now using imported ProductDetailSkeleton
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
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchReviews = async () => {
    if (!id) return;
    try {
      const res = await fetch(`http://localhost:9000/store/reviews?product_id=${id}`, {
        headers: {
          'x-publishable-api-key': 'pk_a2f0825ab169a70b98f5a520693ca5e8e633f36c1b5dabd5548326c5451c4e6d'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        if (data.average_rating !== undefined && fetchedProduct) {
          if (!fetchedProduct.metadata) fetchedProduct.metadata = {};
          fetchedProduct.metadata.rating = data.average_rating;
        }
      }
    } catch (err) {
      console.warn("Failed to fetch reviews dynamically:", err);
    }
  };

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

      // Track VIEW interaction
      const sessionId = typeof window !== 'undefined' ? localStorage.getItem('session_id') : undefined;
      import('../services/product.service').then(({ productService }) => {
        productService.trackInteraction(fetchedProduct.id, 'VIEW', sessionId || undefined);
      });
    }
  }, [fetchedProduct]);

  useEffect(() => {
    fetchReviews();

    const handleCustomerChanged = () => {
      setErrorMessage("");
      setSuccessMessage("");
    };

    window.addEventListener('test-customer-changed', handleCustomerChanged);
    return () => {
      window.removeEventListener('test-customer-changed', handleCustomerChanged);
    };
  }, [id]);

  // Sync active variant's thumbnail to main image when selected options change
  useEffect(() => {
    if (!fetchedProduct) return;
    
    const colorOptId = fetchedProduct.options?.find((o: any) => o.title === 'Màu sắc' || o.title === 'Color')?.id;
    const storageOptId = fetchedProduct.options?.find((o: any) => o.title === 'Dung lượng' || o.title === 'Storage')?.id;

    const activeVar = fetchedProduct.variants?.find((v: any) => {
      if (!v.options || (Array.isArray(v.options) && v.options.length === 0)) return false;
      
      let matchColor = !selectedColor;
      let matchStorage = !selectedStorage;

      if (Array.isArray(v.options)) {
        if (selectedColor) {
          matchColor = v.options.some((o: any) => 
            (colorOptId && o.option_id === colorOptId && o.value === selectedColor) ||
            o.value === selectedColor || o.title === selectedColor
          );
        }
        if (selectedStorage) {
          matchStorage = v.options.some((o: any) => 
            (storageOptId && o.option_id === storageOptId && o.value === selectedStorage) ||
            o.value === selectedStorage || o.title === selectedStorage
          );
        }
      } else if (typeof v.options === 'object') {
        if (selectedColor) {
          const vColor = v.options["Màu sắc"] || v.options["Color"] || (colorOptId ? v.options[colorOptId] : null);
          matchColor = vColor === selectedColor;
        }
        if (selectedStorage) {
          const vStorage = v.options["Dung lượng"] || v.options["Storage"] || (storageOptId ? v.options[storageOptId] : null);
          matchStorage = vStorage === selectedStorage;
        }
      }
      return matchColor && matchStorage;
    }) || fetchedProduct.variants?.[0];

    if (activeVar && activeVar.thumbnail) {
      setActiveImage(activeVar.thumbnail);
    }
  }, [fetchedProduct, selectedColor, selectedStorage]);

  if (isLoading) {
    return <ProductDetailSkeleton />;

  }

  if (!fetchedProduct) {
    return (
      <div className="container" style={{ padding: '8rem 0', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 800 }}>Không tìm thấy sản phẩm</h2>
        <p style={{ color: 'var(--fg-mute)', marginBottom: '2rem' }}>Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <Link to="/" className="btn btn--indigo">Quay lại trang chủ</Link>
      </div>
    );
  }

  const productData = fetchedProduct;

  // Extract Options
  const colorOption = productData.options?.find((o: any) => o.title === 'Màu sắc' || o.title === 'Color');
  const storageOption = productData.options?.find((o: any) => o.title === 'Dung lượng' || o.title === 'Storage');

  const colorOptionId = colorOption?.id;
  const storageOptionId = storageOption?.id;

  const storages = storageOption?.values?.map((v: any) => typeof v === 'string' ? v : v.value) || [];
  const colorNames = colorOption?.values?.map((v: any) => typeof v === 'string' ? v : v.value) || [];

  // Fallback mappings for colors if not defined in metadata
  const colorFallbacks: Record<string, { hex: string, img: string }> = {
    "Titan Tự Nhiên": { hex: "#8E8E8A", img: "" },
    "Titan Sa Mạc": { hex: "#D1C0B0", img: "" },
    "Titan Đen": { hex: "#2C2C2C", img: "" },
    "Titan Trắng": { hex: "#F5F5F0", img: "" },
    "Đen": { hex: "#0F172A", img: "" },
    "Trắng": { hex: "#FFFFFF", img: "" },
    "Bạc": { hex: "#E2E8F0", img: "" },
    "Cam": { hex: "#F97316", img: "" },
    "Tím": { hex: "#8B5CF6", img: "" },
    "Xanh": { hex: "#3B82F6", img: "" },
    "Xanh dương": { hex: "#2563EB", img: "" },
    "Xanh lá": { hex: "#10B981", img: "" },
    "Hồng": { hex: "#EC4899", img: "" },
    "Vàng": { hex: "#EAB308", img: "" },
    "Xám": { hex: "#6B7280", img: "" },
    "Đỏ": { hex: "#EF4444", img: "" }
  };

  const colors = colorNames.map((name: string) => {
    // Find matching variant to get the thumbnail image
    const matchingVariant = productData.variants?.find((v: any) => {
      if (!v.options) return false;
      if (Array.isArray(v.options)) {
        return v.options.some((o: any) => 
          (colorOptionId && o.option_id === colorOptionId && o.value === name) ||
          o.value === name
        );
      } else if (typeof v.options === 'object') {
        const vColor = v.options["Màu sắc"] || v.options["Color"] || (colorOptionId ? v.options[colorOptionId] : null);
        return vColor === name;
      }
      return false;
    });

    const fallback = colorFallbacks[name] || { hex: "#cccccc", img: productData.thumbnail || "" };
    const optionVal = colorOption?.values?.find((v: any) => v.name === name || v.value === name);
    return {
      name,
      hex: optionVal?.hex || fallback.hex,
      img: matchingVariant?.thumbnail || optionVal?.img || fallback.img
    };
  });

  const activeVariant = productData.variants?.find((v: any) => {
    if (!v.options || (Array.isArray(v.options) && v.options.length === 0)) return false;
    
    let matchColor = !selectedColor;
    let matchStorage = !selectedStorage;

    if (Array.isArray(v.options)) {
      if (selectedColor) {
        matchColor = v.options.some((o: any) => 
          (colorOptionId && o.option_id === colorOptionId && o.value === selectedColor) ||
          o.value === selectedColor || o.title === selectedColor
        );
      }
      if (selectedStorage) {
        matchStorage = v.options.some((o: any) => 
          (storageOptionId && o.option_id === storageOptionId && o.value === selectedStorage) ||
          o.value === selectedStorage || o.title === selectedStorage
        );
      }
    } else if (typeof v.options === 'object') {
      if (selectedColor) {
        const vColor = v.options["Màu sắc"] || v.options["Color"] || (colorOptionId ? v.options[colorOptionId] : null);
        matchColor = vColor === selectedColor;
      }
      if (selectedStorage) {
        const vStorage = v.options["Dung lượng"] || v.options["Storage"] || (storageOptionId ? v.options[storageOptionId] : null);
        matchStorage = vStorage === selectedStorage;
      }
    }
    return matchColor && matchStorage;
  }) || productData.variants?.[0] || { id: "", price: 0, oldPrice: 0, stock: 10, inventory_quantity: 10, sku: "SPRYLO-PROD" };

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

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!newReviewComment.trim()) {
      setErrorMessage("Vui lòng nhập nội dung bình luận.");
      return;
    }

    const token = localStorage.getItem('customer_token');
    const info = localStorage.getItem('customer_info');
    let customerId = '';
    if (info) {
      try {
        const parsed = JSON.parse(info);
        customerId = parsed.id;
      } catch (e) {
        console.error("Failed to parse customer_info", e);
      }
    }

    if (!customerId) {
      customerId = localStorage.getItem('test_customer_id') || 'cus_01KWH0KYDJM5N7GW2G6WMXMXC4';
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-publishable-api-key': 'pk_a2f0825ab169a70b98f5a520693ca5e8e633f36c1b5dabd5548326c5451c4e6d',
      'x-customer-id': customerId
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`http://localhost:9000/store/reviews`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          product_id: id,
          rating: newReviewRating,
          comment: newReviewComment
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage("Gửi đánh giá của bạn thành công!");
        toast.success("Cảm ơn bạn đã đánh giá sản phẩm!");
        setNewReviewComment("");
        fetchReviews(); // Refresh review list
      } else {
        setErrorMessage(data.message || "Gửi đánh giá thất bại.");
        toast.error(data.message || "Gửi đánh giá thất bại.");
      }
    } catch (err) {
      setErrorMessage("Không thể kết nối đến server backend.");
      toast.error("Lỗi kết nối server.");
    }
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
            <Link to="/">Trang chủ</Link> <span className="sep">›</span> <Link to="/products">Điện thoại</Link> <span className="sep">›</span> <span>{productData.title}</span>
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
                  id: activeVariant.id,
                  price: price,
                  oldPrice: oldPrice,
                  stock: activeVariant.manage_inventory === false
                    ? 999 // Không quản lý tồn kho → luôn còn hàng
                    : (activeVariant.inventory_quantity !== undefined && activeVariant.inventory_quantity !== null)
                      ? activeVariant.inventory_quantity
                      : ((activeVariant.stock !== undefined && activeVariant.stock !== null)
                          ? activeVariant.stock
                          : 0), // null = chưa cấu hình stock location → coi là hết hàng
                  sku: activeVariant.sku || "SPRYLO-PROD"
                }}
                qty={qty}
                reviewsCount={reviews.length}
                onColorChange={(colorName, colorImg) => {
                  setSelectedColor(colorName);
                  if (colorImg) setActiveImage(colorImg);
                }}
                onStorageChange={(storageName) => setSelectedStorage(storageName)}
                onQtyChange={(action) => setQty(q => action === 'inc' ? Math.min(10, q + 1) : Math.max(1, q - 1))}
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
                <ProductSpecsTable 
                  specifications={specifications} 
                  weight={productData.weight}
                  height={productData.height}
                  width={productData.width}
                  length={productData.length}
                />
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
              errorMessage={errorMessage}
              successMessage={successMessage}
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
                {relatedProducts.map((p: any) => (
                  <ProductCard product={p} key={p.id} />
                ))}
              </div>
            </section>
          )}

        </div>
      </main>
    </>
  );
};

export default ProductDetailPage;