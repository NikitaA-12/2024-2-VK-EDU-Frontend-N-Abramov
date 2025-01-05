import axios from 'axios'
import { Centrifuge } from 'centrifuge'

const $api = axios.create({
  baseURL: 'https://vkedu-fullstack-div2.ru/api/',
  headers: {
    'Content-Type': 'application/json'
  }
})

const clearAuthData = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('refresh')
  localStorage.removeItem('isAuthenticated')
}

const refreshAuthToken = async (refreshToken) => {
  try {
    const response = await axios.post(`${$api.defaults.baseURL}/auth/refresh/`, {
      refresh: refreshToken
    })
    localStorage.setItem('token', response.data.access)
    return response.data.access
  } catch (error) {
    console.error('Refresh token expired or invalid:', error.message)
    clearAuthData()
    throw error
  }
}

const getAuthData = () => {
  return {
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refresh')
  }
}

const checkAuthStatus = async () => {
  const { token, refreshToken } = getAuthData()

  if (token) {
    return true
  } else if (refreshToken) {
    try {
      await refreshAuthToken(refreshToken)
      return true
    } catch (error) {
      return false
    }
  } else {
    return false
  }
}

$api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request error:', error.message)
    return Promise.reject(error)
  }
)

$api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status

    if (status === 401) {
      const refreshToken = localStorage.getItem('refresh')

      if (refreshToken) {
        try {
          const response = await axios.post(`${$api.defaults.baseURL}/auth/refresh/`, {
            refresh: refreshToken
          })
          localStorage.setItem('token', response.data.access)
          error.config.headers.Authorization = `Bearer ${response.data.access}`
          return $api.request(error.config)
        } catch (refreshError) {
          console.error('Refresh token expired or invalid:', refreshError.message)
          clearAuthData()
          window.location.href = '/#/login'
        }
      } else {
        console.warn('No refresh token found. Redirecting to login.')
        clearAuthData()
        window.location.href = '/#/login'
      }
    } else if (status >= 500) {
      console.error('Server error:', error.response?.data || error.message)
    } else if (status === 404) {
      console.error('Resource not found:', error.response?.data)
    } else {
      console.error('Response error:', error.response?.data || error.message)
    }
    return Promise.reject(error)
  }
)

const initAndStartCentrifugo = (chatId, onMessage) => {
  const centrifuge = new Centrifuge('wss://vkedu-fullstack-div2.ru/connection/websocket/')
  centrifuge.connect()

  const subscription = centrifuge.subscribe(`chat:${chatId}`, (message) => {
    if (message.data) {
      onMessage(message.data)
    }
  })

  subscription.on('error', (err) => {
    console.error(`Centrifugo subscription error for chat:${chatId}`, err)
  })

  subscription.on('subscribe', () => {
    console.log(`Subscribed to chat:${chatId}`)
  })

  return { centrifuge, subscription }
}

const createChat = async (chatName) => {
  try {
    const response = await $api.post('/chats/', { title: chatName.trim() })
    return response.data
  } catch (error) {
    console.error('Error creating chat:', error.response?.data || error.message)
    throw error
  }
}

const deleteChat = async (chatId) => {
  try {
    console.log(`Attempting to delete chat with ID: ${chatId}`)
    await $api.delete(`/chats/${chatId}/`)
    console.log(`Chat with ID ${chatId} deleted successfully`)
  } catch (error) {
    if (error.response?.status === 404) {
      console.error(`Chat with ID ${chatId} not found on server`)
    } else {
      console.error('API Error deleting chat:', error.response?.data || error.message)
    }
    throw error
  }
}

const sendMessage = async (chatId, messageText) => {
  try {
    const response = await $api.post('/message/', {
      chat_id: chatId,
      text: messageText
    })
    return response.data
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message)
    throw error
  }
}

export const fetchUsers = async ({ search = '', page = 1, pageSize = 10 }) => {
  try {
    const response = await $api.get('/users/', {
      params: {
        search,
        page,
        pageSize
      }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching users:', error.response?.data || error.message)
    throw error
  }
}

const fetchMessages = async (chatId) => {
  try {
    const response = await $api.get(`/messages/?chat=${chatId}`)
    return response.data
  } catch (error) {
    console.error('API Error fetching messages:', error.message)

    if (error.response) {
      const status = error.response.status
      if (status === 404) {
        throw new Error('Chat not found')
      }
      if (status === 500) {
        throw new Error('Server error while fetching messages')
      }
      throw new Error('Unexpected error occurred while fetching messages')
    } else {
      throw new Error('No response from server')
    }
  }
}

const fetchChats = async () => {
  try {
    const response = await $api.get('/chats/')
    return response.data.results
  } catch (error) {
    console.error('Error fetching chats:', error.message)
    throw error
  }
}

const createCancelToken = () => {
  const source = axios.CancelToken.source()
  return source
}

export default $api
export {
  $api,
  initAndStartCentrifugo,
  sendMessage,
  fetchMessages,
  createChat,
  fetchChats,
  deleteChat,
  createCancelToken,
  checkAuthStatus,
  refreshAuthToken,
  clearAuthData
}
