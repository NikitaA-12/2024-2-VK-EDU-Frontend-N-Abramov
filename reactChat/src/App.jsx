import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import Header from './components/Header.jsx';
import ChatList from './components/ChatList.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import Modal from './components/Modal.jsx';
import { useChatData } from './components/ChatContext';
import ProfilePage from './components/ProfilePage.jsx';
import avatar1 from './assets/1.png';
import avatar2 from './assets/2.png';
import './index.scss';

const avatars = {
  1: avatar1,
  2: avatar2,
  default: null,
};

const getAvatar = (chatId) => avatars[chatId] || avatars.default;

function App() {
  const { chats, addChat, updateChat } = useChatData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Открытие и закрытие модального окна
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Создание нового чата
  const createChat = (chatName) => {
    if (!chatName.trim()) return; // Проверка на пустое имя
    addChat(chatName);
    closeModal();
  };

  // Поиск чатов
  const handleSearch = (term) => setSearchTerm(term);

  // Выбор чата
  const handleChatSelect = (chat) => navigate(`/chat/${chat.chatId}`);

  // Отправка сообщения
  const handleMessageSend = (chatId, newMessage) => {
    const updatedChat = chats.find((chat) => chat.chatId === chatId);
    if (updatedChat) {
      const newMessages = [...updatedChat.messages, newMessage];
      updateChat({ ...updatedChat, messages: newMessages });
    }
  };

  // Обработчик клика на профиль
  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div className="container">
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearch={handleSearch}
        onProfileClick={handleProfileClick}
      />
      <div className="tabs">
        <div className="quickBtn">
          <button className="createChatButton" onClick={openModal}>
            <AddIcon />
          </button>
        </div>
        <ChatList chats={chats} onChatSelect={handleChatSelect} searchTerm={searchTerm} />
      </div>
      {isModalOpen && <Modal isOpen={isModalOpen} onClose={closeModal} onCreate={createChat} />}
      <Routes>
        <Route path="/" element={null} />
        <Route
          path="/chat/:id"
          element={<ChatDetails chats={chats} onSendMessage={handleMessageSend} />}
        />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </div>
  );
}

function ChatDetails({ chats, onSendMessage }) {
  const { id } = useParams();
  const chatId = parseInt(id, 10);
  const navigate = useNavigate();
  const { updateChat } = useChatData(); // Добавлено обновление контекста

  // Получение текущего чата
  const activeChat = chats.find((chat) => chat.chatId === chatId);

  useEffect(() => {
    if (!activeChat) {
      navigate('/'); // Возврат на главную, если чат не найден
    }
  }, [activeChat, navigate]);

  const handleBackClick = () => {
    // Обновляем чат перед возвратом
    if (activeChat) {
      updateChat(activeChat);
    }
    navigate('/');
  };

  if (!activeChat) {
    return null;
  }

  return (
    <ChatWindow
      activeChat={activeChat}
      avatar={getAvatar(chatId)}
      letter={activeChat.chatName.charAt(0).toUpperCase() || ''}
      onBackClick={handleBackClick}
      onSendMessage={(message) => onSendMessage(chatId, message)}
    />
  );
}

export default App;
