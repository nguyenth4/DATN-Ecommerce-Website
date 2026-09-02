import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';

import { toggleCompareProduct, isInCompareList } from '../utils/compare';
import { toggleWishlistProduct, isInWishlist } from '../utils/wishlist';

interface ProductCardProps {
  product: any; // Accept both raw Medusa shape and mapped shape
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Support both raw Medusa shape (title, thumbnail, variants) and mapped shape (name, image, price)
  const name = product.name || product.title || 'Sản phẩm';
  const image = product.image || product.thumbnail || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80';
  const category = product.category || product.categories?.[0]?.name || 'Sản phẩm';

  let price: number = 0;
  let originalPrice: number = 0;
  if (typeof product.price === 'number') {
    price = product.price;
    originalPrice = product.originalPrice || 0;
  } else if (product.variants?.length > 0) {
    const variant = product.variants[0];
    if (variant.calculated_price) {
      price = Number(variant.calculated_price.calculated_amount ?? 0);
      const origAmt = Number(variant.calculated_price.original_amount ?? price);
      if (origAmt > price) {
        originalPrice = origAmt;
      }
    } else {
      const saleP = variant.prices?.find((p: any) => p.currency_code === 'vnd' && p.price_list_id)
        || variant.prices?.find((p: any) => p.price_list_id);
      const baseP = variant.prices?.find((p: any) => p.currency_code === 'vnd' && !p.price_list_id)
        || variant.prices?.find((p: any) => !p.price_list_id)
        || variant.prices?.[0];

      if (saleP) {
        price = Number(saleP.amount);
        originalPrice = Number(baseP?.amount || 0);
      } else {
        price = Number(baseP?.amount || 0);
      }
    }
  }

  const rating = Number(product.metadata?.rating || 0);
  const ratingCount = product.metadata?.review_count || 0;
  const [isCompared, setIsCompared] = React.useState(isInCompareList(product.id));
  const [isWishlisted, setIsWishlisted] = React.useState(isInWishlist(product.id));

  React.useEffect(() => {
    const handleCompareUpdate = () => {
      setIsCompared(isInCompareList(product.id));
    };
    const handleWishlistUpdate = () => {
      setIsWishlisted(isInWishlist(product.id));
    };
    
    window.addEventListener('compare-updated', handleCompareUpdate);
    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    
    return () => {
      window.removeEventListener('compare-updated', handleCompareUpdate);
      window.removeEventListener('wishlist-updated', handleWishlistUpdate);
    };
  }, [product.id]);

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-card-img">
        <img 
          src={image} 
          alt={name} 
          loading="lazy"
          decoding="async"
          width={300}
          height={300}
        />
        {product.badge && <span className={`product-badge ${product.badge === 'Mới' ? 'badge-new' : 'badge-sale'}`}>{product.badge}</span>}
        <button 
          className="wishlist"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlistProduct(product.id, name);
          }}
          style={{
            opacity: isWishlisted ? 1 : undefined,
            color: isWishlisted ? 'var(--rose)' : undefined,
            border: 'none',
            cursor: 'pointer',
            zIndex: 2
          }}
          title={isWishlisted ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
        >
          <Heart size={16} fill={isWishlisted ? 'var(--rose)' : 'none'} stroke={isWishlisted ? 'var(--rose)' : 'currentColor'} />
        </button>
      </div>
      <div className="product-card-body">
        <div className="product-category">{category}</div>
        <div className="product-name">{name}</div>
        <div className="product-price-row">
          <span className="product-price">{price.toLocaleString('vi-VN')}đ</span>
          {(originalPrice > price || product.originalPrice) && (
            <span className="product-price-old">{(originalPrice || product.originalPrice).toLocaleString('vi-VN')}đ</span>
          )}
        </div>
        <div className="stars">
          {ratingCount > 0 ? (
            <>
              <div style={{ display: 'flex', gap: '2px', color: '#fbbf24' }}>
                {[...Array(5)].map((_, idx) => (
                  <Star key={idx} size={14} fill={idx < Math.round(rating) ? "#fbbf24" : "none"} />
                ))}
              </div>
              <span className="count">({ratingCount})</span>
            </>
          ) : (
            <span className="count" style={{ marginLeft: 0 }}>Chưa có đánh giá</span>
          )}
        </div>
        <div 
          className="product-card-compare-wrapper"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          style={{
            marginTop: '0.65rem',
            paddingTop: '0.65rem',
            borderTop: '1px dashed var(--rule, #eaeaea)',
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.8rem',
            color: 'var(--fg-mute, #64748b)'
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', margin: 0 }}>
            <input 
              type="checkbox" 
              checked={isCompared}
              onChange={() => toggleCompareProduct(product.id, name)}
              style={{ 
                cursor: 'pointer', 
                accentColor: 'var(--indigo, #4f46e5)',
                width: '14px',
                height: '14px'
              }}
            />
            <span style={{ fontWeight: 500 }}>So sánh</span>
          </label>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;

