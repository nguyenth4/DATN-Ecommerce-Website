import { Routes, Route } from 'react-router-dom';
import ClientRoutes from './client/routes/index';
import { ThemeProvider } from './shared/components/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/*" element={<ClientRoutes />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
