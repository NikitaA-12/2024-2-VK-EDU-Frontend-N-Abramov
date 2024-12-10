// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/2024-2-VK-EDU-Frontend-N-Abramov/', // Убедитесь, что base правильный для продакшн-среды
  server: {
    proxy: {
      '/api': {
        target: 'https://vkedu-fullstack-div2.ru', // Удаленный сервер API
        changeOrigin: true,
        secure: true, // Используйте true, если сервер поддерживает HTTPS
        rewrite: (path) => path.replace(/^\/api/, '/api'), // Прокси запросов на /api
      },
    },
    watch: {
      usePolling: true, // Для Windows или других ОС, где наблюдение за файлами не работает корректно
    },
  },
});
