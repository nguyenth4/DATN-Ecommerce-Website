import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ChevronRight } from 'lucide-react';
import { toggleCompareProduct } from '../utils/compare';
import { toggleWishlistProduct } from '../utils/wishlist';

const colorFallbacks: Record<string, { hex: string, img?: string }> = {
  // ── iPhone Titan series ───────────────────────────────────────────────────
  "Titan Tự Nhiên":    { hex: "#9A8F85" },
  "Titan Sa Mạc":      { hex: "#C8B8A2" },
  "Titan Đen":         { hex: "#2C2C2C" },
  "Titan Trắng":       { hex: "#F0EDE8" },
  "Titan Xanh":        { hex: "#4A6FA5" },

  // ── Samsung Titanium series ───────────────────────────────────────────────
  "Titanium Black":    { hex: "#2C2C2E" },
  "Titanium Gray":     { hex: "#8E8E93" },
  "Titanium Silver":   { hex: "#C8C7C2" },
  "Titanium Blue":     { hex: "#3A5078" },
  "Titanium Yellow":   { hex: "#D4B84A" },
  "Titanium Violet":   { hex: "#6B4FA0" },
  "Titanium Jade":     { hex: "#4A7C6A" },
  "Titanium SkyBlue":  { hex: "#6BA4C8" },
  "Phantom Black":     { hex: "#1A1A1A" },
  "Phantom White":     { hex: "#F5F5F5" },
  "Phantom Silver":    { hex: "#C0C0C0" },
  "Phantom Violet":    { hex: "#7B5FA0" },
  "Cream":             { hex: "#F5ECD7" },
  "Lavender":          { hex: "#C9B8D8" },
  "Graphite":          { hex: "#4A4A4A" },
  "Bora Purple":       { hex: "#7B5FA0" },
  "Sky Blue":          { hex: "#87CEEB" },
  "Lime":              { hex: "#A8D55E" },
  "Navy":              { hex: "#1B2A5E" },

  // ── Tiếng Việt phổ biến ───────────────────────────────────────────────────
  "Đen":               { hex: "#1C1C1E" },
  "Trắng":             { hex: "#F2F2F7" },
  "Bạc":               { hex: "#C0C0C0" },
  "Xám":               { hex: "#8E8E93" },
  "Xám Titan":         { hex: "#8E8E93" },
  "Xanh":              { hex: "#3A7BD5" },
  "Xanh Dương":        { hex: "#2563EB" },
  "Xanh Lá":           { hex: "#16A34A" },
  "Xanh Lam":          { hex: "#0EA5E9" },
  "Xanh Ngọc":         { hex: "#06B6D4" },
  "Xanh Navy":         { hex: "#1E3A8A" },
  "Xanh Cobalt":       { hex: "#2545A8" },
  "Xanh Olive":        { hex: "#6B7C35" },
  "Xanh Mint":         { hex: "#4ADEAE" },
  "Đỏ":                { hex: "#DC2626" },
  "Đỏ Bordeaux":       { hex: "#7F1D1D" },
  "Đỏ Coral":          { hex: "#F87171" },
  "Vàng":              { hex: "#D4A017" },
  "Vàng Đồng":         { hex: "#B87333" },
  "Vàng Gold":         { hex: "#F5C518" },
  "Tím":               { hex: "#7C3AED" },
  "Tím Nhạt":          { hex: "#A78BFA" },
  "Hồng":              { hex: "#EC4899" },
  "Hồng Phấn":         { hex: "#F9A8D4" },
  "Cam":               { hex: "#F97316" },
  "Nâu":               { hex: "#92400E" },
  "Kem":               { hex: "#F5ECD7" },
  "Be":                { hex: "#E8DCC8" },

  // ── English common ────────────────────────────────────────────────────────
  "Black":             { hex: "#1C1C1E" },
  "White":             { hex: "#F2F2F7" },
  "Silver":            { hex: "#C0C0C0" },
  "Gray":              { hex: "#8E8E93" },
  "Grey":              { hex: "#8E8E93" },
  "Blue":              { hex: "#2563EB" },
  "Green":             { hex: "#16A34A" },
  "Red":               { hex: "#DC2626" },
  "Gold":              { hex: "#D4A017" },
  "Yellow":            { hex: "#EAB308" },
  "Purple":            { hex: "#7C3AED" },
  "Pink":              { hex: "#EC4899" },
  "Orange":            { hex: "#F97316" },
  "Brown":             { hex: "#92400E" },
  "Cyan":              { hex: "#06B6D4" },
  "Teal":              { hex: "#0D9488" },
  "Indigo":            { hex: "#4F46E5" },
  "Rose":              { hex: "#E11D48" },
  "Coral":             { hex: "#F87171" },
  "Mint":              { hex: "#4ADEAE" },
  "Olive":             { hex: "#6B7C35" },
};

