import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { $api } from '../api/api';

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async ({ userPageSize }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Нет токена, отменяем загрузку пользователей');
        return;
      }

      const storedUsers = localStorage.getItem('users');
      const lastFetched = localStorage.getItem('usersLastFetched');
      const currentTime = Date.now();

      if (storedUsers && lastFetched && currentTime - lastFetched < 3600000) {
        console.log('Используем кэшированные данные пользователей');
        return JSON.parse(storedUsers);
      }

      let allUsers = [];
      let currentPage = 1;
      let hasNextPage = true;

      while (hasNextPage) {
        const response = await $api.get('/users/', {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: currentPage, page_size: userPageSize },
        });

        allUsers = [...allUsers, ...response.data.results];

        if (response.data.next) {
          currentPage += 1;
        } else {
          hasNextPage = false;
        }
      }

      localStorage.setItem('users', JSON.stringify(allUsers));
      localStorage.setItem('usersLastFetched', currentTime.toString());

      return allUsers;
    } catch (err) {
      console.error('Ошибка при загрузке пользователей:', err.message);
      return rejectWithValue(err.message);
    }
  },
);

export const fetchCurrentUser = createAsyncThunk(
  'users/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Нет токена, невозможно загрузить текущего пользователя');
        throw new Error('Токен отсутствует');
      }

      const response = await $api.get('/user/current/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.data || !response.data.id) {
        console.error('Ответ от API не содержит данных о пользователе:', response.data);
        throw new Error('Не удалось загрузить данные о текущем пользователе');
      }

      return response.data;
    } catch (err) {
      console.error('Ошибка при загрузке текущего пользователя:', err.message);
      return rejectWithValue(err.message);
    }
  },
);

export const userSlice = createSlice({
  name: 'users',
  initialState: {
    isAuthenticated: false,
    availableUsers: JSON.parse(localStorage.getItem('users')) || [],
    selectedUsers: [],
    currentUser: { id: null, username: '', avatar: null },
    isLoading: false,
    isLoaded: false,
    error: null,
  },
  reducers: {
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    setSelectedUsers: (state, action) => {
      state.selectedUsers = action.payload;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    setUserDetails: (state, action) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
    },
    clearCurrentUser: (state) => {
      state.currentUser = { id: null, username: '', avatar: null };
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.isLoaded = false;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoaded = true;
        state.availableUsers = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoaded = false;
        state.error = action.payload;
        console.error('Ошибка при загрузке пользователей:', state.error);
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.isLoaded = false;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoaded = true;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoaded = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        console.error('Ошибка при загрузке текущего пользователя:', state.error);
      });
  },
});

export const {
  setAuthenticated,
  setSelectedUsers,
  setCurrentUser,
  setUserDetails,
  clearCurrentUser,
} = userSlice.actions;

export const selectCurrentUser = (state) => state.users.currentUser;
export const selectIsAuthenticated = (state) => state.users.isAuthenticated;

export default userSlice.reducer;
