import axios from 'axios';
import { Centrifuge } from 'centrifuge';

// Базовая настройка Axios
const $api = axios.create({
  baseURL: 'https://vkedu-fullstack-div2.ru/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерсепторы для обработки запросов и ответов
$api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('Токен авторизации отсутствует.');
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error.message);
    return Promise.reject(error);
  },
);

$api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      console.warn('Unauthorized: токен истёк или отсутствует.');
    } else if (status >= 500) {
      console.error('Server error:', error.response?.data || error.message);
    } else if (status === 404) {
      console.error('Resource not found:', error.response?.data);
    } else {
      console.error('Response error:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  },
);

// WebSocket с использованием Centrifuge
const initAndStartCentrifugo = (chatId, onMessage) => {
  const centrifuge = new Centrifuge('wss://vkedu-fullstack-div2.ru/connection/websocket/');
  centrifuge.connect();

  const subscription = centrifuge.subscribe(`chat:${chatId}`, (message) => {
    if (message.data) {
      onMessage(message.data);
    }
  });

  subscription.on('error', (err) => {
    console.error(`Centrifugo subscription error for chat:${chatId}`, err);
  });

  subscription.on('subscribe', () => {
    console.log(`Subscribed to chat:${chatId}`);
  });

  return { centrifuge, subscription };
};

// Создание чата
const createChat = async (chatName) => {
  try {
    const response = await $api.post('/chats/', { title: chatName.trim() });
    return response.data;
  } catch (error) {
    console.error('Error creating chat:', error.response?.data || error.message);
    throw error;
  }
};

// Удаление чата
const deleteChat = async (chatId) => {
  try {
    await $api.delete(`/chat/${chatId}/`);
    console.log(`Chat with ID ${chatId} deleted successfully`);
  } catch (error) {
    console.error('Error deleting chat:', error.response?.data || error.message);
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
    if (error.response?.status === 405) {
      console.error('Error 405: Method Not Allowed. Проверьте настройки маршрутов на сервере.');
    }
    console.error('Error sending message:', error.response?.data || error.message);
    throw error;
  }
};

// Получение сообщений из чата
const fetchMessages = async (chatId) => {
  try {
    const response = await $api.get(`/messages/?chat=${chatId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.error('Error 404: Chat not found.');
    }
    console.error('Error fetching messages:', error.response?.data || error.message);
    throw error;
  }
};

// Получение текущего пользователя
const fetchCurrentUser = async () => {
  try {
    const response = await $api.get('/user/current/');
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.error('Error 404: Current user not found.');
    }
    console.error('Error fetching current user:', error.response?.data || error.message);
    throw error;
  }
};

// Получение списка чатов
const fetchChats = async () => {
  try {
    const response = await $api.get('/chats/');
    return response.data.results;
  } catch (error) {
    console.error('Error fetching chats:', error.message);
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
  fetchCurrentUser,
  createCancelToken,
};
