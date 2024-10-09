import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', // Указываем корень текущей папки
  base: './', // Указываем базовый путь, который будет использоваться при сборке
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        chat: 'chat-screen.html',
      },
    },
  },
});
