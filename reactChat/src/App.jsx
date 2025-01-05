import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  useParams,
  HashRouter,
} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Header from './components/Header.jsx';
import ChatList from './components/ChatList.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import LoginPage from './components/LoginPage.jsx';
import RegisterPage from './components/RegisterPage.jsx';
import ProfilePage from './components/ProfilePage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Modal from './components/Modal.jsx';
import AddIcon from '@mui/icons-material/Add';
import { fetchChats, setSearchTerm, setCurrentChatId } from './store/chatsSlice.js';
import { fetchUsers } from './store/userSlice';
import { sendMessage } from './store/messagesSlice';
import './index.scss';

function App() {
  const { chats = [], currentChatId, searchTerm, isLoading } = useSelector((state) => state.chats);
  const { availableUsers = [], isLoading: usersLoading } = useSelector((state) => state.users);
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (!chats.length) {
        dispatch(fetchChats({ page: 1, pageSize: 10, searchTerm: '' }));
      }

      if (!availableUsers.length) {
        dispatch(fetchUsers({ userPageSize: 10 }));
      }
    }
  }, [dispatch, chats.length, availableUsers.length, isAuthenticated]);

  const handleSearch = (term) => {
    dispatch(setSearchTerm(term));
  };

  const handleChatSelect = (chat) => {
    dispatch(setCurrentChatId(chat.id));
    navigate(`/chat/${chat.id}`);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleCreateChat = async (chatTitle, isPrivate, membersArray = []) => {
    try {
      console.log('Создание чата:', { chatTitle, isPrivate, membersArray });
      closeModal();
    } catch (error) {
      console.error('Не удалось создать чат:', error.message);
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      console.log('Удаление чата:', chatId);
      navigate('/');
    } catch (error) {
      console.error('Не удалось удалить чат:', error.message);
    }
  };

  const handleMessageSend = async (chatId, newMessage) => {
    try {
      dispatch(sendMessage({ chatId, newMessage }));
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error.message);
    }
  };

  const handleBackClick = () => navigate('/');

  const isOnChatListPage = location.pathname === '/';

  return (
    <HashRouter>
      <div className="container">
        {isOnChatListPage && (
          <div className="quickBtn">
            <button className="createChatButton" onClick={openModal}>
              <AddIcon />
            </button>
          </div>
        )}

        <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
          />
          <Route
            path="/"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Header
                  searchTerm={searchTerm}
                  setSearchTerm={handleSearch}
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
                  isLoading={isLoading || usersLoading}
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
          <Route
            path="/profile"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ProfilePage availableUsers={availableUsers} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {isModalOpen && (
          <Modal isOpen={isModalOpen} onClose={closeModal} onCreate={handleCreateChat} />
        )}
      </div>
    </HashRouter>
  );
}

function ChatRoute({ chats, currentChatId, onSendMessage, onBackClick, onDeleteChat }) {
  const { id } = useParams();
  const chat = chats.find((chat) => chat.id === currentChatId || chat.id === id);

  if (!chat) return <div>Чат не найден. Пожалуйста, попробуйте снова.</div>;

  return (
    <ChatWindow
      chatId={chat.id}
      onSendMessage={onSendMessage}
      onBackClick={onBackClick}
      onDeleteChat={() => onDeleteChat(chat.id)}
    />
  );
}

App.propTypes = {
  chats: PropTypes.array.isRequired,
  currentChatId: PropTypes.string.isRequired,
  searchTerm: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  availableUsers: PropTypes.array.isRequired,
  isModalOpen: PropTypes.bool.isRequired,
  handleSearch: PropTypes.func.isRequired,
  handleChatSelect: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  handleCreateChat: PropTypes.func.isRequired,
  handleDeleteChat: PropTypes.func.isRequired,
  handleMessageSend: PropTypes.func.isRequired,
  handleBackClick: PropTypes.func.isRequired,
};

ChatRoute.propTypes = {
  chats: PropTypes.array.isRequired,
  currentChatId: PropTypes.string.isRequired,
  onSendMessage: PropTypes.func.isRequired,
  onBackClick: PropTypes.func.isRequired,
  onDeleteChat: PropTypes.func.isRequired,
};

export default App;
