import { useState } from 'react';
import { Routes, Route, useNavigate, Navigate, useParams } from 'react-router-dom';
import { $api } from './components/api';
import { useChatData } from './components/ChatContext';
import Header from './components/Header.jsx';
import ChatList from './components/ChatList.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import LoginPage from './components/LoginPage.jsx';
import RegisterPage from './components/RegisterPage.jsx';
import ProfilePage from './components/ProfilePage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import './index.scss';

function App() {
  const { chats, addChat, setChats } = useChatData();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChatId, setSelectedChatId] = useState(null);
  const navigate = useNavigate();

  const handleSearch = (term) => setSearchTerm(term);

  const handleChatSelect = (chat) => {
    setSelectedChatId(chat.id);
    navigate(`/chat/${chat.id}`);
  };

  // 📡 Отправка нового сообщения
  const handleMessageSend = async (chatId, newMessage) => {
    if (!chatId || !newMessage?.text?.trim()) {
      console.warn('Invalid message or chatId');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        console.error('No token found in localStorage');
        return;
      }

      const url = `/api/chats/${chatId}/messages/`;

      const response = await $api.post(
        url,
        { text: newMessage.text },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      console.log('Message successfully sent:', response.data);

      const updatedChats = chats.map((chat) =>
        chat.id === chatId ? { ...chat, messages: [...chat.messages, response.data] } : chat,
      );

      saveChatsToLocalStorage(updatedChats);
      setChats(updatedChats);
    } catch (error) {
      console.error('Error sending message:', {
        message: error.message,
        status: error.response?.status,
        url: `/api/chats/${chatId}/messages/`,
        data: error.response?.data,
      });
    }
  };

  const saveChatsToLocalStorage = (updatedChats) => {
    try {
      const sanitizedChats = updatedChats.map((chat) => ({
        id: chat.id,
        title: chat.title || 'Unknown Chat',
        messages: chat.messages || [],
      }));

      localStorage.setItem('chats', JSON.stringify(sanitizedChats));
    } catch (error) {
      console.error('Failed to save chats to localStorage:', {
        message: error.message,
      });
    }
  };

  const handleBackClick = () => {
    setSelectedChatId(null);
    navigate('/');
  };

  return (
    <div className="container">
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<LoginPage onLogin={() => setIsAuthenticated(true)} />} />

        {/* Register Route */}
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Route для отображения чатов */}
        <Route
          path="/"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Header
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onSearch={handleSearch}
                onProfileClick={() => navigate('/profile')}
              />
              <ChatList chats={chats} onChatSelect={handleChatSelect} searchTerm={searchTerm} />
            </ProtectedRoute>
          }
        />

        {/* Компонент маршрута для отображения чатов */}
        <Route
          path="/chat/:id"
          element={
            <ChatRoute
              chats={chats}
              onSendMessage={handleMessageSend}
              onBackClick={handleBackClick}
            />
          }
        />

        {/* Профиль */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

// Компонент маршрута для отображения чатов
function ChatRoute({ chats, onSendMessage, onBackClick }) {
  const { id } = useParams();
  const chat = chats.find((chat) => chat.id === id);

  if (!chat) return <div>Chat not found</div>;

  return (
    <ChatWindow onSendMessage={onSendMessage} onBackClick={onBackClick} selectedChatId={chat.id} />
  );
}

export default App;
