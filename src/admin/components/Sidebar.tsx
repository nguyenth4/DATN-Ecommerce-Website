import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, BarChart3, Package, Receipt, FolderTree, 
  Users, Tag, Truck, CreditCard, Bell, Settings, ArrowLeft, LogOut 
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-text">Shop<span>Flow</span></div>
        <div className="sidebar-logo-sub">Admin Panel</div>
      </div>
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Tổng quan</div>
        <Link to="/admin" className={`sidebar-link ${path === '/admin' ? 'active' : ''}`}>
          <LayoutDashboard size={18} /> Dashboard
        </Link>
        <Link to="/admin/stats" className={`sidebar-link ${path.includes('/admin/stats') ? 'active' : ''}`}>
          <BarChart3 size={18} /> Thống kê
        </Link>
        
        <div className="sidebar-section-label">Quản lý</div>
        <Link to="/admin/products" className={`sidebar-link ${path.includes('/admin/products') ? 'active' : ''}`}>
          <Package size={18} /> Sản phẩm
        </Link>
        <Link to="/admin/orders" className={`sidebar-link ${path.includes('/admin/orders') ? 'active' : ''}`}>
          <Receipt size={18} /> Đơn hàng
        </Link>
        <Link to="/admin/categories" className={`sidebar-link ${path.includes('/admin/categories') ? 'active' : ''}`}>
          <FolderTree size={18} /> Danh mục
        </Link>
        <Link to="/admin/customers" className={`sidebar-link ${path.includes('/admin/customers') ? 'active' : ''}`}>
          <Users size={18} /> Khách hàng
        </Link>
        <Link to="/admin/coupons" className={`sidebar-link ${path.includes('/admin/coupons') ? 'active' : ''}`}>
          <Tag size={18} /> Mã giảm giá
        </Link>

        <div className="sidebar-section-label">Vận hành</div>
        <Link to="/admin/shipping" className={`sidebar-link ${path.includes('/admin/shipping') ? 'active' : ''}`}>
          <Truck size={18} /> Vận chuyển
        </Link>
        <Link to="/admin/payments" className={`sidebar-link ${path.includes('/admin/payments') ? 'active' : ''}`}>
          <CreditCard size={18} /> Thanh toán
        </Link>
        <Link to="/admin/notifications" className={`sidebar-link ${path.includes('/admin/notifications') ? 'active' : ''}`}>
          <Bell size={18} /> Thông báo
        </Link>

        <div className="sidebar-section-label">Hệ thống</div>
        <Link to="/admin/settings" className={`sidebar-link ${path.includes('/admin/settings') ? 'active' : ''}`}>
          <Settings size={18} /> Cài đặt
        </Link>
        <Link to="/" className="sidebar-link">
          <ArrowLeft size={18} /> Về trang Client
        </Link>
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">AD</div>
          <div>
            <div className="sidebar-user-name">Admin</div>
            <div className="sidebar-user-role">Super Admin</div>
          </div>
          <Link to="/login" className="sidebar-logout-link"><LogOut size={18} /></Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
