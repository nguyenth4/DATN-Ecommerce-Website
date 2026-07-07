import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Minus, 
  X, 
  ChevronRight, 
  ArrowLeft,
  Trash2,
  Check,
  ShoppingBag
} from 'lucide-react';
import { useCart, useUpdateLineItem, useRemoveLineItem } from '../services/cart.service';
import toast from 'react-hot-toast';

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
  const { data: cart, isLoading } = useCart();
  const updateLineItem = useUpdateLineItem();
  const removeLineItem = useRemoveLineItem();
  
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  const items = cart?.items || [];

  useEffect(() => {
    if (items.length > 0 && selectedItems.length === 0) {
      setSelectedItems(items.map(i => i.id));
    }
  }, [items]);

  const handleUpdateQty = (lineId: string, currentQty: number, delta: number) => {
    const newQty = Math.max(1, currentQty + delta);
    if (newQty === currentQty) return;
    
    updateLineItem.mutate({ lineId, quantity: newQty }, {
      onError: () => toast.error("Không thể cập nhật số lượng")
    });
  };

  const handleRemoveItem = (lineId: string) => {
    removeLineItem.mutate(lineId, {
      onSuccess: () => toast.success("Đã xóa sản phẩm khỏi giỏ hàng"),
      onError: () => toast.error("Không thể xóa sản phẩm")
    });
  };
  
  const removeSelectedItems = () => {
    selectedItems.forEach(id => {
      removeLineItem.mutate(id);
    });
    setSelectedItems([]);
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(i => i.id));
    }
  };
  
  const toggleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(prev => prev.filter(i => i !== id));
    } else {
      setSelectedItems(prev => [...prev, id]);
    }
  };

  const selectedItemsData = items.filter(i => selectedItems.includes(i.id));
  const subtotal = selectedItemsData.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  
  const itemCount = selectedItemsData.reduce((sum, i) => sum + i.quantity, 0);

  if (isLoading) {
    return (
      <div className="cps-cart-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Đang tải giỏ hàng...</p>
      </div>
    );
  }

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
                Xóa sản phẩm đã chọn ({selectedItems.length})
              </div>
            </div>

            {items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#6b7280' }}>
                <ShoppingBag size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                <p>Giỏ hàng của bạn đang trống</p>
                <Link to="/products" className="cps-buy-btn" style={{ marginTop: '16px', padding: '10px 24px' }}>
                  Mua sắm ngay
                </Link>
              </div>
            ) : (
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
                    
                    <img src={item.thumbnail || 'https://via.placeholder.com/80'} alt={item.title} className="cps-product-img" />
                    
                    <div className="cps-product-info">
                      <div className="cps-product-name">{item.title} {item.variant.title !== 'Default Variant' ? `(${item.variant.title})` : ''}</div>
                      <button className="cps-trash-btn" onClick={() => handleRemoveItem(item.id)}>
                        <Trash2 size={16} />
                      </button>
                      
                      <div className="cps-price-row">
                        <span className="cps-price">{item.unit_price.toLocaleString('vi-VN')}đ</span>
                      </div>
                      
                      <div className="cps-qty-controls">
                        <button className="cps-qty-btn" onClick={() => handleUpdateQty(item.id, item.quantity, -1)}><Minus size={14} /></button>
                        <input type="text" className="cps-qty-input" value={item.quantity} readOnly />
                        <button className="cps-qty-btn" onClick={() => handleUpdateQty(item.id, item.quantity, 1)}><Plus size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        <div className="cps-bottom-bar">
          <div className="cps-bottom-content">
            <div className="cps-total-info">
              <div className="cps-total-label">
                Tạm tính: <span className="cps-total-price">{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="cps-save-text">
                Bao gồm thuế GTGT (nếu có)
              </div>
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