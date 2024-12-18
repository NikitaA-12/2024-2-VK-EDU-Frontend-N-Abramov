import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Определение base для деплоя на GitHub Pages
const isProduction = process.env.NODE_ENV === 'production';
const base = isProduction ? '/2024-2-VK-EDU-Frontend-N-Abramov/' : '/';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base,
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
