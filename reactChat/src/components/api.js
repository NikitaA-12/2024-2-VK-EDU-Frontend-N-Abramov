// api.js

import axios from 'axios';
import { Centrifuge } from 'centrifuge';

const $api = axios.create({
  baseURL: 'https://vkedu-fullstack-div2.ru/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 📌 Интерсепторы для запросов
$api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request URL:', config.url);
    console.log('Request Method:', config.method);
    console.log('Request Headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('Ошибка запроса:', error.message);
    return Promise.reject(error);
  },
);

// 📌 Интерсепторы для ответов
$api.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      status: response.status,
      data: response.data,
      url: response.config.url,
    });
    return response;
  },
  (error) => {
    const status = error.response?.status;
    console.error('Ошибка ответа от сервера:', {
      status,
      message: error.message,
      data: error.response?.data,
      url: error.config?.url,
    });
    return Promise.reject(error);
  },
);

// 📌 WebSocket с использованием Centrifuge
const initAndStartCentrifugo = (chatId, onMessageReceived) => {
  const centrifuge = new Centrifuge('wss://vkedu-fullstack-div2.ru/connection/websocket/', {
    debug: false,
    getToken: async (ctx) => {
      try {
        const { data } = await $api.post('centrifugo/connect/', { ctx });
        if (data && data.token) {
          return data.token;
        }
        throw new Error('Token not found in response');
      } catch (error) {
        console.error('Ошибка получения токена для WebSocket:', error.message);
        throw error;
      }
    },
  });

  const subscription = centrifuge.newSubscription(`chat:${chatId}`, {
    onMessage: (message) => {
      console.log(`Received WebSocket message for Chat ID ${chatId}:`, message.data);
      if (message.data) {
        onMessageReceived(message.data);
      }
    },
  });

  centrifuge.connect();

  return { subscription };
};

// 📌 Отправка сообщения
const sendMessage = async (chatId, messageText) => {
  try {
    const url = `chats/${chatId}/messages/`;

    const response = await $api.post(url, { text: messageText });
    if (response.data) {
      console.log('Message successfully sent:', response.data);
      return response.data;
    } else {
      throw new Error('No data received from the server');
    }
  } catch (error) {
    console.error('Ошибка при отправке сообщения:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
      url: `https://vkedu-fullstack-div2.ru/api/${url}`,
    });
    throw error;
  }
};

// 📌 Загрузка сообщений
const fetchMessages = async (chatId) => {
  try {
    const url = `chats/${chatId}/messages/`;
    const response = await $api.get(url);

    console.log('Fetched Messages:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ошибка загрузки сообщений:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
      url: `https://vkedu-fullstack-div2.ru/api/${url}`,
    });
    throw error;
  }
};

// 📌 Обновление сообщения
const updateMessage = async (messageId, updatedContent) => {
  try {
    const url = `messages/${messageId}/`;
    const response = await $api.patch(url, { text: updatedContent });

    console.log('Message updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ошибка обновления сообщения:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
    throw error;
  }
};

// 📌 Удаление сообщения
const deleteMessage = async (messageId) => {
  try {
    const url = `messages/${messageId}/`;
    await $api.delete(url);
    console.log(`Message with ID ${messageId} deleted successfully.`);
  } catch (error) {
    console.error('Ошибка удаления сообщения:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
    throw error;
  }
};

// 📜 Экспортируем компоненты
export { $api, initAndStartCentrifugo, sendMessage, fetchMessages, updateMessage, deleteMessage };
