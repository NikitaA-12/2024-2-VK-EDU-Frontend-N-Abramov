import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useChatData } from './ChatContext';
import ChatItem from './ChatItem';
import Modal from './Modal';
import { $api } from './api.js';

const ChatList = ({ onChatSelect, searchTerm }) => {
  const { chats, setChats } = useChatData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newChatId, setNewChatId] = useState(null);
  const [chatName, setChatName] = useState('');

  // Сортировка чатов по последнему сообщению
  useEffect(() => {
    const sortedChats = [...chats].sort((a, b) => {
      const lastMessageA = new Date(a.last_message?.time || 0).getTime();
      const lastMessageB = new Date(b.last_message?.time || 0).getTime();
      return lastMessageB - lastMessageA;
    });

    if (JSON.stringify(sortedChats) !== JSON.stringify(chats)) {
      setChats(sortedChats);
    }
  }, [chats, setChats]);

  // Сброс ID нового чата через 300 мс после создания
  useEffect(() => {
    if (newChatId !== null) {
      const timer = setTimeout(() => setNewChatId(null), 300);
      return () => clearTimeout(timer);
    }
  }, [newChatId]);

  // Удаление чата через API
  const deleteChat = async (chatId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token not found');
        return;
      }

      await $api.delete(`/chats/${chatId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedChats = chats.filter((chat) => chat.id !== chatId);
      setChats(updatedChats);
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  // Фильтрация чатов по поисковому запросу
  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="chatlist">
      <div className="chatlist-container">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <ChatItem
              key={chat.id}
              title={chat.title}
              avatar={chat.avatar}
              lastMessage={chat.last_message}
              unreadMessagesCount={chat.unread_messages_count}
              onClick={() => onChatSelect(chat)}
              onDelete={() => deleteChat(chat.id)}
            />
          ))
        ) : (
          <div>No chats available</div>
        )}
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={(title, isPrivate) => handleCreateChat(title, isPrivate)}
        chatName={chatName}
        setChatName={setChatName}
      />
    </div>
  );
};

ChatList.propTypes = {
  onChatSelect: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
};

export default ChatList;
