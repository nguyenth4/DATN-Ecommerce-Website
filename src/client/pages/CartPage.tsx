import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Minus, 
  X, 
  ChevronRight, 
  ArrowLeft,
  Trash2,
  Check
} from 'lucide-react';

const INIT_ITEMS = [
  { id: 1, img: 'photo-1608043152269-423dbba4e7e1', name: 'Pin dự phòng Xiaomi 1C1A 20000mAh 1C 22.5W tích hợp cáp Type-C - Xám đậm', variant: '', price: 590000, oldPrice: 690000, qty: 1 },
  { id: 2, img: 'photo-1523275335684-37898b6baf30', name: 'Apple Watch Series 9 41mm Nhôm Midnight', variant: '', price: 680000, oldPrice: 850000, qty: 1 },
];

const PROMO_CODE = 'WELCOME20';
const PROMO_DISCOUNT = 56000;

const cartStyles = `
  .cps-cart-page {
    background-color: #f4f6f8;
    min-height: 100vh;
    font-family: 'Inter', sans-serif;
    padding-bottom: 120px;
    padding-top: 10px;
  }
  .cps-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 0 16px;
  }
  .cps-header {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 12px 0;
    margin-bottom: 16px;
  }
  .cps-back-btn {
    position: absolute;
    left: 0;
    color: #444;
    display: flex;
    align-items: center;
    cursor: pointer;
    text-decoration: none;
  }
  .cps-title {
    font-size: 18px;
    font-weight: 600;
    color: #000;
  }
  .cps-tabs {
    display: flex;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 16px;
  }
  .cps-tab-active {
    background-color: #2563eb;
    color: #fff;
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 14px;
    font-weight: 500;
  }
  .cps-box {
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.1);
    padding: 16px;
    margin-bottom: 16px;
  }
  .cps-select-all-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f3f4f6;
  }
  .cps-checkbox-wrap {
    display: flex;
    align-items: center;
    cursor: pointer;
    gap: 8px;
    font-size: 14px;
    color: #444;
  }
  .cps-checkbox {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 1px solid #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  .cps-checkbox.active {
    background-color: #2563eb;
    border-color: #2563eb;
    color: #fff;
  }
  .cps-delete-text {
    font-size: 13px;
    color: #6b7280;
    cursor: pointer;
  }
  .cps-delete-text:hover {
    color: #2563eb;
  }
  .cps-product-item {
    display: flex;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #f3f4f6;
    align-items: flex-start;
  }
  .cps-product-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  .cps-product-img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border: 1px solid #f3f4f6;
    border-radius: 8px;
  }
  .cps-product-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
  }
  .cps-product-name {
    font-size: 14px;
    font-weight: 500;
    color: #333;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 8px;
    padding-right: 24px;
  }
  .cps-trash-btn {
    position: absolute;
    top: 0;
    right: 0;
    color: #6b7280;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
  }
  .cps-trash-btn:hover {
    color: #2563eb;
  }
  .cps-price-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  .cps-price {
    color: #2563eb;
    font-weight: 600;
    font-size: 15px;
  }
  .cps-old-price {
    color: #9ca3af;
    font-size: 13px;
    text-decoration: line-through;
  }
  .cps-qty-controls {
    display: inline-flex;
    align-items: center;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    height: 28px;
    width: fit-content;
  }
  .cps-qty-btn {
    width: 28px;
    height: 100%;
    background: #f9fafb;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #4b5563;
  }
  .cps-qty-input {
    width: 32px;
    height: 100%;
    border: none;
    border-left: 1px solid #e5e7eb;
    border-right: 1px solid #e5e7eb;
    text-align: center;
    font-size: 13px;
    color: #111;
    background: #fff;
  }
  .cps-bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
    padding: 12px 16px;
    z-index: 50;
  }
  .cps-bottom-content {
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .cps-total-info {
    display: flex;
    flex-direction: column;
  }
  .cps-total-label {
    font-size: 14px;
    color: #333;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .cps-total-price {
    color: #2563eb;
    font-weight: 700;
    font-size: 16px;
  }
  .cps-save-text {
    font-size: 13px;
    color: #333;
  }
  .cps-save-amount {
    color: #2563eb;
  }
  .cps-buy-btn {
    background: #2563eb;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 12px 32px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
  }
  .cps-buy-btn:hover {
    background: #1d4ed8;
  }
  .cps-ghn-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #333;
  }
  .cps-ghn-select {
    width: 100%;
    padding: 10px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    margin-bottom: 8px;
    font-size: 14px;
    background: #fff;
    outline: none;
  }
  .cps-ghn-select:focus {
    border-color: #2563eb;
  }
  .cps-shipping-fee-text {
    font-size: 14px;
    color: #333;
    display: flex;
    justify-content: space-between;
    margin-top: 12px;
    border-top: 1px dashed #e5e7eb;
    padding-top: 12px;
  }
`;

