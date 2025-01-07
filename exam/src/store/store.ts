import { configureStore } from '@reduxjs/toolkit';
import translationReducer from './translationSlice';

export const store = configureStore({
  reducer: {
    translation: translationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
