import { User, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../shared/components/ThemeProvider';
import './Topbar.css';

const Topbar = () => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="topbar">
      <div className="topbar-search">
        <input type="text" placeholder="Search..." className="search-input" />
      </div>
      <div className="topbar-actions">
        <button 
          className="icon-btn theme-toggle"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="icon-btn">
          <Bell size={20} />
        </button>
        <div className="admin-profile">
          <User size={20} />
          <span>Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