const CartPage = () => {
  const [items, setItems] = useState(INIT_ITEMS);
  const [selectedItems, setSelectedItems] = useState<number[]>(INIT_ITEMS.map(i => i.id));
  
  // Shipping Fee State

  const updateQty = (id: number, delta: number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)));
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelectedItems((prev) => prev.filter((i) => i !== id));
  };
  
  const removeSelectedItems = () => {
    setItems((prev) => prev.filter((i) => !selectedItems.includes(i.id)));
    setSelectedItems([]);
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(i => i.id));
    }
  };
  
  const toggleSelectItem = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(prev => prev.filter(i => i !== id));
    } else {
      setSelectedItems(prev => [...prev, id]);
    }
  };

  const selectedItemsData = items.filter(i => selectedItems.includes(i.id));
  const subtotal = selectedItemsData.reduce((sum, i) => sum + i.price * i.qty, 0);
  const oldTotal = selectedItemsData.reduce((sum, i) => sum + i.oldPrice * i.qty, 0);
  const savedAmount = oldTotal - subtotal;
  const itemCount = selectedItemsData.reduce((sum, i) => sum + i.qty, 0);

  return (
    <>
      <style>{cartStyles}</style>
      <div className="cps-cart-page">
        <div className="cps-container">
          
          <div className="cps-header">
            <Link to="/" className="cps-back-btn">
              <ArrowLeft size={20} style={{ marginRight: '4px' }} />
            </Link>
            <h1 className="cps-title">Giỏ hàng của bạn</h1>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
             <div className="cps-tab-active">Giỏ hàng</div>
          </div>

          <div className="cps-box">
            <div className="cps-select-all-bar">
              <div className="cps-checkbox-wrap" onClick={toggleSelectAll}>
                <div className={`cps-checkbox ${selectedItems.length === items.length && items.length > 0 ? 'active' : ''}`}>
                  {selectedItems.length === items.length && items.length > 0 && <Check size={14} />}
                </div>
                <span>Chọn tất cả</span>
              </div>
              <div className="cps-delete-text" onClick={removeSelectedItems}>
                Xóa sản phẩm đã chọn
              </div>
            </div>

            {items.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#6b7280' }}>
                Giỏ hàng của bạn đang trống
              </div>
            )}

            <div className="cps-product-list">
              {items.map((item) => (
                <div className="cps-product-item" key={item.id}>
                  <div 
                    className="cps-checkbox-wrap" 
                    onClick={() => toggleSelectItem(item.id)}
                    style={{ marginTop: '30px' }}
                  >
                    <div className={`cps-checkbox ${selectedItems.includes(item.id) ? 'active' : ''}`}>
                      {selectedItems.includes(item.id) && <Check size={14} />}
                    </div>
                  </div>
                  
                  <img src={`https://images.unsplash.com/${item.img}?w=200&q=80&auto=format&fit=crop`} alt={item.name} className="cps-product-img" />
                  
                  <div className="cps-product-info">
                    <div className="cps-product-name">{item.name}</div>
                    <button className="cps-trash-btn" onClick={() => removeItem(item.id)}>
                      <Trash2 size={16} />
                    </button>
                    
                    <div className="cps-price-row">
                      <span className="cps-price">{item.price.toLocaleString('vi-VN')}đ</span>
                      <span className="cps-old-price">{item.oldPrice.toLocaleString('vi-VN')}đ</span>
                    </div>
                    
                    <div className="cps-qty-controls">
                      <button className="cps-qty-btn" onClick={() => updateQty(item.id, -1)}><Minus size={14} /></button>
                      <input type="text" className="cps-qty-input" value={item.qty} readOnly />
                      <button className="cps-qty-btn" onClick={() => updateQty(item.id, 1)}><Plus size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="cps-bottom-bar">
          <div className="cps-bottom-content">
            <div className="cps-total-info">
              <div className="cps-total-label">
                Tạm tính: <span className="cps-total-price">{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>
              {savedAmount > 0 && (
                <div className="cps-save-text">
                  Tiết kiệm <span className="cps-save-amount">{savedAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
            </div>
            <Link to="/checkout" className="cps-buy-btn">
              Mua ngay ({itemCount})
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage;