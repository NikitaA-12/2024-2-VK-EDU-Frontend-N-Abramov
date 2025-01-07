import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api/api';

interface User {
  id: string | null;
  username: string;
  avatar: string | null;
}

interface UserState {
  isAuthenticated: boolean;
  availableUsers: User[];
  selectedUsers: User[];
  currentUser: User;
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
}

export const fetchUsers = createAsyncThunk<
  User[],
  { userPageSize: number },
  { rejectValue: string }
>('users/fetchUsers', async ({ userPageSize }, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return [];
    }

    const storedUsers = localStorage.getItem('users');
    const lastFetched = localStorage.getItem('usersLastFetched');
    const currentTime = Date.now();

    if (storedUsers && lastFetched && currentTime - Number(lastFetched) < 3600000) {
      return JSON.parse(storedUsers);
    }

    let allUsers: User[] = [];
    let currentPage = 1;
    let hasNextPage = true;

    while (hasNextPage) {
      const apiInstance = api.getApiInstance();
      const response = await apiInstance.get('/users/', {
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
    const errorMessage = (err as Error).message || 'Неизвестная ошибка';
    return rejectWithValue(errorMessage);
  }
});

export const fetchCurrentUser = createAsyncThunk<User, void, { rejectValue: string }>(
  'users/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Токен отсутствует');
      }

      const apiInstance = api.getApiInstance();
      const response = await apiInstance.get('/user/current/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.data || !response.data.id) {
        throw new Error('Не удалось загрузить данные о текущем пользователе');
      }

      return response.data;
    } catch (err) {
      const errorMessage = (err as Error).message || 'Неизвестная ошибка';
      return rejectWithValue(errorMessage);
    }
  },
);

const initialState: UserState = {
  isAuthenticated: false,
  availableUsers: JSON.parse(localStorage.getItem('users') || '[]'),
  selectedUsers: [],
  currentUser: { id: null, username: '', avatar: null },
  isLoading: false,
  isLoaded: false,
  error: null,
};

export const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setSelectedUsers: (state, action: PayloadAction<User[]>) => {
      state.selectedUsers = action.payload;
    },
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
    },
    setUserDetails: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
    },
    clearCurrentUser: (state) => {
      state.currentUser = { id: null, username: '', avatar: null };
      state.isAuthenticated = false;
    },
    clearAuthData: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh');
      localStorage.removeItem('isAuthenticated');
      state.isAuthenticated = false;
      state.currentUser = { id: null, username: '', avatar: null };
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
        state.error = action.payload || 'Ошибка при загрузке пользователей';
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
        state.error = action.payload || 'Ошибка при загрузке текущего пользователя';
        state.isAuthenticated = false;
      });
  },
});

export const {
  setAuthenticated,
  setSelectedUsers,
  setCurrentUser,
  setUserDetails,
  clearCurrentUser,
  clearAuthData,
} = userSlice.actions;

export const selectCurrentUser = (state: { users: UserState }) => state.users.currentUser;
export const selectIsAuthenticated = (state: { users: UserState }) => state.users.isAuthenticated;

export default userSlice.reducer;
