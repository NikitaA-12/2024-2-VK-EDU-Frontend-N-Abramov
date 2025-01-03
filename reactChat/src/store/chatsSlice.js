import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { $api } from '../api/api';

export const fetchChats = createAsyncThunk(
  'chats/fetchChats',
  async ({ page, pageSize, searchTerm }, { rejectWithValue }) => {
    try {
      const cachedChats = JSON.parse(localStorage.getItem('chats'));
      const lastFetchTime = localStorage.getItem('chatsLastFetchTime');
      const isCacheValid =
        cachedChats && lastFetchTime && Date.now() - lastFetchTime < 5 * 60 * 1000;

      if (isCacheValid) {
        console.log('Using cached chats data');
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
      console.log('Fetched chats from API:', chatsWithLastMessage);
      return chatsWithLastMessage;
    } catch (err) {
      console.error('Error fetching chats:', err.response?.data || err.message);
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const selectChat = createAsyncThunk(
  'chats/selectChat',
  async (chatId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Токен отсутствует');
      }

      console.log('Selecting chat with ID:', chatId);
      const response = await $api.get(`/messages/?chat=${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Fetched messages for chat:', chatId, response.data.results);
      return { chatId, messages: response.data.results };
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

      console.log(`Chat with ID ${chatId} removed`);
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
      console.log('Search term updated:', state.searchTerm);
    },
    setCurrentChatId: (state, action) => {
      state.currentChatId = action.payload;
      console.log('Current chat ID set to:', state.currentChatId);
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
      console.log('Messages updated:', state.messages);
    },
    setCurrentChat: (state, action) => {
      const chat = state.chats.find((chat) => chat.id === action.payload);
      state.currentChat = chat || null;
      console.log('Current chat set:', state.currentChat);
    },
    updateChats: (state, action) => {
      state.chats = [action.payload, ...state.chats];
      localStorage.setItem('chats', JSON.stringify(state.chats));
      console.log('Chats updated:', state.chats);
    },
    removeChatFromState: (state, action) => {
      state.chats = state.chats.filter((chat) => chat.id !== action.payload);
      console.log('Chat removed from state:', state.chats);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        console.log('Fetching chats...');
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.chats = action.payload;
        console.log('Chats loaded:', state.chats);
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        console.error('Failed to fetch chats:', state.error);
      })
      .addCase(selectChat.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        console.log('Selecting chat...');
      })
      .addCase(selectChat.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentChatId = action.payload.chatId;
        state.messages = action.payload.messages;
        state.currentChat = state.chats.find((chat) => chat.id === action.payload.chatId) || null;
        console.log('Chat selected:', state.currentChatId);
      })
      .addCase(selectChat.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        console.error('Failed to select chat:', state.error);
      })
      .addCase(removeChat.fulfilled, (state, action) => {
        state.chats = state.chats.filter((chat) => chat.id !== action.payload);
        localStorage.setItem('chats', JSON.stringify(state.chats));
        console.log('Chat deleted, updated chats:', state.chats);
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
