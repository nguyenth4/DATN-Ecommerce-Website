import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

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
            <span className="tag">SALE</span>
            Free shipping on orders over $50 · 30-day returns
          </span>
          <span className="links">
            <Link to="/order-tracking">Track order</Link>
            <Link to="#">Help</Link>
            <Link to="#">EN · USD</Link>
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
              placeholder="Search for products, brands, categories…"
              aria-label="Search the store"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
            />
            <button type="submit" aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
              </svg>
            </button>
          </form>

          <div className="icon-row">
            <Link to="/account" className="icon-btn" aria-label="Account">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>
              </svg>
            </Link>
            <Link to="#" className="icon-btn" aria-label="Wishlist">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span className="count">3</span>
            </Link>
            <Link to="/cart" className="icon-btn icon-btn--cart" aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2l-2 5v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7l-2-5z"/>
                <path d="M4 7h16"/><path d="M16 11a4 4 0 0 1-8 0"/>
              </svg>
              <span className="count">0</span>
            </Link>
            <button
              className="nav-toggle"
              aria-label="Open menu"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
            >≡</button>
          </div>
        </div>
      </header>

      {/* Nav bar */}
      <nav className="nav-bar" aria-label="Primary">
        <div className="container">
          <Link to="/products" className="all-cats">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
            All Categories
          </Link>
          <div className="main-nav">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
            <NavLink to="/products" className={({ isActive }) => isActive ? 'active' : ''}>Shop</NavLink>
            <NavLink to="/cart" className={({ isActive }) => isActive ? 'active' : ''}>Cart</NavLink>
            <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>Contact</NavLink>
          </div>
          <span className="nav-cta">UP TO <strong>60% OFF</strong> ALL ITEMS</span>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`drawer${drawerOpen ? ' is-open' : ''}`} id="drawer" aria-hidden={!drawerOpen}>
        <div className="drawer-head">
          <Link to="/" className="brand" onClick={() => setDrawerOpen(false)}>
            <span className="brand-mark">S</span> Sprylo
          </Link>
          <button className="drawer-close" onClick={() => setDrawerOpen(false)}>Close ✕</button>
        </div>
        <Link to="/" onClick={() => setDrawerOpen(false)}>Home</Link>
        <Link to="/products" onClick={() => setDrawerOpen(false)}>Shop</Link>
        <Link to="/cart" onClick={() => setDrawerOpen(false)}>Cart</Link>
        <Link to="/contact" onClick={() => setDrawerOpen(false)}>Contact</Link>
        <Link
          to="/cart"
          className="btn btn--indigo"
          style={{ marginTop: 'var(--s5)', justifyContent: 'center' }}
          onClick={() => setDrawerOpen(false)}
        >
          View cart →
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