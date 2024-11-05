import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useChatData } from './chat-data.js';
import ChatItem from './ChatItem';
import Modal from './Modal';
import AddIcon from '@mui/icons-material/Add';

const ChatList = ({ onChatSelect, searchTerm }) => {
  const { chatData, setChatData } = useChatData();
  const [chats, setChats] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newChatId, setNewChatId] = useState(null);

  // Загружаем чаты из состояния при монтировании компонента
  useEffect(() => {
    // Сортируем чаты по времени последнего сообщения
    const sortedChats = chatData.chats.sort((a, b) => {
      const lastMessageA = a.messages[a.messages.length - 1]?.time || 0;
      const lastMessageB = b.messages[b.messages.length - 1]?.time || 0;
      return new Date(lastMessageB) - new Date(lastMessageA); // Сортируем по убыванию
    });
    setChats(sortedChats);
  }, [chatData]);

  // Логика фильтрации чатов на основе searchTerm
  const filteredChats = chats.filter((chat) =>
    chat.chatName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const deleteChat = (chatId) => {
    const updatedChats = chats.filter((chat) => chat.chatId !== chatId);
    setChatData({ chats: updatedChats });
    setChats(updatedChats);
  };

  const handleCreateChat = (chatName) => {
    if (!chatName.trim()) return;

    const newChat = {
      chatId: chats.length > 0 ? Math.max(...chats.map((chat) => chat.chatId)) + 1 : 1,
      chatName: chatName,
      participants: [chatName, 'You'],
      messages: [],
    };

    // Добавляем новый чат в начало списка
    const updatedChats = [newChat, ...chats];
    setChatData({ chats: updatedChats });
    setChats(updatedChats);
    setNewChatId(newChat.chatId);
    setIsModalOpen(false);
  };

  const onSendMessage = (chatId, message) => {
    const updatedChats = chats.map((chat) => {
      if (chat.chatId === chatId) {
        const updatedMessages = [...chat.messages, message];
        return { ...chat, messages: updatedMessages };
      }
      return chat;
    });

    setChatData({ chats: updatedChats });
    setChats(updatedChats);
  };

  return (
    <div className="chatlist">
      <div className="quickBtn">
        <button className="createChatButton" onClick={() => setIsModalOpen(true)}>
          <AddIcon />
        </button>
      </div>
      <div className="chatlist-container">
        {filteredChats.map((chat) => (
          <ChatItem
            key={chat.chatId}
            chat={chat}
            onChatClick={onChatSelect}
            onDelete={deleteChat}
            onSendMessage={onSendMessage}
            isNew={chat.chatId === newChatId}
          />
        ))}
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateChat}
      />
    </div>
  );
};

ChatList.propTypes = {
  onChatSelect: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
};

export default ChatList;
