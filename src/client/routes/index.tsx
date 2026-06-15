import { Routes, Route } from 'react-router-dom';
import ClientLayout from '../layouts/ClientLayout';
import HomePage from '../pages/HomePage';
import ProductsPage from '../pages/ProductsPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import AccountPage from '../pages/AccountPage';
import OrderSuccessPage from '../pages/OrderSuccessPage';
import OrderTrackingPage from '../pages/OrderTrackingPage';

const ClientRoutes = () => {
  return (
    <Routes>
      <Route element={<ClientLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="order-tracking" element={<OrderTrackingPage />} />
        <Route path="*" element={<div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}><h2>404 - Không tìm thấy trang</h2></div>} />
      </Route>

      <Route path="checkout" element={<CheckoutPage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="order-success" element={<OrderSuccessPage />} />
    </Routes>
  );
};

export default ClientRoutes;
