import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api/api';

interface Chat {
  id: string | null;
  title: string;
  members: { id: string }[];
  last_message: string | null;
  avatar?: string | null;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
}

interface FetchChatsParams {
  page: number;
  pageSize: number;
  searchTerm: string;
}

interface SelectChatParams {
  chatId: string;
}

interface ChatsState {
  chats: Chat[];
  currentChatId: string | null;
  currentChat: Chat | null;
  messages: Message[];
  searchTerm: string;
  isLoading: boolean;
  error: string | null;
}

export const fetchChats = createAsyncThunk<Chat[], FetchChatsParams, { rejectValue: string }>(
  'chats/fetchChats',
  async ({ page, pageSize, searchTerm }, { rejectWithValue }) => {
    try {
      const cachedChats = JSON.parse(localStorage.getItem('chats') || '[]');
      const lastFetchTime = localStorage.getItem('chatsLastFetchTime');
      const isCacheValid =
        cachedChats && lastFetchTime && Date.now() - parseInt(lastFetchTime) < 5 * 60 * 1000;

      if (isCacheValid) {
        return cachedChats;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Токен отсутствует');
      }

      const apiInstance = api.getApiInstance();

      const response = await apiInstance.get('/chats/', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, page_size: pageSize, search: searchTerm },
      });

      const chatsWithLastMessage = response.data.results.map((chat: any) => ({
        ...chat,
        last_message: chat.last_message || null,
      }));

      localStorage.setItem('chats', JSON.stringify(chatsWithLastMessage));
      localStorage.setItem('chatsLastFetchTime', Date.now().toString());
      return chatsWithLastMessage;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const selectChat = createAsyncThunk<
  { chatId: string; messages: Message[] },
  SelectChatParams,
  { rejectValue: string }
>('chats/selectChat', async ({ chatId }, { rejectWithValue }) => {
  try {
    const cachedMessages = JSON.parse(localStorage.getItem(`messages-${chatId}`) || '[]');
    const lastFetchTime = localStorage.getItem(`messagesLastFetchTime-${chatId}`);
    const isCacheValid =
      cachedMessages && lastFetchTime && Date.now() - parseInt(lastFetchTime) < 5 * 60 * 1000;

    if (isCacheValid) {
      return { chatId, messages: cachedMessages };
    }

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Токен отсутствует');
    }

    const apiInstance = api.getApiInstance();

    const response = await apiInstance.get(`/messages/?chat=${chatId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const messages: Message[] = response.data.results;

    localStorage.setItem(`messages-${chatId}`, JSON.stringify(messages));
    localStorage.setItem(`messagesLastFetchTime-${chatId}`, Date.now().toString());

    return { chatId, messages };
  } catch (err: any) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const removeChat = createAsyncThunk<string, string, { rejectValue: string }>(
  'chats/removeChat',
  async (chatId, { dispatch, rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Токен отсутствует');
      }

      const apiInstance = api.getApiInstance();

      await apiInstance.delete(`/chat/${chatId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      dispatch(removeChatFromState(chatId));

      const cachedChats = JSON.parse(localStorage.getItem('chats') || '[]');
      const updatedChats = cachedChats.filter((chat: Chat) => chat.id !== chatId);
      localStorage.setItem('chats', JSON.stringify(updatedChats));

      return chatId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

const chatsSlice = createSlice({
  name: 'chats',
  initialState: {
    chats: JSON.parse(localStorage.getItem('chats') || '[]'),
    currentChatId: null,
    currentChat: null,
    messages: [],
    searchTerm: '',
    isLoading: false,
    error: null,
  } as ChatsState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setCurrentChatId: (state, action: PayloadAction<string | null>) => {
      state.currentChatId = action.payload;
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    setCurrentChat: (state, action: PayloadAction<string>) => {
      const chat = state.chats.find((chat) => chat.id === action.payload);
      state.currentChat = chat || null;
    },
    updateChats: (state, action: PayloadAction<Chat>) => {
      state.chats = [action.payload, ...state.chats];
      localStorage.setItem('chats', JSON.stringify(state.chats));
    },
    removeChatFromState: (state, action: PayloadAction<string>) => {
      state.chats = state.chats.filter((chat) => chat.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChats.fulfilled, (state, action: PayloadAction<Chat[]>) => {
        state.isLoading = false;
        state.chats = action.payload;
      })
      .addCase(fetchChats.rejected, (state, action: PayloadAction<string | null | undefined>) => {
        state.isLoading = false;
        state.error = action.payload ?? null;
      })
      .addCase(selectChat.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        selectChat.fulfilled,
        (state, action: PayloadAction<{ chatId: string; messages: Message[] }>) => {
          state.isLoading = false;
          state.currentChatId = action.payload.chatId;
          state.messages = action.payload.messages;
          state.currentChat = state.chats.find((chat) => chat.id === action.payload.chatId) || null;
        },
      )
      .addCase(selectChat.rejected, (state, action: PayloadAction<string | null | undefined>) => {
        state.isLoading = false;
        state.error = action.payload ?? null;
      })
      .addCase(removeChat.fulfilled, (state, action: PayloadAction<string>) => {
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

export const selectChats = (state: { chats: ChatsState }) => state.chats.chats;
export const selectCurrentChat = (state: { chats: ChatsState }) => state.chats.currentChat;
export const selectCurrentChatId = (state: { chats: ChatsState }) => state.chats.currentChatId;
export const selectMessages = (state: { chats: ChatsState }) => state.chats.messages;
export const selectChatsLoading = (state: { chats: ChatsState }) => state.chats.isLoading;
export const selectChatsError = (state: { chats: ChatsState }) => state.chats.error;

export default chatsSlice.reducer;
