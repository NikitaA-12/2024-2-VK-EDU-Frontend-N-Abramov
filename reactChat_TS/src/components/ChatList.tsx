import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ChatItem from './ChatItem';
import Modal from './Modal';
import { fetchChats, removeChatFromState } from '../store/chatsSlice';
import api from '../api/api';
import { AppDispatch } from '../store/store';

interface Chat {
  id: string;
  title: string;
  last_message?: {
    content?: string;
    created_at?: string;
  };
  created_at?: string;
  updated_at?: string;
}

interface ChatsState {
  chats: Chat[];
  currentChatId: string | null;
  isLoading: boolean;
  error: string | null;
}

interface ChatListProps {
  chats: Chat[];
  onChatSelect: (chat: Chat) => void;
  searchTerm: string;
  isLoading: boolean;
  onDeleteChat: (chatId: string) => Promise<void>;
}

const ChatList: React.FC<ChatListProps> = ({ onChatSelect, searchTerm, isLoading }) => {
  const { chats, currentChatId, error } = useSelector(
    (state: { chats: ChatsState }) => state.chats,
  );
  const dispatch = useDispatch<AppDispatch>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatName, setChatName] = useState('');
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchChats({ page: 1, pageSize: 10, searchTerm: '' }));
  }, [dispatch]);

  const saveChatsToLocalStorage = (updatedChats: Chat[]) => {
    try {
      localStorage.setItem('chats', JSON.stringify(updatedChats));
    } catch (error: any) {
      console.error('Failed to save chats to localStorage:', error.message);
    }
  };

  const deleteChat = useCallback(
    async (chatId: string) => {
      setDeletingChatId(chatId);
      try {
        const apiInstance = api.getApiInstance();
        await apiInstance.delete(`/chat/${chatId}/`);
        dispatch(removeChatFromState(chatId));
        const updatedChats = chats.filter((chat) => chat.id !== chatId);
        saveChatsToLocalStorage(updatedChats);
      } catch (error: any) {
        console.error('Error deleting chat:', error.message);
      } finally {
        setDeletingChatId(null);
      }
    },
    [chats, dispatch],
  );

  const handleCreateChat = async (title: string, isPrivate: boolean) => {
    try {
      const apiInstance = api.getApiInstance();
      const response = await apiInstance.post('/chats/', {
        title,
        is_private: isPrivate,
      });

      const newChat: Chat = {
        ...response.data,
        created_at: new Date(response.data.created_at).toISOString(),
        updated_at: new Date(response.data.updated_at).toISOString(),
      };

      const updatedChats = [newChat, ...chats];
      dispatch(fetchChats({ page: 1, pageSize: 10, searchTerm: '' }));
      saveChatsToLocalStorage(updatedChats);
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Failed to create chat:', error.message);
    }
  };

  const filteredChats = useMemo(() => {
    return Array.isArray(chats)
      ? chats.filter((chat) => chat.title.toLowerCase().includes(searchTerm.toLowerCase()))
      : [];
  }, [chats, searchTerm]);

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

export default React.memo(ChatList);
