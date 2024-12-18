import axios from 'axios';
import { Centrifuge } from 'centrifuge';

// Использование базового URL из переменной окружения
const API_BASE_URL = import.meta.env.VITE_PUBLIC_API;

const $api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерсепторы для обработки запросов
$api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Ошибка в запросе:', error.message);
    return Promise.reject(error);
  },
);

// Интерсепторы для обработки ответов
$api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      console.warn('Ошибка авторизации: токен истёк или отсутствует.');
    } else if (status >= 500) {
      console.error('Ошибка сервера:', error.response?.data || error.message);
    } else if (status === 404) {
      console.error('Ресурс не найден:', error.response?.data);
    } else {
      console.error('Ошибка ответа:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  },
);

// Инициализация и подключение к Centrifugo
const initAndStartCentrifugo = (chatId, onMessage) => {
  const centrifuge = new Centrifuge('wss://vkedu-fullstack-div2.ru/connection/websocket/');
  centrifuge.connect();

  const subscription = centrifuge.subscribe(`chat:${chatId}`, (message) => {
    if (message.data) {
      onMessage(message.data);
    }
  });

  subscription.on('error', (err) => {
    console.error(`Ошибка подписки на чат ${chatId}:`, err);
  });

  subscription.on('subscribe', () => {
    console.log(`Подписка на чат ${chatId} успешно выполнена.`);
  });

  return { centrifuge, subscription };
};

// Функция создания чата
const createChat = async (chatName) => {
  try {
    const response = await $api.post('/chats/', { title: chatName.trim() });
    return response.data;
  } catch (error) {
    console.error('Ошибка создания чата:', error.response?.data || error.message);
    throw error;
  }
};

// Функция удаления чата
const deleteChat = async (chatId) => {
  try {
    console.log(`Попытка удаления чата с ID: ${chatId}`);
    await $api.delete(`/chat/${chatId}/`);
    console.log(`Чат с ID ${chatId} успешно удалён.`);
  } catch (error) {
    if (error.response?.status === 404) {
      console.error(`Чат с ID ${chatId} не найден.`);
    } else {
      console.error('Ошибка удаления чата:', error.response?.data || error.message);
    }
    throw error;
  }
};

// Отправка сообщения в чат
const sendMessage = async (chatId, messageText) => {
  try {
    const response = await $api.post('/message/', {
      chat_id: chatId,
      text: messageText,
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error.response?.data || error.message);
    throw error;
  }
};

// Получение сообщений из чата
const fetchMessages = async (chatId) => {
  try {
    const response = await $api.get(`/messages/?chat=${chatId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка получения сообщений:', error.message);

    if (error.response) {
      const status = error.response.status;
      if (status === 404) {
        throw new Error('Чат не найден.');
      }
      if (status === 500) {
        throw new Error('Ошибка сервера при получении сообщений.');
      }
      throw new Error('Неожиданная ошибка при получении сообщений.');
    } else {
      throw new Error('Ответ от сервера отсутствует.');
    }
  }
};

// Получение списка чатов
const fetchChats = async () => {
  try {
    const response = await $api.get('/chats/');
    return response.data.results;
  } catch (error) {
    console.error('Ошибка получения списка чатов:', error.message);
    throw error;
  }
};

// Создание токена отмены запроса
const createCancelToken = () => {
  const source = axios.CancelToken.source();
  return source;
};

export default $api;
export {
  $api,
  initAndStartCentrifugo,
  sendMessage,
  fetchMessages,
  createChat,
  fetchChats,
  deleteChat,
  createCancelToken,
};
