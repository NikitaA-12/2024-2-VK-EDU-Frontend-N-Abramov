import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useChatData } from './components/ChatContext';
import Header from './components/Header.jsx';
import ChatList from './components/ChatList.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import LoginPage from './components/LoginPage.jsx';
import RegisterPage from './components/RegisterPage.jsx';
import ProfilePage from './components/ProfilePage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Modal from './components/Modal.jsx';
import AddIcon from '@mui/icons-material/Add';
import './index.scss';

function App() {
  const { chats, currentChatId, setCurrentChatId, createChat, deleteChat, sendMessage, setChats } =
    useChatData();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (term) => setSearchTerm(term);

  const handleChatSelect = (chat) => {
    setCurrentChatId(chat.id);
    navigate(`/chat/${chat.id}`);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleCreateChat = async (chatTitle, isPrivate, membersArray = []) => {
    try {
      await createChat(chatTitle, isPrivate, membersArray);
      closeModal();
    } catch (error) {
      console.error('Failed to create chat:', error.message);
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await deleteChat(chatId);
      console.log(`Chat with ID ${chatId} deleted successfully`);
      navigate('/');
    } catch (error) {
      console.error(`Failed to delete chat with ID ${chatId}:`, error.message);
    }
  };

  const handleMessageSend = async (chatId, newMessage) => {
    try {
      await sendMessage(chatId, newMessage);
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
  };

  const handleBackClick = () => navigate('/');

  const isOnChatListPage = location.pathname === '/';

  return (
    <div className="container">
      {isOnChatListPage && (
        <div className="quickBtn">
          <button className="createChatButton" onClick={openModal}>
            <AddIcon />
          </button>
        </div>
      )}

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
                onDeleteChat={handleDeleteChat}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:id"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ChatRoute
                chats={chats}
                currentChatId={currentChatId}
                onSendMessage={handleMessageSend}
                onBackClick={handleBackClick}
                onDeleteChat={handleDeleteChat}
              />
            </ProtectedRoute>
          }
        />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={closeModal} onCreate={handleCreateChat} />
      )}
    </div>
  );
}

function ChatRoute({ chats, currentChatId, onSendMessage, onBackClick, onDeleteChat }) {
  const { id } = useParams();
  const chat = chats.find((chat) => chat.id === id);

  if (!chat) return <div>Chat not found. Please try again.</div>;

  return (
    <ChatWindow
      chatId={id}
      onSendMessage={onSendMessage}
      onBackClick={onBackClick}
      onDeleteChat={() => onDeleteChat(chat.id)}
    />
  );
}

export default App;