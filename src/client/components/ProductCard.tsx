import React from 'react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    image: string;
    price: number;
    category?: string;
    originalPrice?: number;
    badge?: string;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-card-img">
        <img 
          src={product.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80"} 
          alt={product.name} 
        />
        {product.badge && <span className={`product-badge ${product.badge === 'Mới' ? 'badge-new' : 'badge-sale'}`}>{product.badge}</span>}
        <button 
          className="product-card-btn-add btn-add-cart" 
          onClick={(e) => {
            e.preventDefault();
            // TODO: Add to cart logic
            alert('Đã thêm vào giỏ hàng!');
          }}
        >
          <i className="bi bi-plus"></i>
        </button>
      </div>
      <div className="product-card-body">
        <div className="product-category">{product.category || 'Danh mục'}</div>
        <div className="product-name">{product.name}</div>
        <div className="product-price-row">
          <span className="product-price">{product.price.toLocaleString()}đ</span>
          {product.originalPrice && <span className="product-price-old">{product.originalPrice.toLocaleString()}đ</span>}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
