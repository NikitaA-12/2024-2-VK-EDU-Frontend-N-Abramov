import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import ChatItem from './ChatItem';
import Modal from './Modal';
import { fetchChats, removeChatFromState } from '../store/chatsSlice';
import $api from '../api/api';

const ChatList = ({ onChatSelect, searchTerm }) => {
  const { chats, currentChatId, isLoading, error } = useSelector((state) => state.chats);
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatName, setChatName] = useState('');
  const [deletingChatId, setDeletingChatId] = useState(null);

  useEffect(() => {
    dispatch(fetchChats({ page: 1, pageSize: 10, searchTerm: '' }));
  }, [dispatch]);

  const saveChatsToLocalStorage = (updatedChats) => {
    try {
      localStorage.setItem('chats', JSON.stringify(updatedChats));
      console.log('Chats saved to localStorage');
    } catch (error) {
      console.error('Failed to save chats to localStorage:', error.message);
    }
  };

  const deleteChat = async (chatId) => {
    setDeletingChatId(chatId);
    try {
      console.log(`Deleting chat with ID: ${chatId}`);
      await $api.delete(`/chat/${chatId}/`);

      dispatch(removeChatFromState(chatId));

      const updatedChats = chats.filter((chat) => chat.id !== chatId);
      saveChatsToLocalStorage(updatedChats);

      console.log('Chat deleted successfully');
    } catch (error) {
      console.error('Error deleting chat:', error.message);
    } finally {
      setDeletingChatId(null);
    }
  };

  const handleCreateChat = async (title, isPrivate) => {
    try {
      console.log(`Creating chat with title: "${title}"`);
      const response = await $api.post('/chats/', {
        title,
        is_private: isPrivate,
      });

      const newChat = {
        ...response.data,
        created_at: new Date(response.data.created_at),
        updated_at: new Date(response.data.updated_at),
      };

      console.log('New chat received from API:', newChat);

      const updatedChats = [newChat, ...chats];
      dispatch(fetchChats({ page: 1, pageSize: 10, searchTerm: '' }));
      saveChatsToLocalStorage(updatedChats);

      console.log('New chat created and state updated');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create chat:', error.message);
    }
  };

  const filteredChats = Array.isArray(chats)
    ? chats.filter((chat) => chat.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  if (isLoading) {
    return (
      <div className="loadingChatsWrapper">
        <span>Загрузка чатов</span>
      </div>
    );
  }

  if (error) {
    return <div>Error loading chats: {error}</div>;
  }

  return (
    <div className="chatlist">
      <div className="chatlist-container">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isActive={chat.id === currentChatId}
              onClick={() => onChatSelect(chat)}
              onDelete={() => deleteChat(chat.id)}
              lastMessageContent={chat.last_message?.content || 'Нет сообщений'}
              isDeleting={deletingChatId === chat.id}
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
