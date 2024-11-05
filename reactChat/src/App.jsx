import { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import Header from './components/Header.jsx';
import ChatList from './components/ChatList.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import Modal from './components/Modal.jsx';

import './styles/style.css';
import './styles/chat-list.css';
import './styles/message-input.css';
import './styles/chat-styles.css';
import './styles/modal.css';
import './styles/search-bar.css';
import './styles/delete-button.css';
import './styles/chat-item.css';

function App() {
  const [activeChat, setActiveChat] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [chatAvatar, setChatAvatar] = useState('');

  useEffect(() => {
    const storedChats = JSON.parse(localStorage.getItem('chats'));
    if (storedChats && storedChats.chats) {
      setChats(storedChats.chats);
      console.log('Загруженные чаты из localStorage:', storedChats.chats);
    } else {
      console.error('Полученные данные не являются массивом:', storedChats);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify({ chats }));
    console.log('Чаты сохранены в localStorage:', chats);
  }, [chats]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const createChat = (chatName) => {
    if (!chatName.trim()) {
      console.error('Chat name cannot be empty.');
      return;
    }

    const newChat = {
      chatId: chats.length ? Math.max(chats.map((chat) => chat.chatId)) + 1 : 1,
      chatName: chatName,
      participants: [chatName, 'You'],
      messages: [],
      letter: chatName.charAt(0).toUpperCase(),
    };

    setChats((prevChats) => [...prevChats, newChat]);
    closeModal();
  };

  const handleMessageSend = (chatId, newMessage) => {
    if (!chatId) {
      console.error('No active chat to send message.');
      return;
    }

    const updatedChats = chats.map((chat) => {
      if (chat.chatId === chatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
        };
      }
      return chat;
    });

    console.log('Обновленные чаты после отправки сообщения:', updatedChats);
    setChats(updatedChats);

    if (activeChat && activeChat.chatId === chatId) {
      setActiveChat((prevChat) => ({
        ...prevChat,
        messages: [...prevChat.messages, newMessage],
      }));
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    console.log('Текущий поисковый термин:', term);
  };

  const handleChatSelect = (chat) => {
    if (chat) {
      setActiveChat(chat);
      console.log('Выбранный чат:', chat);
      const avatarPath = `/${chat.chatId}.png`;
      setChatAvatar(checkImageExists(avatarPath));
    } else {
      console.error('Selected chat is undefined.');
    }
  };

  const checkImageExists = (src) => {
    const img = new Image();
    img.src = src;
    return img.complete ? src : '';
  };

  return (
    <div className="container">
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} onSearch={handleSearch} />
      <div className="tabs">
        <div className="quickBtn">
          <button className="createChatButton" onClick={openModal}>
            <AddIcon />
          </button>
        </div>
        <ChatList chats={chats} onChatSelect={handleChatSelect} searchTerm={searchTerm} />{' '}
        {/* Передача searchTerm */}
      </div>

      {activeChat ? (
        <ChatWindow
          activeChat={activeChat}
          avatar={chatAvatar}
          letter={activeChat.chatName.charAt(0).toUpperCase()}
          onBackClick={() => setActiveChat(null)}
          onSendMessage={handleMessageSend}
        />
      ) : (
        <div className="chatBox hide">Select a chat to start messaging</div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} onCreate={createChat} />
    </div>
  );
}

export default App;
