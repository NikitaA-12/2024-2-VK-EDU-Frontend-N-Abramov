import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: '/2024-2-VK-EDU-Frontend-N-Abramov/',
  build: {
    assetsDir: 'assets', // Сохранение изображений в папке assets
    rollupOptions: {
      output: {
        assetFileNames: '[name].[ext]', // Оставляем оригинальные имена файлов
      },
    },
  },
});
