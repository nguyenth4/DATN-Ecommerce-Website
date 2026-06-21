import React from 'react';
import { Link } from 'react-router-dom';

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

  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-card-img">
        <img 
          src={image} 
          alt={name} 
        />
        {product.badge && <span className={`product-badge ${product.badge === 'Mới' ? 'badge-new' : 'badge-sale'}`}>{product.badge}</span>}
        <button 
          className="product-card-btn-add btn-add-cart" 
          onClick={(e) => {
            e.preventDefault();
            alert('Đã thêm vào giỏ hàng!');
          }}
        >
          <i className="bi bi-plus"></i>
        </button>
      </div>
      <div className="product-card-body">
        <div className="product-category">{category}</div>
        <div className="product-name">{name}</div>
        <div className="product-price-row">
          <span className="product-price">{price.toLocaleString('vi-VN')}đ</span>
          {product.originalPrice && <span className="product-price-old">{product.originalPrice.toLocaleString('vi-VN')}đ</span>}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;

