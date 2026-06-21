import React from 'react';

interface SidebarProps {
  categories: any[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  priceRange: { min: number; max: number };
  onPriceChange: (min: number, max: number) => void;
  onClearFilters: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  categories, 
  selectedCategory, 
  onSelectCategory,
  priceRange,
  onPriceChange,
  onClearFilters
}) => {
  return (
    <aside className="filter-sidebar">
      <div className="filter-title"><i className="bi bi-funnel-fill"></i> Bộ lọc</div>

      <div className="filter-section">
        <div className="filter-section-title">Danh mục</div>
        <label className="filter-check">
          <input 
            type="radio" 
            name="category"
            checked={selectedCategory === null} 
            onChange={() => onSelectCategory(null)}
          /> Tất cả
        </label>
        {categories?.map((cat) => (
          <label key={cat.id} className="filter-check">
            <input 
              type="radio" 
              name="category"
              checked={selectedCategory === cat.id}
              onChange={() => onSelectCategory(cat.id)}
            /> {cat.name}
          </label>
        ))}
      </div>

      <div className="filter-section">
        <div className="filter-section-title">Khoảng giá (đ)</div>
        <div className="price-range">
          <input 
            type="number" 
            className="price-input" 
            placeholder="Từ" 
            value={priceRange.min || ''} 
            onChange={(e) => onPriceChange(Number(e.target.value), priceRange.max)}
          />
          <span>—</span>
          <input 
            type="number" 
            className="price-input" 
            placeholder="Đến" 
            value={priceRange.max || ''}
            onChange={(e) => onPriceChange(priceRange.min, Number(e.target.value))}
          />
        </div>
      </div>

      <button 
        className="btn btn-outline btn-block" 
        style={{ color: 'var(--dark)', borderColor: 'var(--border)', marginTop: '1rem' }} 
        onClick={onClearFilters}
      >
        <i className="bi bi-x-circle"></i> Xóa bộ lọc
      </button>
    </aside>
  );
};

export default Sidebar;