/** Tự suy màu từ tên khi không có trong map */
const inferColorHex = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes('đen') || n.includes('black'))   return '#2C2C2C';
  if (n.includes('trắng') || n.includes('white'))  return '#F0EDE8';
  if (n.includes('bạc') || n.includes('silver') || n.includes('platinum')) return '#C0C0C0';
  if (n.includes('xám') || n.includes('gray') || n.includes('grey') || n.includes('graphite')) return '#8E8E93';
  if (n.includes('titan'))   return '#9A8F85';
  if (n.includes('vàng') || n.includes('gold') || n.includes('yellow'))    return '#D4A017';
  if (n.includes('tím') || n.includes('purple') || n.includes('violet') || n.includes('lavender')) return '#7C3AED';
  if (n.includes('hồng') || n.includes('pink') || n.includes('rose'))      return '#EC4899';
  if (n.includes('cam') || n.includes('orange'))  return '#F97316';
  if (n.includes('đỏ') || n.includes('red') || n.includes('coral'))        return '#DC2626';
  if (n.includes('xanh lá') || n.includes('green') || n.includes('lime') || n.includes('jade') || n.includes('olive')) return '#16A34A';
  if (n.includes('xanh') || n.includes('blue') || n.includes('navy') || n.includes('cobalt') || n.includes('sky')) return '#2563EB';
  if (n.includes('nâu') || n.includes('brown'))   return '#92400E';
  if (n.includes('kem') || n.includes('be') || n.includes('cream') || n.includes('beige')) return '#F5ECD7';
  return '#94A3B8'; // slate mặc định
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

  const pricesInfo = (() => {
    if (activeVariant?.calculated_price) {
      const calcAmt = Number(activeVariant.calculated_price.calculated_amount ?? 0);
      const origAmt = Number(activeVariant.calculated_price.original_amount ?? calcAmt);
      return {
        price: calcAmt,
        oldPrice: origAmt > calcAmt ? origAmt : 0
      };
    }
    if (!activeVariant?.prices || activeVariant.prices.length === 0) {
      return { price: activeVariant?.price || p.price || 0, oldPrice: activeVariant?.oldPrice || 0 };
    }
    const saleP = activeVariant.prices.find((pr: any) => pr.currency_code === 'vnd' && pr.price_list_id)
      || activeVariant.prices.find((pr: any) => pr.price_list_id);
    const baseP = activeVariant.prices.find((pr: any) => pr.currency_code === 'vnd' && !pr.price_list_id)
      || activeVariant.prices.find((pr: any) => !pr.price_list_id)
      || activeVariant.prices[0];

    if (saleP) {
      return {
        price: Number(saleP.amount),
        oldPrice: Number(baseP?.amount || 0)
      };
    }
    return {
      price: Number(baseP?.amount || 0),
      oldPrice: Number(activeVariant?.oldPrice || 0)
    };
  })();

  const pPrice = pricesInfo.price;
  const displayPrice = typeof pPrice === 'number' && pPrice > 0 ? pPrice.toLocaleString('vi-VN') + 'đ' : 'Liên hệ';
  const oldPrice = pricesInfo.oldPrice;
  const displayOldPrice = oldPrice && oldPrice > pPrice ? oldPrice.toLocaleString('vi-VN') + 'đ' : null;
  // Logic tồn kho:
  // - manage_inventory = false → không quản lý tồn kho → luôn còn hàng
  // - inventory_quantity = null/undefined → fallback tổng tất cả variants để lấy số hiển thị
  // - inventory_quantity = 0 với manage_inventory = true → thực sự hết hàng
  const rawStock = activeVariant?.inventory_quantity;
  const manageInventory = activeVariant?.manage_inventory;
  const stockConfigured = rawStock !== undefined && rawStock !== null;

  // Nếu activeVariant không có inventory_quantity, tính tổng tất cả variants
  const allVariants: any[] = p.variants || [];
  const totalStock = allVariants.reduce((acc: number, v: any) => {
    if (v.manage_inventory === false) return acc;
    const vq = v.inventory_quantity;
    return acc + (vq !== null && vq !== undefined ? Number(vq) : 0);
  }, 0);
  const hasAnyConfigured = allVariants.some(
    (v: any) => v.inventory_quantity !== null && v.inventory_quantity !== undefined
  );

  // Số hiển thị: dùng activeVariant nếu có, ngược lại dùng tổng tất cả variants
  const displayStock = stockConfigured ? Number(rawStock) : (hasAnyConfigured ? totalStock : 0);
  const stock = displayStock;
  const isInStock = manageInventory === false   // không quản lý tồn kho
    || (!stockConfigured && !hasAnyConfigured)  // chưa cấu hình gì → hiện còn hàng
    || stock > 0;                               // có hàng thực tế
  
  let imgUrl = activeVariant?.thumbnail || p.thumbnail || 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&q=80&auto=format&fit=crop';
  if (activeColor && colorFallbacks[activeColor]?.img) {
    imgUrl = colorFallbacks[activeColor].img;
  }
  
  const rating = Number(p.metadata?.rating || 0);
  const ratingCount = p.metadata?.review_count || 0;

  return (
    <article className="product-card">
      <div className="img-wrap">
        {oldPrice > pPrice && <span className="badge badge--sale">Giảm giá</span>}
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
        <img
          src={imgUrl}
          alt={p.title}
          style={{ objectFit: 'contain' }}
          loading="lazy"
          decoding="async"
          width={300}
          height={300}
        />
      </div>
      <div className="stock">
        <span className="dot" style={{ background: isInStock ? 'var(--success)' : 'var(--rose)' }}></span>
        {isInStock ? (hasAnyConfigured && stock > 0 ? `Còn hàng · ${stock} sản phẩm` : 'Còn hàng') : 'Hết hàng'}
      </div>
      <Link to={`/product/${p.id}`} className="name" style={{ fontSize: '15px' }}>{p.title}</Link>
      <div className="price" style={{ marginBottom: uniqueColorNames.length > 0 ? '6px' : '8px' }}>
        <span className="now">{displayPrice}</span>
        {displayOldPrice && <span className="was">{displayOldPrice}</span>}
      </div>
      
      {uniqueColorNames.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
          {uniqueColorNames.map((colorName: string, idx: number) => {
            const hex = colorFallbacks[colorName]?.hex ?? inferColorHex(colorName);
            const isActive = activeColor === colorName;
            // Màu trắng/kem cần viền đậm hơn để thấy
            const isLight = hex.toUpperCase() === '#FFFFFF' || hex.toUpperCase() === '#F2F2F7' || hex.toUpperCase() === '#F0EDE8' || hex.toUpperCase() === '#F5ECD7';
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
                  background: hex,
                  border: isActive
                    ? '2px solid var(--indigo, #4f46e5)'
                    : `1px solid ${isLight ? '#c0c0c0' : 'var(--border, #e2e8f0)'}`,
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
