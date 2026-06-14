import { Link } from 'react-router-dom';
import { LayoutDashboard, Smartphone, Users, ShoppingBag } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Admin Panel</h2>
      </div>
      <nav className="sidebar-nav">
        <Link to="/admin" className="sidebar-item">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>
        <Link to="/admin/products" className="sidebar-item">
          <Smartphone size={20} />
          <span>Products</span>
        </Link>
        <Link to="/admin/orders" className="sidebar-item">
          <ShoppingBag size={20} />
          <span>Orders</span>
        </Link>
        <Link to="/admin/customers" className="sidebar-item">
          <Users size={20} />
          <span>Customers</span>
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
