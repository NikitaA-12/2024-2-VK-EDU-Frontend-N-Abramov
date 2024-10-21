import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', // Корень проекта
  base: './', // Базовый путь для сборки
  build: {
    assetsDir: '', // Убираем вложение ресурсов в отдельную папку, чтобы картинки сохранялись в корне
    rollupOptions: {
      output: {
        assetFileNames: '[name].[ext]', // Сохраняем изображения с их оригинальными именами и расширениями в корень
      },
    },
  },
});
