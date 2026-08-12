import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Heart, Search, ChevronRight, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';

import { getCompareList } from '../utils/compare';
import { getWishlist } from '../utils/wishlist';
import { useCart, useUpdateLineItem, useRemoveLineItem } from '../services/cart.service';
import toast from 'react-hot-toast';

const headerStyles = `
  .cart-drawer {
    position: fixed;
    top: 0;
    right: -400px;
    width: 100%;
    max-width: 400px;
    height: 100vh;
    background: #fff;
    box-shadow: -5px 0 25px rgb(0 0 0 / 15%);
    z-index: 1000;
    transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    flex-direction: column;
  }
  .cart-drawer.is-open {
    right: 0;
  }
  .cart-drawer-header {
    padding: 16px 20px;
    border-bottom: 1px solid #f3f4f6;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .cart-drawer-title {
    font-size: 18px;
    font-weight: 700;
    color: #111;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .cart-drawer-close {
    background: none;
    border: none;
    cursor: pointer;
    color: #6b7280;
    padding: 4px;
    border-radius: 50%;
    transition: background 0.2s;
  }
  .cart-drawer-close:hover {
    background: #f3f4f6;
    color: #111;
  }
  .cart-drawer-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }
  .cart-drawer-item {
    display: flex;
    gap: 12px;
    padding-bottom: 16px;
    margin-bottom: 16px;
    border-bottom: 1px solid #f3f4f6;
    align-items: flex-start;
  }
  .cart-drawer-img {
    width: 64px;
    height: 64px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid #f3f4f6;
  }
  .cart-drawer-info {
    flex: 1;
    min-width: 0;
  }
  .cart-drawer-name {
    font-size: 13px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .cart-drawer-variant {
    font-size: 11px;
    color: #6b7280;
    margin-bottom: 6px;
  }
  .cart-drawer-price {
    font-size: 13px;
    font-weight: 700;
    color: #2563eb;
  }
  .cart-drawer-item-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
  }
  .cart-drawer-qty {
    display: inline-flex;
    align-items: center;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    height: 24px;
  }
  .cart-drawer-qty-btn {
    width: 24px;
    height: 100%;
    background: #f9fafb;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #4b5563;
  }
  .cart-drawer-qty-val {
    width: 28px;
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    color: #111;
  }
  .cart-drawer-item-delete {
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    padding: 2px;
  }
  .cart-drawer-item-delete:hover {
    color: #ef4444;
  }
  .cart-drawer-footer {
    padding: 20px;
    border-top: 1px solid #f3f4f6;
    background: #fafafa;
  }
  .cart-drawer-subtotal {
    display: flex;
    justify-content: space-between;
    font-size: 15px;
    font-weight: 700;
    color: #111;
    margin-bottom: 16px;
  }
  .cart-drawer-subtotal-price {
    color: #2563eb;
  }
  .cart-drawer-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .cart-drawer-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    font-size: 13px;
    font-weight: 600;
    border-radius: 6px;
    text-decoration: none;
    text-align: center;
    cursor: pointer;
  }
  .cart-drawer-btn--secondary {
    background: #fff;
    border: 1px solid #e5e7eb;
    color: #374151;
  }
  .cart-drawer-btn--secondary:hover {
    background: #f9fafb;
  }
  .cart-drawer-btn--primary {
    background: #2563eb;
    border: 1px solid #2563eb;
    color: #fff;
  }
  .cart-drawer-btn--primary:hover {
    background: #1d4ed8;
  }
  .nav-dropdown-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    height: 100%;
  }
  .nav-dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    min-width: 170px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
    padding: 8px 0;
    opacity: 0;
    visibility: hidden;
    transform: translateY(10px);
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 100;
  }
  .nav-dropdown-wrapper:hover .nav-dropdown-menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
  .nav-dropdown-menu a {
    display: block !important;
    padding: 8px 16px !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    color: #334155 !important;
    transition: all 0.15s ease !important;
  }
  .nav-dropdown-menu a:hover {
    background: #eef2ff !important;
    color: #4f46e5 !important;
    padding-left: 20px !important;
  }
`;

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [compareCount, setCompareCount] = useState(getCompareList().length);
  const [wishlistCount, setWishlistCount] = useState(getWishlist().length);
  const [customerInfo, setCustomerInfo] = useState<any>(null);

  const { data: cart } = useCart();
  const updateLineItem = useUpdateLineItem();
  const removeLineItem = useRemoveLineItem();
  const navigate = useNavigate();

  const cartItems = cart?.items || [];
  const cartCount = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum: number, item: any) => sum + item.unit_price * item.quantity, 0);

  useEffect(() => {
    document.body.style.overflow = (drawerOpen || cartDrawerOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen, cartDrawerOpen]);

  useEffect(() => {
    const handleCompareUpdate = () => {
      setCompareCount(getCompareList().length);
    };
    const handleWishlistUpdate = () => {
      setWishlistCount(getWishlist().length);
    };
    const handleAuthChange = () => {
      const info = localStorage.getItem('customer_info');
      setCustomerInfo(info ? JSON.parse(info) : null);
    };
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'customer_info' || e.key === 'customer_token') {
        handleAuthChange();
      }
    };

    handleAuthChange();

    window.addEventListener('compare-updated', handleCompareUpdate);
    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    window.addEventListener('customer-auth-change', handleAuthChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('compare-updated', handleCompareUpdate);
      window.removeEventListener('wishlist-updated', handleWishlistUpdate);
      window.removeEventListener('customer-auth-change', handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchQ('');
    }
  };

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

  return (
    <>
      <style>{headerStyles}</style>

      {/* Header Wrapper to keep both rows sticky together */}
      <div className="header-wrapper" style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--paper)', borderBottom: '1px solid var(--rule)' }}>
        {/* Header Row */}
        <header className="site-header" style={{ borderBottom: 'none' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link to="/" className="brand" style={{ flexShrink: 0 }}>
              <span className="brand-mark">S</span>
              Sprylo
            </Link>

            <nav className="main-nav" aria-label="Primary" style={{ display: 'flex', gap: '1.5rem', flex: 1 }}>
              <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Trang chủ</NavLink>
              <NavLink to="/products" className={({ isActive }) => isActive ? 'active' : ''}>Điện thoại</NavLink>
              <NavLink to="/cart" className={({ isActive }) => isActive ? 'active' : ''}>Giỏ hàng</NavLink>
              <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>Liên hệ</NavLink>
            </nav>

            <form className="search" role="search" onSubmit={handleSearch} style={{ flex: 1, maxWidth: '300px' }}>
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm, thương hiệu, danh mục..."
                aria-label="Tìm kiếm trong cửa hàng"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
              />
              <button type="submit" aria-label="Tìm kiếm">
                <Search size={18} />
              </button>
            </form>

            <div className="icon-row">
              {customerInfo ? (
                <Link to="/account" className="icon-btn" aria-label="Tài khoản" title={`Chào, ${customerInfo.first_name || 'bạn'}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {customerInfo.avatar_url ? (
                    <img
                      src={customerInfo.avatar_url}
                      alt="Avatar"
                      style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--rule)' }}
                    />
                  ) : (
                    <User size={20} />
                  )}
                  <span className="text-xs font-semibold" style={{ fontSize: '0.8rem', fontWeight: 600, maxWidth: '70px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {customerInfo.first_name}
                  </span>
                </Link>
              ) : (
                <Link to="/login" className="icon-btn" aria-label="Đăng nhập" title="Đăng nhập">
                  <User size={20} />
                </Link>
              )}
              <Link to="/compare" className="icon-btn" aria-label="Compare" title="So sánh sản phẩm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 3h5v5M21 3L14 10M8 21H3v-5M3 21l7-7" />
                </svg>
                {compareCount > 0 && <span className="count">{compareCount}</span>}
              </Link>
              <Link to="/wishlist" className="icon-btn" aria-label="Yêu thích" title="Sản phẩm yêu thích">
                <Heart size={20} />
                {wishlistCount > 0 && <span className="count">{wishlistCount}</span>}
              </Link>
              <Link
                to="/cart"
                className="icon-btn icon-btn--cart"
                aria-label="Giỏ hàng"
                title="Giỏ hàng"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && <span className="count">{cartCount}</span>}
              </Link>
              <button
                className="nav-toggle"
                aria-label="Mở menu"
                aria-expanded={drawerOpen}
                onClick={() => setDrawerOpen(true)}
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Cart Drawer */}
      <div className={`cart-drawer ${cartDrawerOpen ? 'is-open' : ''}`}>
        <div className="cart-drawer-header">
          <div className="cart-drawer-title">
            <ShoppingBag size={20} /> Giỏ hàng ({cartCount})
          </div>
          <button className="cart-drawer-close" onClick={() => setCartDrawerOpen(false)}><X size={20} /></button>
        </div>

        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
              <ShoppingCart size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p style={{ fontSize: '14px' }}>Giỏ hàng của bạn đang trống</p>
              <button
                className="cart-drawer-btn cart-drawer-btn--primary"
                style={{ margin: '16px auto 0', width: '140px' }}
                onClick={() => {
                  setCartDrawerOpen(false);
                  navigate('/products');
                }}
              >
                Mua sắm ngay
              </button>
            </div>
          ) : (
            cartItems.map((item: any) => (
              <div className="cart-drawer-item" key={item.id}>
                <img src={item.thumbnail || 'https://via.placeholder.com/64'} alt={item.title} className="cart-drawer-img" />
                <div className="cart-drawer-info">
                  <div className="cart-drawer-name" title={item.title}>
                    {item.title}
                  </div>
                  {item.variant.title !== 'Default Variant' && (
                    <div className="cart-drawer-variant">{item.variant.title}</div>
                  )}
                  <div className="cart-drawer-price">{item.unit_price.toLocaleString('vi-VN')}đ</div>
                  <div className="cart-drawer-item-actions">
                    <div className="cart-drawer-qty">
                      <button className="cart-drawer-qty-btn" onClick={() => handleUpdateQty(item.id, item.quantity, -1)}><Minus size={10} /></button>
                      <span className="cart-drawer-qty-val">{item.quantity}</span>
                      <button className="cart-drawer-qty-btn" onClick={() => handleUpdateQty(item.id, item.quantity, 1)}><Plus size={10} /></button>
                    </div>
                    <button className="cart-drawer-item-delete" onClick={() => handleRemoveItem(item.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-drawer-subtotal">
              <span>Tổng phụ:</span>
              <span className="cart-drawer-subtotal-price">{cartSubtotal.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="cart-drawer-buttons">
              <Link
                to="/cart"
                className="cart-drawer-btn cart-drawer-btn--secondary"
                onClick={() => setCartDrawerOpen(false)}
              >
                Xem giỏ hàng
              </Link>
              <Link
                to="/checkout"
                className="cart-drawer-btn cart-drawer-btn--primary"
                onClick={() => setCartDrawerOpen(false)}
              >
                Thanh toán
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu drawer */}
      <div className={`drawer${drawerOpen ? ' is-open' : ''}`} id="drawer" aria-hidden={!drawerOpen}>
        <div className="drawer-head">
          <Link to="/" className="brand" onClick={() => setDrawerOpen(false)}>
            <span className="brand-mark">S</span> Sprylo
          </Link>
          <button className="drawer-close" onClick={() => setDrawerOpen(false)}><X size={24} /></button>
        </div>
        <Link to="/" onClick={() => setDrawerOpen(false)}>Trang chủ</Link>
        <Link to="/products" onClick={() => setDrawerOpen(false)}>Điện thoại</Link>
        <Link to="/cart" onClick={() => setDrawerOpen(false)}>Giỏ hàng</Link>
        <Link to="/contact" onClick={() => setDrawerOpen(false)}>Liên hệ</Link>
        <Link
          to="/cart"
          className="btn btn--indigo"
          style={{ marginTop: 'var(--s5)', justifyContent: 'center' }}
          onClick={() => setDrawerOpen(false)}
        >
          Xem giỏ hàng <ChevronRight size={18} style={{ marginLeft: '8px' }} />
        </Link>
      </div>

      {/* Overlays */}
      {(drawerOpen || cartDrawerOpen) && (
        <div
          onClick={() => {
            setDrawerOpen(false);
            setCartDrawerOpen(false);
          }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 99 }}
        />
      )}
    </>
  );
};

export default Header;