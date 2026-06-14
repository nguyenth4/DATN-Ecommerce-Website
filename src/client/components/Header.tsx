import { Link } from 'react-router-dom';
import { ShoppingCart, User, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../shared/components/ThemeProvider';
import './Header.css';

const Header = () => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo">
          TechStore
        </Link>
        <nav className="nav-links">
          <Link to="/products">Điện thoại</Link>
          <Link to="/accessories">Phụ kiện</Link>
          <Link to="/news">Tin tức</Link>
        </nav>
        <div className="header-actions">
          <button 
            className="theme-toggle"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Link to="/cart" className="icon-btn">
            <ShoppingCart size={20} />
          </Link>
          <Link to="/account" className="icon-btn">
            <User size={20} />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
