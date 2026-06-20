import { User, Bell, Sun, Moon, Search } from 'lucide-react';
import { useTheme } from '../../shared/components/ThemeProvider';
import { useLocation } from 'react-router-dom';
import './Topbar.css';

const Topbar = () => {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  
  // Create a mapping of path to title
  const getPageTitle = (path: string) => {
    if (path === '/admin') return 'Dashboard';
    if (path.includes('/products')) return 'Quản lý Sản phẩm';
    if (path.includes('/categories')) return 'Quản lý Danh mục';
    if (path.includes('/orders')) return 'Quản lý Đơn hàng';
    if (path.includes('/customers')) return 'Khách hàng';
    return 'Admin Panel';
  };

  return (
    <header className="admin-topbar">
      <div className="topbar-title">{getPageTitle(location.pathname)}</div>
      <div className="topbar-actions">
        <div className="admin-search">
          <Search size={16} />
          <input type="text" placeholder="Tìm kiếm..." />
        </div>
        <button 
          className="topbar-btn theme-toggle"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="topbar-btn">
          <Bell size={18} />
        </button>
        <div className="topbar-user">
          <div className="topbar-avatar">AD</div>
          <span className="topbar-name">Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
