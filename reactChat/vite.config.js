import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/2024-2-VK-EDU-Frontend-N-Abramov/',
  server: {
    proxy: {
      '/api': {
        target: 'https://vkedu-fullstack-div2.ru', // Удаленный сервер API
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
    watch: {
      usePolling: true,
    },
  },
});
