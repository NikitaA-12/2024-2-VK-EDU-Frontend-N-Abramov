import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useParams } from 'react-router-dom';
import { $api, fetchMessages } from './components/api';
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
  const navigate = useNavigate();

  // Поиск чатов
  const handleSearch = (term) => setSearchTerm(term);

  const handleChatSelect = (chat) => {
    navigate(`/chat/${chat.id}`);
  };

  const handleMessageSend = async (chatId, newMessage) => {
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
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log('Message successfully sent:', response.data);

      const updatedChats = chats.map((chat) =>
        chat.id === chatId
          ? { ...chat, messages: [...(chat.messages || []), response.data] }
          : chat,
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
      console.error('Failed to save chats to localStorage:', error.message);
    }
  };

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div className="container">
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={() => setIsAuthenticated(true)} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Header
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onSearch={setSearchTerm}
                onProfileClick={() => navigate('/profile')}
              />
              <ChatList
                chats={
                  searchTerm
                    ? chats.filter((chat) =>
                        chat.title.toLowerCase().includes(searchTerm.toLowerCase()),
                      )
                    : chats
                }
                onChatSelect={handleChatSelect}
                searchTerm={searchTerm}
              />
            </ProtectedRoute>
          }
        />

        {/* Отображение сообщений в чате */}
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

        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function ChatRoute({ chats, onSendMessage, onBackClick }) {
  const { id } = useParams();
  const chat = chats.find((chat) => chat.id === id);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (chat) {
      const loadMessages = async () => {
        try {
          const fetchedMessages = await fetchMessages(chat.id);
          setMessages(fetchedMessages);
        } catch (error) {
          console.error('Failed to fetch messages:', error.message);
        }
      };

      loadMessages();
    }
  }, [chat]);

  if (!chat) return <div>Chat not found</div>;

  return (
    <ChatWindow
      chatId={chat.id}
      messages={messages}
      onSendMessage={onSendMessage}
      onBackClick={onBackClick}
    />
  );
}

export default App;
