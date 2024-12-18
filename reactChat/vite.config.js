import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [react()],
  base: '/2024-2-VK-EDU-Frontend-N-Abramov/',
  server: {
    proxy: !isProduction
      ? {
          '/api': {
            target: 'https://vkedu-fullstack-div2.ru', // Удаленный сервер API
            changeOrigin: true,
            secure: true,
            rewrite: (path) => path.replace(/^\/api/, '/api'),
          },
        }
      : undefined,
    watch: {
      usePolling: true,
    },
  },
});
