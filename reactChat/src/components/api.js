import axios from 'axios';
import { Centrifuge } from 'centrifuge';

// Определяем, в какой среде запущено приложение
const isProduction = import.meta.env.MODE === 'production';

const baseURL = isProduction
  ? 'https://vkedu-fullstack-div2.ru/api/'
  : 'http://localhost:8000/api/';

// Базовая настройка Axios
const $api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерсепторы для обработки запросов
$api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('[API Request]', {
      method: config.method,
      url: config.url,
      params: config.params,
      data: config.data,
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('Токен авторизации отсутствует.');
    }
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error.message);
    return Promise.reject(error);
  },
);

// Интерсепторы для обработки ответов
$api.interceptors.response.use(
  (response) => {
    console.log('[API Response]', {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    const status = error.response?.status;
    console.error('[API Response Error]', {
      status,
      data: error.response?.data || error.message,
    });

    switch (status) {
      case 401:
        console.warn('Unauthorized: токен истёк или отсутствует.');
        break;
      case 404:
        console.error('Resource not found:', error.response?.data);
        break;
      case 500:
      default:
        console.error('Server error:', error.response?.data || error.message);
        break;
    }
    return Promise.reject(error);
  },
);

// WebSocket с использованием Centrifuge
const initAndStartCentrifugo = (chatId, onMessage) => {
  const centrifuge = new Centrifuge('wss://vkedu-fullstack-div2.ru/connection/websocket/');
  centrifuge.connect();

  const subscription = centrifuge.subscribe(`chat:${chatId}`, (message) => {
    console.log('[Centrifugo Message]', message);
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

// Функции API

const createChat = async (chatName) => {
  try {
    console.log('[Create Chat]', { chatName });
    const response = await $api.post('/chats/', { title: chatName.trim() });
    console.log('[Create Chat Response]', response.data);
    return response.data;
  } catch (error) {
    console.error('[Create Chat Error]', error.response?.data || error.message);
    throw error;
  }
};

const deleteChat = async (chatId) => {
  try {
    console.log(`[Delete Chat] Chat ID: ${chatId}`);
    await $api.delete(`/chat/${chatId}/`);
    console.log(`Chat with ID ${chatId} deleted successfully`);
  } catch (error) {
    console.error('[Delete Chat Error]', error.response?.data || error.message);
    throw error;
  }
};

const sendMessage = async (chatId, messageText) => {
  try {
    console.log('[Send Message]', { chatId, messageText });
    const response = await $api.post('/message/', { chat_id: chatId, text: messageText });
    console.log('[Send Message Response]', response.data);
    return response.data;
  } catch (error) {
    console.error('[Send Message Error]', error.response?.data || error.message);
    throw error;
  }
};

const fetchMessages = async (chatId) => {
  try {
    console.log('[Fetch Messages]', { chatId });
    const response = await $api.get(`/messages/?chat=${chatId}`);
    console.log('[Fetch Messages Response]', response.data);
    return response.data;
  } catch (error) {
    console.error('[Fetch Messages Error]', error.response?.data || error.message);
    throw error;
  }
};

const fetchCurrentUser = async () => {
  try {
    console.log('[Fetch Current User]');
    const response = await $api.get('/user/current/');
    console.log('[Current User Response]', response.data);
    return response.data;
  } catch (error) {
    console.error('[Fetch Current User Error]', error.response?.data || error.message);
    throw error;
  }
};

const fetchChats = async () => {
  try {
    console.log('[Fetch Chats]');
    const response = await $api.get('/chats/');
    console.log('[Fetch Chats Response]', response.data);
    return response.data.results;
  } catch (error) {
    console.error('[Fetch Chats Error]', error.response?.data || error.message);
    throw error;
  }
};

// Создание токена отмены запросов
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
