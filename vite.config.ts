import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true, // Lỗi ngay nếu port bị chiếm, thay vì dùng port ngẫu nhiên
    proxy: {
      '/admin': {
        target: 'http://localhost:9000',
        changeOrigin: true,
      },
      '/api/cas': {
        target: 'https://production.cas.so',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cas/, ''),
      }
    }
  }
})

