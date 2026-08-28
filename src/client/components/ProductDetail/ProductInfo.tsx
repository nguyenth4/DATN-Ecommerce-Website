import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../../utils/cart';
import { getWishlist, toggleWishlistProduct } from '../../utils/wishlist';

interface ProductInfoProps {
  product: {
    category: string;
    title: string;
    subtitle: string;
    rating: number;
    rawProduct?: any; // Dữ liệu sản phẩm thô để truy vấn giá option
  };
  colors: Array<{ name: string; hex: string; img: string; }>;
  storages: string[];
  selectedColor: string;
  selectedStorage: string;
  activeVariant: {
    id?: string;
    price: number;
    oldPrice: number;
    stock: number;
    sku: string;
  };
  qty: number;
  reviewsCount: number;
  onColorChange: (colorName: string, colorImg: string) => void;
  onStorageChange: (storage: string) => void;
  onQtyChange: (action: 'inc' | 'dec') => void;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  colors,
  storages,
  selectedColor,
  selectedStorage,
  activeVariant,
  qty,
  reviewsCount,
  onColorChange,
  onStorageChange,
  onQtyChange,
}) => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState<string[]>(getWishlist());

  useEffect(() => {
    const handleUpdate = () => {
      setWishlist(getWishlist());
    };
    window.addEventListener('wishlist-updated', handleUpdate);
    return () => {
      window.removeEventListener('wishlist-updated', handleUpdate);
    };
  }, []);

  const discountPercent = Math.round(
    ((activeVariant.oldPrice - activeVariant.price) / activeVariant.oldPrice) * 100
  );

  // Lấy giá cho từng tuỳ chọn màu sắc (dựa vào dung lượng đang được chọn)
  const getColorPrice = (colorName: string) => {
    const raw = product.rawProduct;
    if (!raw || !raw.variants) return 0;

    const colorOptionId = raw.options?.find((o: any) => o.title === 'Màu sắc' || o.title === 'Color')?.id;
    const storageOptionId = raw.options?.find((o: any) => o.title === 'Dung lượng' || o.title === 'Storage')?.id;

    // Tìm variant khớp với cả màu sắc này và dung lượng đang chọn
    const variant = raw.variants.find((v: any) => {
      const matchColor = v.options?.some((opt: any) => opt.option_id === colorOptionId && opt.value === colorName);
      let matchStorage = true;
      if (storageOptionId && selectedStorage) {
        matchStorage = v.options?.some((opt: any) => opt.option_id === storageOptionId && opt.value === selectedStorage);
      }
      return matchColor && matchStorage;
    }) || raw.variants.find((v: any) =>
      v.options?.some((opt: any) => opt.option_id === colorOptionId && opt.value === colorName)
    );

    return variant?.prices?.find((p: any) => p.currency_code === 'vnd')?.amount
        || variant?.prices?.[0]?.amount
        || 0;
  };

  return (
    <div>
      <div className="product-detail-cat">{product.category}</div>
      <h1 className="product-detail-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{product.title}</h1>
      <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{product.subtitle}</p>

      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.2rem', gap: '0.8rem' }}>
        <div className="stars" style={{ color: '#ffc107', fontWeight: 'bold' }}>
          {reviewsCount > 0 ? (
            "★".repeat(Math.round(product.rating)) + "☆".repeat(5 - Math.round(product.rating))
          ) : (
            <span style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>Chưa có đánh giá</span>
          )}
        </div>
        {reviewsCount > 0 && (
          <span className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center' }}>
            {product.rating} ({reviewsCount} đánh giá)
          </span>
        )}
        <span style={{ width: '1px', height: '14px', background: 'var(--border)', display: 'inline-block' }}></span>
        {activeVariant.stock > 0 ? (
          <span className="text-xs text-success" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <i className="bi bi-check-circle-fill"></i> Còn hàng {activeVariant.stock < 999 ? `(${activeVariant.stock} sản phẩm)` : ''}
          </span>
        ) : (
          <span className="text-xs text-danger" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <i className="bi bi-x-circle-fill"></i> Hết hàng
          </span>
        )}
      </div>

      {/* DYNAMIC PRICE */}
      <div className="product-detail-price" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '1.5rem' }}>
        {activeVariant.price.toLocaleString('vi-VN')}đ{" "}
        <span style={{ fontSize: '1.1rem', textDecoration: 'line-through', color: 'var(--gray)', fontWeight: 500, marginLeft: '0.5rem' }}>
          {activeVariant.oldPrice.toLocaleString('vi-VN')}đ
        </span>
        <span className="text-xs" style={{ background: 'var(--accent)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700, verticalAlign: 'middle', marginLeft: '0.8rem', fontSize: '0.75rem' }}>
          -{discountPercent}%
        </span>
      </div>

      {/* DYNAMIC STORAGE SELECTION (CellphoneS Style) */}
      {storages.length > 0 && (
        <div className="variant-section" style={{ marginBottom: '1.5rem' }}>
          <div className="variant-label" style={{ marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
            Chọn dung lượng: <strong style={{ color: 'var(--dark)' }}>{selectedStorage}</strong>
          </div>
          <div className="variant-options" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.6rem'
          }}>
            {storages.map((size) => {
              return (
                <button 
                  key={size}
                  className={`storage-btn ${selectedStorage === size ? 'active' : ''}`}
                  style={{
                    padding: '0.8rem 0.4rem',
                    border: selectedStorage === size ? '2px solid #d70018' : '1px solid var(--border)',
                    borderRadius: '8px',
                    background: selectedStorage === size ? '#fef2f2' : '#fff',
                    color: 'var(--dark)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%'
                  }}
                  onClick={() => onStorageChange(size)}
                >
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{size}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* DYNAMIC COLOR SELECTION (CellphoneS Style with Image Thumbnails) */}
      {colors.length > 0 && (
        <div className="variant-section" style={{ marginBottom: '1.2rem' }}>
          <div className="variant-label" style={{ marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
            Chọn màu sắc: <strong style={{ color: 'var(--dark)' }}>{selectedColor}</strong>
          </div>
          <div className="variant-options" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.6rem'
          }}>
            {colors.map((col, idx) => {
              const price = getColorPrice(col.name);
              return (
                <button 
                  key={idx}
                  className={`color-btn-card ${selectedColor === col.name ? 'active' : ''}`} 
                  style={{ 
                    padding: '0.5rem 0.6rem',
                    border: selectedColor === col.name ? '2px solid #d70018' : '1px solid var(--border)',
                    borderRadius: '8px',
                    background: selectedColor === col.name ? '#fef2f2' : '#fff',
                    color: 'var(--dark)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textAlign: 'left',
                    width: '100%'
                  }} 
                  title={col.name}
                  onClick={() => onColorChange(col.name, col.img)}
                >
                  <img 
                    src={col.img} 
                    alt={col.name} 
                    style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, lineHeight: '1.2' }}>{col.name}</span>
                    {price > 0 && (
                      <span style={{ fontSize: '0.68rem', color: selectedColor === col.name ? '#d70018' : '#555', fontWeight: 500 }}>
                        {price.toLocaleString('vi-VN')}đ
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* QUANTITY */}
      <div className="variant-section" style={{ marginBottom: '1.5rem' }}>
        <div className="variant-label" style={{ marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Số lượng</div>
        <div className="qty-control" style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
          <button 
            className="qty-btn" 
            style={{ width: '36px', height: '36px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.1rem', opacity: qty <= 1 ? 0.5 : 1 }}
            onClick={() => onQtyChange('dec')}
            disabled={qty <= 1}
          >
            <i className="bi bi-dash"></i>
          </button>
          <input 
            type="text" 
            className="qty-value" 
            value={qty} 
            readOnly 
            style={{ width: '40px', height: '36px', textAlign: 'center', border: 'none', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', fontWeight: 600 }} 
          />
          <button 
            className="qty-btn" 
            style={{ width: '36px', height: '36px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.1rem', opacity: qty >= activeVariant.stock ? 0.5 : 1 }}
            onClick={() => onQtyChange('inc')}
            disabled={qty >= activeVariant.stock}
          >
            <i className="bi bi-plus"></i>
          </button>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="product-actions" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className="btn btn-primary btn-add-cart" 
          disabled={activeVariant.stock <= 0}
          style={{ 
            flex: 1, 
            padding: '0.9rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.5rem',
            opacity: activeVariant.stock <= 0 ? 0.5 : 1,
            cursor: activeVariant.stock <= 0 ? 'not-allowed' : 'pointer'
          }}
          onClick={() => {
            const variantDetails = [selectedColor, selectedStorage].filter(Boolean).join(' · ');
            addToCart({
              id: activeVariant.id || `mock-${activeVariant.sku}`,
              productId: product.rawProduct?.id || 'mock-prod-id',
              name: product.title,
              variant: variantDetails || 'Tiêu chuẩn',
              price: activeVariant.price,
              qty: qty,
              img: product.rawProduct?.thumbnail || 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80&auto=format&fit=crop',
              weight: product.rawProduct?.weight || 250,
              height: product.rawProduct?.height || 5,
              length: product.rawProduct?.length || 10,
              width: product.rawProduct?.width || 10,
              stock: activeVariant.stock,
            });
          }}
        >
          <i className="bi bi-bag-plus"></i> Thêm giỏ hàng
        </button>
        <button 
          className="btn btn-accent"
          disabled={activeVariant.stock <= 0}
          style={{ 
            flex: 1, 
            padding: '0.9rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.5rem',
            background: 'var(--accent)',
            borderColor: 'var(--accent)',
            color: '#fff',
            opacity: activeVariant.stock <= 0 ? 0.5 : 1,
            cursor: activeVariant.stock <= 0 ? 'not-allowed' : 'pointer',
            textAlign: 'center'
          }}
          onClick={() => {
            const variantDetails = [selectedColor, selectedStorage].filter(Boolean).join(' · ');
            const buyNowItem = {
              id: activeVariant.id || `mock-${activeVariant.sku}`,
              productId: product.rawProduct?.id || 'mock-prod-id',
              name: product.title,
              variant: variantDetails || 'Tiêu chuẩn',
              price: activeVariant.price,
              qty: qty,
              img: product.rawProduct?.thumbnail || 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80&auto=format&fit=crop',
              weight: product.rawProduct?.weight || 250,
              height: product.rawProduct?.height || 5,
              length: product.rawProduct?.length || 10,
              width: product.rawProduct?.width || 10,
              stock: activeVariant.stock,
            };
            navigate('/checkout', { state: { buyNowItem } });
          }}
        >
          <i className="bi bi-lightning-charge"></i> Mua ngay
        </button>
        <button 
          type="button"
          onClick={() => {
            const pId = product.rawProduct?.id;
            if (pId) {
              toggleWishlistProduct(pId, product.title);
            }
          }}
          className="btn-icon" 
          style={{ 
            width: '48px', 
            height: '48px', 
            border: '1.5px solid var(--border)', 
            borderRadius: 'var(--radius)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer', 
            background: 'white',
            color: wishlist.includes(product.rawProduct?.id) ? '#ef4444' : 'inherit'
          }}
          title={wishlist.includes(product.rawProduct?.id) ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
        >
          <i className={wishlist.includes(product.rawProduct?.id) ? "bi bi-heart-fill" : "bi bi-heart"}></i>
        </button>
      </div>

      {/* META */}
      <div className="product-meta" style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
        <div className="product-meta-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontSize: '0.9rem' }}>
          <strong>Thương hiệu</strong>
          <span>{product.rawProduct?.metadata?.brand || (product.title.toLowerCase().includes('samsung') ? 'Samsung' : product.title.toLowerCase().includes('iphone') ? 'Apple' : 'Chính hãng')}</span>
        </div>
        <div className="product-meta-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontSize: '0.9rem' }}>
          <strong>Mã sản phẩm (SKU)</strong>
          <span>{activeVariant.sku}</span>
        </div>
        <div className="product-meta-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontSize: '0.9rem' }}>
          <strong>Tình trạng hàng</strong>
          <span style={{ color: activeVariant.stock > 0 ? 'var(--success)' : 'var(--danger, #ef4444)', fontWeight: 600 }}>
            {activeVariant.stock > 0
              ? (activeVariant.stock < 999 ? `Còn hàng (${activeVariant.stock} chiếc)` : 'Còn hàng')
              : 'Hết hàng'}
          </span>
        </div>
        <div className="product-meta-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontSize: '0.9rem' }}>
          <strong>Giao hàng</strong>
          <span className="text-success"><i className="bi bi-truck"></i> GHN / GHTK – Giao tận nhà 1-3 ngày</span>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
