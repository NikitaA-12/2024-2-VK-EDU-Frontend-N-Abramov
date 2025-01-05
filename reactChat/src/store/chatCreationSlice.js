import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { $api } from '../api/api'
import { updateChats } from './chatsSlice'

export const createChat = createAsyncThunk(
  'chatCreation/createChat',
  async ({ title, isPrivate, membersArray = [] }, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Токен отсутствует')
      }

      const chatsData = JSON.parse(localStorage.getItem('chats')) || []
      const members = chatsData
        .flatMap((chat) => chat.members.map((member) => member.id))
        .filter((id) => id)

      const uniqueMembers = Array.from(new Set([...members, ...membersArray]))

      if (uniqueMembers.length === 0) {
        return rejectWithValue('Добавьте участников для создания чата.')
      }

      const response = await $api.post(
        '/chats/',
        {
          title: title.trim(),
          members: uniqueMembers.slice(0, 100),
          is_private: isPrivate
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const newChat = {
        ...response.data,
        created_at: new Date(response.data.created_at).toISOString(),
        updated_at: new Date(response.data.updated_at).toISOString()
      }

      dispatch(updateChats(newChat))

      const updatedChats = [newChat, ...chatsData]
      localStorage.setItem('chats', JSON.stringify(updatedChats))

      return newChat
    } catch (err) {
      console.error('Failed to create chat:', err.message)
      return rejectWithValue(err.response?.data || err.message)
    }
  }
)

const chatCreationSlice = createSlice({
  name: 'chatCreation',
  initialState: {
    isLoading: false,
    error: null,
    newChat: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createChat.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createChat.fulfilled, (state, action) => {
        state.isLoading = false
        state.newChat = action.payload
      })
      .addCase(createChat.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export default chatCreationSlice.reducer
