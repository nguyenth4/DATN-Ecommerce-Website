import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import DashboardPage from '../pages/DashboardPage';
import ProductsPage from '../pages/ProductsPage';
import CategoriesPage from '../pages/CategoriesPage';
import OrdersPage from '../pages/OrdersPage';
import CustomersPage from '../pages/CustomersPage';
import CouponsPage from '../pages/CouponsPage';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="coupons" element={<CouponsPage />} />
        {/* Additional admin routes will go here */}
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
