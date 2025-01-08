import { configureStore } from '@reduxjs/toolkit';
import chatCreationReducer from './chatCreationSlice';
import userReducer from './userSlice';
import chatsReducer from './chatsSlice';

export const store = configureStore({
  reducer: {
    chatCreation: chatCreationReducer,
    users: userReducer,
    chats: chatsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
