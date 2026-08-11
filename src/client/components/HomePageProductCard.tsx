import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ChevronRight } from 'lucide-react';
import { toggleCompareProduct } from '../utils/compare';
import { toggleWishlistProduct } from '../utils/wishlist';

const colorFallbacks: Record<string, { hex: string, img: string }> = {
  "Titan Tự Nhiên": { hex: "#8E8E8A", img: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-16-pro-titan-tu-nhien.png" },
  "Titan Sa Mạc": { hex: "#D1C0B0", img: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-16-pro-titan-sa-mac.png" },
  "Titan Đen": { hex: "#2C2C2C", img: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-16-pro-titan-den.png" },
  "Titan Trắng": { hex: "#F5F5F0", img: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-16-pro-titan-trang.png" },
  "Đen": { hex: "#0F172A", img: "" },
  "Trắng": { hex: "#FFFFFF", img: "" },
  "Cam": { hex: "#F97316", img: "" },
  "Tím": { hex: "#4F46E5", img: "" }
};

interface HomePageProductCardProps {
  p: any;
  compareList: string[];
  wishlist: string[];
}

export const HomePageProductCard = ({ p, compareList, wishlist }: HomePageProductCardProps) => {
  const colorOption = p.options?.find((o: any) => o.title === 'Màu sắc' || o.title === 'Color');
  const colorNames = colorOption?.values?.map((v: any) => typeof v === 'string' ? v : v.value) || [];
  
  // Clean up duplicate colors
  const uniqueColorNames = Array.from(new Set(colorNames)) as string[];
  
  const [activeColor, setActiveColor] = useState<string>(uniqueColorNames[0] || "");
  
  const activeVariant = p.variants?.find((v: any) => {
    if (!activeColor) return true;
    if (v.options && !Array.isArray(v.options)) {
      return (v.options["Màu sắc"] === activeColor || v.options["Color"] === activeColor);
    }
    if (Array.isArray(v.options)) {
      return v.options.some((o: any) => o.value === activeColor);
    }
    return false;
  }) || p.variants?.[0];

  const pPrice = activeVariant?.prices?.find((pr: any) => pr.currency_code === 'vnd')?.amount 
    || activeVariant?.prices?.[0]?.amount 
    || activeVariant?.price 
    || p.price 
    || 0;
  
  const displayPrice = typeof pPrice === 'number' && pPrice > 0 ? pPrice.toLocaleString('vi-VN') + 'đ' : 'Liên hệ';
  const oldPrice = activeVariant?.oldPrice;
  const displayOldPrice = oldPrice ? oldPrice.toLocaleString('vi-VN') + 'đ' : null;
  // Medusa v2: inventory_quantity = 0 có thể do Stock Location chưa link Sales Channel
  // Dùng manage_inventory để phán đoán: nếu manage_inventory = false thì luôn hiển thị còn hàng
  const rawStock = activeVariant?.inventory_quantity;
  const manageInventory = activeVariant?.manage_inventory;
  const stock = rawStock !== undefined && rawStock !== null ? rawStock : 0;
  const isInStock = !manageInventory || stock > 0;
  
  let imgUrl = activeVariant?.thumbnail || p.thumbnail || 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&q=80&auto=format&fit=crop';
  if (activeColor && colorFallbacks[activeColor]?.img) {
    imgUrl = colorFallbacks[activeColor].img;
  }
  
  const rating = Number(p.metadata?.rating || 0);
  const ratingCount = p.metadata?.review_count || 0;

  return (
    <article className="product-card">
      <div className="img-wrap">
        {oldPrice && <span className="badge badge--sale">Giảm giá</span>}
        <button 
          className="wishlist" 
          aria-label="Wishlist" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlistProduct(p.id, p.title);
          }}
          style={{
            opacity: wishlist.includes(p.id) ? 1 : undefined,
            color: wishlist.includes(p.id) ? 'var(--rose)' : undefined,
          }}
        >
          <Heart size={18} fill={wishlist.includes(p.id) ? 'var(--rose)' : 'none'} stroke={wishlist.includes(p.id) ? 'var(--rose)' : 'currentColor'} />
        </button>
        <img src={imgUrl} alt={p.title} style={{ objectFit: 'contain' }} />
      </div>
      <div className="stock">
        <span className="dot" style={{ background: isInStock ? 'var(--success)' : 'var(--rose)' }}></span>
        {isInStock ? (stock > 0 ? `Còn hàng · ${stock} sản phẩm` : 'Còn hàng') : 'Hết hàng'}
      </div>
      <Link to={`/product/${p.id}`} className="name" style={{ fontSize: '15px' }}>{p.title}</Link>
      <div className="price" style={{ marginBottom: uniqueColorNames.length > 0 ? '6px' : '8px' }}>
        <span className="now">{displayPrice}</span>
        {displayOldPrice && <span className="was">{displayOldPrice}</span>}
      </div>
      
      {uniqueColorNames.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
          {uniqueColorNames.map((colorName: string, idx: number) => {
            const fallback = colorFallbacks[colorName] || { hex: "#cccccc" };
            const isActive = activeColor === colorName;
            return (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveColor(colorName);
                }}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: fallback.hex,
                  border: isActive ? '2px solid var(--indigo, #4f46e5)' : '1px solid var(--border, #e2e8f0)',
                  boxShadow: isActive ? '0 0 0 2px rgba(79,70,229,0.2)' : 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
                title={colorName}
              />
            )
          })}
        </div>
      )}

      <div className="stars">
        <div style={{ display: 'flex', gap: '2px', color: '#fbbf24' }}>
          {[...Array(5)].map((_, idx) => (
            <Star key={idx} size={14} fill={idx < Math.round(rating) ? "#fbbf24" : "none"} />
          ))}
        </div>
        <span className="count">({ratingCount})</span>
      </div>
      <div 
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
            checked={compareList.includes(p.id)}
            onChange={() => toggleCompareProduct(p.id, p.title)}
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
      <Link to={`/product/${p.id}`} className="btn" style={{ marginTop: '0.65rem' }}>Đặt ngay <ChevronRight size={16} /></Link>
    </article>
  );
};
