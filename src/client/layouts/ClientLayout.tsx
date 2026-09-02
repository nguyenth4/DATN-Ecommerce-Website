import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useProducts, useCategories } from '../services/product.service';

const ClientLayout = () => {
  // Pre-fetch products & categories into React Query cache at startup
  // This enables INSTANT (0ms) page transitions between Home, Products, Wishlist, etc.
  useProducts({ limit: 100 });
  useCategories();

  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
};

export default ClientLayout;
