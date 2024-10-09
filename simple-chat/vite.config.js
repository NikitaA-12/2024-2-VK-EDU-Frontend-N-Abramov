import { defineConfig } from 'vite';

export default defineConfig({
  root: 'simple-chat', // Укажите папку, в которой находятся ваши HTML-файлы
  base: './', // Укажите базовый путь для использования при сборке
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        chat: 'chat-screen.html',
      },
    },
  },
});
