// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src', // Указываем папку, в которой находится index.html
  build: {
    outDir: '../dist', // Указываем выходную папку для собранного проекта
    rollupOptions: {
      input: {
        main: 'index.html', // Указываем путь к вашему index.html
      },
    },
  },
});
