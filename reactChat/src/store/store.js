import { configureStore } from '@reduxjs/toolkit'
import chatsReducer from './chatsSlice'
import chatCreationReducer from './chatCreationSlice'
import messagesReducer from './messagesSlice'
import userReducer from './userSlice'

export const store = configureStore({
  reducer: {
    chats: chatsReducer,
    chatCreation: chatCreationReducer,
    messages: messagesReducer,
    users: userReducer
  }
})
