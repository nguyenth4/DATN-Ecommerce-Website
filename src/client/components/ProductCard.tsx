import React from 'react';
import { Link } from 'react-router-dom';

import { toggleCompareProduct, isInCompareList } from '../utils/compare';

interface ProductCardProps {
  product: any; // Accept both raw Medusa shape and mapped shape
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Support both raw Medusa shape (title, thumbnail, variants) and mapped shape (name, image, price)
  const name = product.name || product.title || 'Sản phẩm';
  const image = product.image || product.thumbnail || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80';
  const category = product.category || product.categories?.[0]?.name || 'Sản phẩm';

  // Extract price: try mapped price first, then dig into Medusa variants
  let price: number = 0;
  if (typeof product.price === 'number') {
    price = product.price;
  } else if (product.variants?.length > 0) {
    const variant = product.variants[0];
    price = variant.prices?.find((p: any) => p.currency_code === 'vnd')?.amount
         || variant.prices?.[0]?.amount
         || 0;
  }

  const [isCompared, setIsCompared] = React.useState(isInCompareList(product.id));

  React.useEffect(() => {
    const handleUpdate = () => {
      setIsCompared(isInCompareList(product.id));
    };
    window.addEventListener('compare-updated', handleUpdate);
    return () => {
      window.removeEventListener('compare-updated', handleUpdate);
    };
  }, [product.id]);

  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-card-img">
        <img 
          src={image} 
          alt={name} 
        />
        {product.badge && <span className={`product-badge ${product.badge === 'Mới' ? 'badge-new' : 'badge-sale'}`}>{product.badge}</span>}
        <div className="product-card-actions">
          <button 
            className="product-card-btn-add btn-add-cart" 
            title="Thêm vào giỏ"
            onClick={(e) => {
              e.preventDefault();
              alert('Đã thêm vào giỏ hàng!');
            }}
          >
            <i className="bi bi-plus"></i>
          </button>
        </div>
      </div>
      <div className="product-card-body">
        <div className="product-category">{category}</div>
        <div className="product-name">{name}</div>
        <div className="product-price-row">
          <span className="product-price">{price.toLocaleString('vi-VN')}đ</span>
          {product.originalPrice && <span className="product-price-old">{product.originalPrice.toLocaleString('vi-VN')}đ</span>}
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

