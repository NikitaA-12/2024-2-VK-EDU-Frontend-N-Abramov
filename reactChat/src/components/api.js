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

  return { centrifuge, subscription };
};

// Асинхронные функции API
const sendMessage = async (chatId, messageText) => {
  try {
    const response = await $api.post('/message/', {
      chat_id: chatId,
      text: messageText,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
    throw error;
  }
};

const fetchMessages = async (chatId) => {
  try {
    const response = await $api.get(`/messages/?chat=${chatId}`);
    return response.data; // Возвращаем полученные сообщения
  } catch (error) {
    console.error('API Error fetching messages:', error.message);

    if (error.response) {
      const status = error.response.status;
      if (status === 404) {
        throw new Error('Chat not found');
      }
      if (status === 500) {
        throw new Error('Server error while fetching messages');
      }
      throw new Error('Unexpected error occurred while fetching messages');
    } else {
      throw new Error('No response from server');
    }
  }
};

const createChat = async (chatName) => {
  try {
    const response = await $api.post('/chats/', { title: chatName.trim() });
    return response.data;
  } catch (error) {
    console.error('Error creating chat:', error.response?.data || error.message);
    throw error;
  }
};

const deleteChat = async (chatId) => {
  try {
    await $api.delete(`/chats/${chatId}`);
  } catch (error) {
    console.error('API Error deleting chat:', error.message);
    throw error;
  }
};

const fetchChats = async () => {
  try {
    const response = await $api.get('/chats/');
    return response.data.results;
  } catch (error) {
    console.error('Error fetching chats:', error.message);
    throw error;
  }
};

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
