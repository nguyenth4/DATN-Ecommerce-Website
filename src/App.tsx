import { Routes, Route } from 'react-router-dom';
import ClientRoutes from './client/routes/index';
import AdminRoutes from './admin/routes/index';
import { ThemeProvider } from './shared/components/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/*" element={<ClientRoutes />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
