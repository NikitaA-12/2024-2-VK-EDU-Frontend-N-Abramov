import { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Header from './components/Header';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ProfilePage from './components/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import Modal from './components/Modal';
import AddIcon from '@mui/icons-material/Add';
import { fetchChats, setSearchTerm, setCurrentChatId } from './store/chatsSlice';
import { fetchUsers, setAuthenticated } from './store/userSlice';
import { sendMessage } from './store/messagesSlice';
import './index.scss';

export interface Chat {
  id: string;
  title: string;
}

export interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  bio: string;
  avatar: string | null;
}

interface RootState {
  chats: {
    chats: Chat[];
    currentChatId: string | null;
    searchTerm: string;
    isLoading: boolean;
  };
  users: {
    availableUsers: User[];
    isLoading: boolean;
    isAuthenticated: boolean;
  };
}

interface SendMessageArgs {
  chatId: string;
  text: string;
}

function App() {
  const {
    chats = [],
    currentChatId,
    searchTerm,
    isLoading,
  } = useSelector((state: RootState) => state.chats || {});
  const {
    availableUsers = [],
    isLoading: usersLoading,
    isAuthenticated,
  } = useSelector((state: RootState) => state.users || {});
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatName, setChatName] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    dispatch(setAuthenticated(!!token));
  }, [dispatch]);

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

  const handleSearch = useCallback(
    (term: string) => {
      dispatch(setSearchTerm(term));
    },
    [dispatch],
  );

  const handleChatSelect = useCallback(
    (chat: Chat) => {
      dispatch(setCurrentChatId(chat.id));
      navigate(`/chat/${chat.id}`);
    },
    [dispatch, navigate],
  );

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleCreateChat = async (
    chatTitle: string,
    isPrivate: boolean,
    membersArray: string[] = [],
  ) => {
    closeModal();
  };

  const handleDeleteChat = async (chatId: string) => {
    navigate('/');
  };

  const handleMessageSend = useCallback(
    async (chatId: string, text: string) => {
      const args: SendMessageArgs = { chatId, text };
      dispatch(sendMessage(args));
    },
    [dispatch],
  );

  const handleBackClick = () => navigate('/');

  const isOnChatListPage = location.pathname === '/';

  const filteredChats = useMemo(() => {
    return searchTerm
      ? chats.filter((chat) => chat.title.toLowerCase().includes(searchTerm.toLowerCase()))
      : chats;
  }, [chats, searchTerm]);

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
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" />
            ) : (
              <LoginPage onLogin={() => dispatch(setAuthenticated(true))} />
            )
          }
        />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Header
                searchTerm={searchTerm}
                setSearchTerm={handleSearch}
                onSearch={() => {}}
                onProfileClick={() => navigate('/profile')}
              />
              <ChatList
                chats={filteredChats}
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
          element={<ProfilePage availableUsers={availableUsers} navigate={navigate} />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          onCreate={handleCreateChat}
          chatName={chatName}
          setChatName={setChatName}
        />
      )}
    </div>
  );
}

interface ChatRouteProps {
  chats: Chat[];
  currentChatId: string | null;
  onSendMessage: (chatId: string, text: string) => void;
  onBackClick: () => void;
  onDeleteChat: (chatId: string) => void;
}

function ChatRoute({
  chats,
  currentChatId,
  onSendMessage,
  onBackClick,
  onDeleteChat,
}: ChatRouteProps) {
  const { id } = useParams<{ id: string }>();
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

export default App;
