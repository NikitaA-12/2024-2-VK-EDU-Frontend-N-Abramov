import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api/api';
import { updateChats } from './chatsSlice';

interface Chat {
  id: string;
  title: string;
  members: { id: string }[];
  is_private: boolean;
  created_at: string;
  updated_at: string;
  last_message: string;
}

interface CreateChatParams {
  title: string;
  isPrivate: boolean;
  membersArray?: string[];
}

interface ChatCreationState {
  isLoading: boolean;
  error: string | null;
  newChat: Chat | null;
}

export const createChat = createAsyncThunk<Chat, CreateChatParams, { rejectValue: string }>(
  'chatCreation/createChat',
  async ({ title, isPrivate, membersArray = [] }, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Токен отсутствует');
      }

      const chatsData: Chat[] = JSON.parse(localStorage.getItem('chats') || '[]');
      const members = chatsData
        .flatMap((chat) => chat.members.map((member) => member.id))
        .filter((id) => id);

      const uniqueMembers = Array.from(new Set([...members, ...membersArray]));

      if (uniqueMembers.length === 0) {
        return rejectWithValue('Добавьте участников для создания чата.');
      }

      const apiInstance = api.getApiInstance();

      const response = await apiInstance.post(
        '/chats/',
        {
          title: title.trim(),
          members: uniqueMembers.slice(0, 100),
          is_private: isPrivate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const newChat: Chat = {
        ...response.data,
        created_at: new Date(response.data.created_at).toISOString(),
        updated_at: new Date(response.data.updated_at).toISOString(),
        last_message: response.data.last_message || '',
      };

      dispatch(updateChats(newChat));

      const updatedChats = [newChat, ...chatsData];
      localStorage.setItem('chats', JSON.stringify(updatedChats));

      return newChat;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

const chatCreationSlice = createSlice({
  name: 'chatCreation',
  initialState: {
    isLoading: false,
    error: null,
    newChat: null,
  } as ChatCreationState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createChat.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createChat.fulfilled, (state, action: PayloadAction<Chat>) => {
        state.isLoading = false;
        state.newChat = action.payload;
      })
      .addCase(createChat.rejected, (state, action: PayloadAction<string | null | undefined>) => {
        state.isLoading = false;
        state.error = action.payload ?? null;
      });
  },
});

export default chatCreationSlice.reducer;
