import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.tsx';
import Topbar from '../components/Topbar.tsx';
import './AdminLayout.css';

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <Topbar />
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
