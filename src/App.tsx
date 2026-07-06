import { Routes, Route } from 'react-router-dom';
import ClientRoutes from './client/routes/index';
import { ThemeProvider } from './shared/components/ThemeProvider';
import { Toaster } from 'react-hot-toast';
import './client/styles/custom.css';

function App() {
  return (
    <ThemeProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--paper)',
            color: 'var(--ink)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
          }
        }}
      />
      <Routes>
        <Route path="/*" element={<ClientRoutes />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
