import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api/api';
import { createSelector } from 'reselect';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  chatId: string;
  text: string;
  sender: {
    username: string;
    id: string;
  };
  created_at: string;
}

interface MessagesState {
  messages: Record<string, Message[]>;
  isLoading: boolean;
  error: string | null;
}

interface FetchMessagesPageArgs {
  chatId: string;
  page: number;
}

interface SendMessageArgs {
  chatId: string;
  text: string;
}

interface FetchMessagesResponse {
  results: Message[];
  next: string | null;
}

const getAuthHeaders = (state: any): Record<string, string> => {
  const token = state.auth?.token || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchMessagesPage = createAsyncThunk<
  FetchMessagesResponse,
  FetchMessagesPageArgs,
  { rejectValue: string }
>(
  'messages/fetchMessagesPage',
  async ({ chatId, page }: FetchMessagesPageArgs, { getState, rejectWithValue }) => {
    try {
      if (!chatId) {
        throw new Error('chatId отсутствует при загрузке сообщений.');
      }

      const state = getState();
      const headers = getAuthHeaders(state);
      const apiInstance = api.getApiInstance();
      const response = await apiInstance.get(`/messages/?chat=${chatId}&page=${page}`, { headers });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const sendMessage = createAsyncThunk<Message, SendMessageArgs, { rejectValue: string }>(
  'messages/sendMessage',
  async ({ chatId, text }: SendMessageArgs, { getState, rejectWithValue }) => {
    try {
      if (!chatId) {
        throw new Error('chatId отсутствует при отправке сообщения.');
      }

      const state = getState();
      const headers = getAuthHeaders(state);
      const apiInstance = api.getApiInstance();
      const response = await apiInstance.post('/messages/', { chat: chatId, text }, { headers });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    messages: {} as Record<string, Message[]>,
    isLoading: false,
    error: null as string | null,
  } as MessagesState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessagesPage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMessagesPage.fulfilled, (state, action) => {
        state.isLoading = false;
        const { chatId, page } = action.meta.arg as FetchMessagesPageArgs;
        const { results } = action.payload;

        if (!state.messages[chatId]) {
          state.messages[chatId] = [];
        }
        state.messages[chatId] = [...state.messages[chatId], ...results];
      })
      .addCase(fetchMessagesPage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(sendMessage.pending, (state, action) => {
        const { chatId, text } = action.meta.arg as SendMessageArgs;
        const tempId = `temp-${uuidv4()}`;
        const newMessage: Message = {
          id: tempId,
          chatId,
          text,
          sender: { username: 'Your Username', id: 'your-user-id' },
          created_at: new Date().toISOString(),
        };
        state.messages[chatId] = state.messages[chatId] || [];
        state.messages[chatId].push(newMessage);
      })
      .addCase(sendMessage.fulfilled, (state, action: PayloadAction<Message>) => {
        const chatId = action.payload.chatId;
        const tempMessageIndex = state.messages[chatId]?.findIndex((msg) =>
          msg.id.startsWith('temp-'),
        );
        if (tempMessageIndex !== -1) {
          state.messages[chatId][tempMessageIndex] = action.payload;
        } else {
          state.messages[chatId].push(action.payload);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const selectMessages = (state: any, chatId: string): Message[] =>
  state.messages.messages[chatId] || [];

export const selectMessagesMemoized = createSelector([selectMessages], (messages) =>
  messages
    .slice()
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
);

export const selectMessagesLoading = (state: any): boolean => state.messages.isLoading;

export default messagesSlice.reducer;
