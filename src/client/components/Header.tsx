import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Heart, Search, ChevronRight } from 'lucide-react';

import { getCompareList } from '../utils/compare';
import { getWishlist } from '../utils/wishlist';

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [compareCount, setCompareCount] = useState(getCompareList().length);
  const [wishlistCount, setWishlistCount] = useState(getWishlist().length);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  useEffect(() => {
    const handleCompareUpdate = () => {
      setCompareCount(getCompareList().length);
    };
    const handleWishlistUpdate = () => {
      setWishlistCount(getWishlist().length);
    };
    
    window.addEventListener('compare-updated', handleCompareUpdate);
    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    
    return () => {
      window.removeEventListener('compare-updated', handleCompareUpdate);
      window.removeEventListener('wishlist-updated', handleWishlistUpdate);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchQ('');
    }
  };

  return (
    <>
      {/* Utility bar */}
      <div className="utility">
        <div className="container">
          <span className="promo">
            <span className="tag">GIẢM GIÁ</span>
            Miễn phí vận chuyển cho đơn hàng trên 1.200.000đ · 30 ngày đổi trả
          </span>
          <span className="links">
            <Link to="/order-tracking">Theo dõi đơn hàng</Link>
            <Link to="#">Trợ giúp</Link>
            <Link to="#">VN · VND</Link>
          </span>
        </div>
      </div>


      {/* Header */}
      <header className="site-header">
        <div className="container">
          <Link to="/" className="brand">
            <span className="brand-mark">S</span>
            Sprylo
          </Link>

          <form className="search" role="search" onSubmit={handleSearch}>
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
            <Link to="/account" className="icon-btn" aria-label="Tài khoản">
              <User size={20} />
            </Link>
            <Link to="/compare" className="icon-btn" aria-label="Compare" title="So sánh sản phẩm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 3h5v5M21 3L14 10M8 21H3v-5M3 21l7-7"/>
              </svg>
              {compareCount > 0 && <span className="count">{compareCount}</span>}
            </Link>
            <Link to="/wishlist" className="icon-btn" aria-label="Yêu thích" title="Sản phẩm yêu thích">
              <Heart size={20} />
              {wishlistCount > 0 && <span className="count">{wishlistCount}</span>}
            </Link>
            <Link to="/cart" className="icon-btn icon-btn--cart" aria-label="Giỏ hàng">
              <ShoppingCart size={20} />
              <span className="count">0</span>
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

      {/* Nav bar */}
      <nav className="nav-bar" aria-label="Primary">
        <div className="container">
          <Link to="/products" className="all-cats">
            <Menu size={16} />
            Tất cả danh mục
          </Link>
          <div className="main-nav">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Trang chủ</NavLink>
            <NavLink to="/products" className={({ isActive }) => isActive ? 'active' : ''}>Cửa hàng</NavLink>
            <NavLink to="/cart" className={({ isActive }) => isActive ? 'active' : ''}>Giỏ hàng</NavLink>
            <NavLink to="/checkout" className={({ isActive }) => isActive ? 'active' : ''}>Thanh toán</NavLink>
            <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>Liên hệ</NavLink>
          </div>
          <span className="nav-cta">GIẢM ĐẾN <strong>60%</strong> TẤT CẢ SẢN PHẨM</span>
        </div>
      </nav>


      {/* Mobile drawer */}
      <div className={`drawer${drawerOpen ? ' is-open' : ''}`} id="drawer" aria-hidden={!drawerOpen}>
        <div className="drawer-head">
          <Link to="/" className="brand" onClick={() => setDrawerOpen(false)}>
            <span className="brand-mark">S</span> Sprylo
          </Link>
          <button className="drawer-close" onClick={() => setDrawerOpen(false)}><X size={24} /></button>
        </div>
        <Link to="/" onClick={() => setDrawerOpen(false)}>Trang chủ</Link>
        <Link to="/products" onClick={() => setDrawerOpen(false)}>Cửa hàng</Link>
        <Link to="/cart" onClick={() => setDrawerOpen(false)}>Giỏ hàng</Link>
        <Link to="/contact" onClick={() => setDrawerOpen(false)}>Liên hệ</Link>
        <Link
          to="/cart"
          className="btn btn--indigo"
          style={{ marginTop: 'var(--s5)', justifyContent: 'center' }}
          onClick={() => setDrawerOpen(false)}
        >
          Xem giỏ hàng <ChevronRight size={18} style={{marginLeft: '8px'}}/>
        </Link>
      </div>


      {/* Overlay khi drawer mở */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 99 }}
        />
      )}
    </>
  );
};

export default Header;