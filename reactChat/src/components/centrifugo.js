// Импортируем Centrifuge как именованный экспорт
import { Centrifuge } from 'centrifuge';
import { $api } from './api'; // Импортируем настроенный $api для работы с API

export const initAndStartCentrifugo = (chatId, onMessageReceived) => {
  // Создаем подключение к серверу Centrifugo с использованием удаленного WebSocket
  const centrifuge = new Centrifuge('wss://vkedu-fullstack-div2.ru/connection/websocket/', {
    debug: false,
    getToken: async (ctx) => {
      try {
        // Получаем токен для подключения к WebSocket
        const { data } = await $api.post('centrifugo/connect/', { ctx });
        return data.token; // Предполагаем, что токен приходит в поле token
      } catch (error) {
        console.error('Error fetching WebSocket token:', error.response?.data || error.message);
        throw error; // Прокидываем ошибку для обработки на уровне вызова
      }
    },
  });

  // Подписка на канал, соответствующий chatId
  const subscription = centrifuge.newSubscription(`chat:${chatId}`, {
    onMessage: (message) => {
      // Вызов callback функции при получении сообщения
      onMessageReceived(message.data);
    },
  });

  // Подключаемся к серверу и начинаем получать сообщения
  centrifuge.connect();

  return { subscription }; // Возвращаем объект с подпиской
};
