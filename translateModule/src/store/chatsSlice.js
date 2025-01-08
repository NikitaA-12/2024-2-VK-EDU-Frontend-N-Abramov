import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { $api } from '../api/api';
import { useNavigate } from 'react-router-dom';

export const fetchChats = createAsyncThunk(
  'chats/fetchChats',
  async ({ page, pageSize, searchTerm }, { rejectWithValue }) => {
    try {
      const cachedChats = JSON.parse(localStorage.getItem('chats'));
      const lastFetchTime = localStorage.getItem('chatsLastFetchTime');
      const isCacheValid =
        cachedChats && lastFetchTime && Date.now() - lastFetchTime < 5 * 60 * 1000;

      if (isCacheValid) {
        return cachedChats;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Токен отсутствует');
      }

      const response = await $api.get('/chats/', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, page_size: pageSize, search: searchTerm },
      });

      const chatsWithLastMessage = response.data.results.map((chat) => ({
        ...chat,
        last_message: chat.last_message || null,
      }));

      localStorage.setItem('chats', JSON.stringify(chatsWithLastMessage));
      localStorage.setItem('chatsLastFetchTime', Date.now());
      return chatsWithLastMessage;
    } catch (err) {
      if (err.response?.status === 401) {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          try {
            const response = await $api.post('/auth/refresh/', { refresh_token: refreshToken });
            const { token: newToken, refresh_token: newRefreshToken } = response.data;

            localStorage.setItem('token', newToken);
            localStorage.setItem('refresh_token', newRefreshToken);
            return fetchChats({ page, pageSize, searchTerm });
          } catch (refreshError) {
            console.error(
              'Refresh token error:',
              refreshError.response?.data || refreshError.message,
            );
            localStorage.clear();
            useNavigate('/login');
            throw new Error('Токен истёк. Переход на страницу авторизации');
          }
        }
      }

      console.error('Error fetching chats:', err.response?.data || err.message);
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const selectChat = createAsyncThunk(
  'chats/selectChat',
  async (chatId, { rejectWithValue }) => {
    try {
      const cachedMessages = JSON.parse(localStorage.getItem(`messages-${chatId}`));
      const lastFetchTime = localStorage.getItem(`messagesLastFetchTime-${chatId}`);
      const isCacheValid =
        cachedMessages && lastFetchTime && Date.now() - lastFetchTime < 5 * 60 * 1000;

      if (isCacheValid) {
        return { chatId, messages: cachedMessages };
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Токен отсутствует');
      }

      const response = await $api.get(`/messages/?chat=${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const messages = response.data.results;

      localStorage.setItem(`messages-${chatId}`, JSON.stringify(messages));
      localStorage.setItem(`messagesLastFetchTime-${chatId}`, Date.now());

      return { chatId, messages };
    } catch (err) {
      console.error('Error selecting chat:', err.response?.data || err.message);
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const removeChat = createAsyncThunk(
  'chats/removeChat',
  async (chatId, { dispatch, rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Токен отсутствует');
      }

      await $api.delete(`/chat/${chatId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      dispatch(removeChatFromState(chatId));

      const cachedChats = JSON.parse(localStorage.getItem('chats')) || [];
      const updatedChats = cachedChats.filter((chat) => chat.id !== chatId);
      localStorage.setItem('chats', JSON.stringify(updatedChats));

      return chatId;
    } catch (err) {
      console.error('Error removing chat:', err.response?.data || err.message);
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

const chatsSlice = createSlice({
  name: 'chats',
  initialState: {
    chats: JSON.parse(localStorage.getItem('chats')) || [],
    currentChatId: null,
    currentChat: null,
    messages: [],
    searchTerm: '',
    isLoading: false,
    error: null,
  },
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setCurrentChatId: (state, action) => {
      state.currentChatId = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    setCurrentChat: (state, action) => {
      const chat = state.chats.find((chat) => chat.id === action.payload);
      state.currentChat = chat || null;
    },
    updateChats: (state, action) => {
      state.chats = [action.payload, ...state.chats];
      localStorage.setItem('chats', JSON.stringify(state.chats));
    },
    removeChatFromState: (state, action) => {
      state.chats = state.chats.filter((chat) => chat.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.chats = action.payload;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        console.error('Failed to fetch chats:', state.error);
      })
      .addCase(selectChat.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(selectChat.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentChatId = action.payload.chatId;
        state.messages = action.payload.messages;
        state.currentChat = state.chats.find((chat) => chat.id === action.payload.chatId) || null;
      })
      .addCase(selectChat.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        console.error('Failed to select chat:', state.error);
      })
      .addCase(removeChat.fulfilled, (state, action) => {
        state.chats = state.chats.filter((chat) => chat.id !== action.payload);
        localStorage.setItem('chats', JSON.stringify(state.chats));
      });
  },
});

export const {
  setSearchTerm,
  setCurrentChatId,
  setMessages,
  setCurrentChat,
  updateChats,
  removeChatFromState,
} = chatsSlice.actions;

export const selectChats = (state) => state.chats.chats;
export const selectCurrentChat = (state) => state.chats.currentChat;
export const selectCurrentChatId = (state) => state.chats.currentChatId;
export const selectMessages = (state) => state.chats.messages;
export const selectChatsLoading = (state) => state.chats.isLoading;
export const selectChatsError = (state) => state.chats.error;

export default chatsSlice.reducer;
