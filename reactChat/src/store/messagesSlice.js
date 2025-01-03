import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { $api } from '../api/api';
import { createSelector } from 'reselect';
import { v4 as uuidv4 } from 'uuid';

const getAuthHeaders = (state) => {
  const token = state.auth?.token || localStorage.getItem('token');
  if (!token) {
    console.warn('Токен отсутствует! Проверьте аутентификацию пользователя.');
  }
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchMessagesPage = createAsyncThunk(
  'messages/fetchMessagesPage',
  async ({ chatId, page }, { getState, rejectWithValue }) => {
    try {
      if (!chatId) {
        throw new Error('chatId отсутствует при загрузке сообщений.');
      }

      const state = getState();
      const headers = getAuthHeaders(state);
      console.log('Загрузка сообщений для чата:', chatId, 'страница:', page);

      const response = await $api.get(`/messages/?chat=${chatId}&page=${page}`, { headers });
      return response.data;
    } catch (err) {
      console.error('Ошибка при загрузке сообщений:', err.response?.data || err.message);
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ chatId, text }, { getState, rejectWithValue }) => {
    try {
      if (!chatId) {
        throw new Error('chatId отсутствует при отправке сообщения.');
      }

      const state = getState();
      const headers = getAuthHeaders(state);
      console.log('Отправка сообщения в чат:', chatId);

      const response = await $api.post('/messages/', { chat: chatId, text }, { headers });
      console.log('Сообщение отправлено:', response.data);

      return response.data;
    } catch (err) {
      console.error('Ошибка при отправке сообщения:', err.response?.data || err.message);
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    messages: {},
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessagesPage.pending, (state) => {
        state.isLoading = true;
        console.log('Начата загрузка сообщений...');
      })
      .addCase(fetchMessagesPage.fulfilled, (state, action) => {
        state.isLoading = false;
        const { chatId, page } = action.meta.arg;
        const { results, next } = action.payload;

        if (!state.messages[chatId]) {
          state.messages[chatId] = [];
        }
        state.messages[chatId] = [...state.messages[chatId], ...results];

        console.log(`Сообщения загружены для чата: ${chatId}, страница: ${page}`);
        console.log('Количество сообщений после загрузки:', state.messages[chatId].length);
      })
      .addCase(fetchMessagesPage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        console.error('Ошибка при загрузке сообщений:', state.error);
      })
      .addCase(sendMessage.pending, (state, action) => {
        const { chatId, text } = action.meta.arg;
        const tempId = `temp-${uuidv4()}`;
        const newMessage = {
          id: tempId,
          chatId,
          text,
          sender: { username: 'Your Username', id: 'your-user-id' },
          created_at: new Date().toISOString(),
        };
        state.messages[chatId] = state.messages[chatId] || [];
        state.messages[chatId].push(newMessage);
        console.log('Оптимистичное сообщение добавлено:', newMessage);
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const chatId = action.payload.chat;
        const tempMessageIndex = state.messages[chatId]?.findIndex((msg) =>
          msg.id.startsWith('temp-'),
        );
        if (tempMessageIndex !== -1) {
          state.messages[chatId][tempMessageIndex] = action.payload;
        } else {
          state.messages[chatId].push(action.payload);
        }
        console.log('Сообщение подтверждено сервером:', action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        console.error('Ошибка при отправке сообщения:', action.payload);
      });
  },
});

export const selectMessages = (state, chatId) => state.messages.messages[chatId] || [];

export const selectMessagesMemoized = createSelector([selectMessages], (messages) =>
  messages.slice().sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
);

export const selectMessagesLoading = (state) => state.messages.isLoading;

export default messagesSlice.reducer;
