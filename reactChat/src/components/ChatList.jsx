import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useChatData } from './ChatContext';
import ChatItem from './ChatItem';
import Modal from './Modal';
import $api from './api';

const ChatList = ({ onChatSelect, searchTerm }) => {
  const { chats, setChats, currentChatId } = useChatData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatName, setChatName] = useState('');
  const [deletingChatId, setDeletingChatId] = useState(null);

  const saveChatsToLocalStorage = (updatedChats) => {
    try {
      localStorage.setItem('chats', JSON.stringify(updatedChats));
      console.log('Chats saved to localStorage');
    } catch (error) {
      console.error('Failed to save chats to localStorage:', error.message);
    }
  };

  useEffect(() => {
    const updatedChats = [...chats].sort((a, b) => {
      const lastMessageA = a.last_message?.created_at
        ? new Date(a.last_message.created_at).getTime()
        : 0;
      const lastMessageB = b.last_message?.created_at
        ? new Date(b.last_message.created_at).getTime()
        : 0;

      if (lastMessageB !== lastMessageA) return lastMessageB - lastMessageA;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    if (JSON.stringify(updatedChats) !== JSON.stringify(chats)) {
      console.log('Chats updated and sorted');
      setChats(updatedChats);
      saveChatsToLocalStorage(updatedChats);
    }
  }, [chats, setChats]);

  const deleteChat = async (chatId) => {
    setDeletingChatId(chatId);
    try {
      console.log(`Deleting chat with ID: ${chatId}`);
      await $api.delete(`/chat/${chatId}/`);

      const updatedChats = chats.filter((chat) => chat.id !== chatId);
      setChats(updatedChats);
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
      setChats(updatedChats);
      saveChatsToLocalStorage(updatedChats);

      console.log('New chat created and state updated');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create chat:', error.message);
    }
  };

  const filteredChats = searchTerm
    ? chats.filter((chat) => chat.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : chats;

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
              lastMessageTime={
                chat.last_message?.created_at ? formatTime(chat.last_message.created_at) : ''
              }
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
