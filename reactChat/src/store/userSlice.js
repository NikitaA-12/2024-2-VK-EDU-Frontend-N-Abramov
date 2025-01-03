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

        console.log(`Загружаем пользователей, страница ${currentPage}`, response.data.results);

        allUsers = [...allUsers, ...response.data.results];

        if (response.data.next) {
          currentPage += 1;
        } else {
          hasNextPage = false;
        }
      }

      localStorage.setItem('users', JSON.stringify(allUsers));
      localStorage.setItem('usersLastFetched', currentTime.toString());

      console.log('Пользователи загружены успешно:', allUsers);
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

      console.log('Загружен текущий пользователь:', response.data);
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
    availableUsers: JSON.parse(localStorage.getItem('users')) || [],
    selectedUsers: [],
    currentUser: { id: null, username: '', avatar: null },
    isLoading: false,
    isLoaded: false,
    error: null,
  },
  reducers: {
    setSelectedUsers: (state, action) => {
      state.selectedUsers = action.payload;
      console.log('Выбраны пользователи:', state.selectedUsers);
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
      console.log('Текущий пользователь установлен:', state.currentUser);
    },
    clearCurrentUser: (state) => {
      state.currentUser = { id: null, username: '', avatar: null };
      console.log('Текущий пользователь очищен');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.isLoaded = false;
        state.error = null;
        console.log('Загрузка пользователей в процессе...');
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoaded = true;
        state.availableUsers = action.payload;
        console.log('Пользователи загружены:', state.availableUsers);
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
        console.log('Загрузка текущего пользователя...');
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoaded = true;
        state.currentUser = action.payload;
        console.log('Текущий пользователь загружен:', state.currentUser);
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoaded = false;
        state.error = action.payload;
        console.error('Ошибка при загрузке текущего пользователя:', state.error);
      });
  },
});

export const { setSelectedUsers, setCurrentUser, clearCurrentUser } = userSlice.actions;

export const selectCurrentUser = (state) => state.users.currentUser;

export default userSlice.reducer;
