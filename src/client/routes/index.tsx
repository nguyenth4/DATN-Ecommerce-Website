import { Routes, Route } from 'react-router-dom';
import ClientLayout from '../layouts/ClientLayout';
import HomePage from '../pages/HomePage';

const ClientRoutes = () => {
  return (
    <Routes>
      <Route element={<ClientLayout />}>
        <Route index element={<HomePage />} />
        {/* Additional client routes will go here */}
      </Route>
    </Routes>
  );
};

export default ClientRoutes;
