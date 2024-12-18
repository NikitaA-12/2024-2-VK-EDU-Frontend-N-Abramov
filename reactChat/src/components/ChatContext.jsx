import { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { $api } from './api';

const ChatContext = createContext();

export const useChatData = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getToken = () => {
    const token = localStorage.getItem('token');
    console.log('Retrieved token:', token);
    return token;
  };

  // Fetch messages for a specific chat
  const fetchMessages = async (chatId) => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await $api.get('/messages/', {
        headers: { Authorization: `Bearer ${token}` },
        params: { chat: chatId, page: 1, page_size: 50 },
      });

      const fetchedMessages = response.data?.results || [];
      const sortedMessages = fetchedMessages.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at),
      );

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                last_message: sortedMessages.at(-1) || null,
              }
            : chat,
        ),
      );

      const updatedChats = chats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              last_message: sortedMessages.at(-1) || null,
            }
          : chat,
      );

      localStorage.setItem('chats', JSON.stringify(updatedChats));
    } catch (err) {
      console.error('Ошибка загрузки сообщений:', err.message);
    }
  };

  // Fetch all chats
  const fetchChats = async () => {
    try {
      const token = getToken();
      if (!token) {
        setError('Token отсутствует');
        return;
      }

      setIsLoading(true);
      setError(null);

      const response = await $api.get('/chats/', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, page_size: pageSize, search: searchTerm },
      });

      const adaptedChats =
        response.data?.results?.map((chat) => ({
          id: chat.id,
          title: chat.title,
          members: chat.members,
          creator: chat.creator,
          avatar: chat.avatar,
          created_at: new Date(chat.created_at),
          updated_at: new Date(chat.updated_at),
          is_private: chat.is_private,
          last_message: chat.last_message,
          unread_messages_count: parseInt(chat.unread_messages_count, 10) || 0,
        })) || [];

      setChats(adaptedChats);
      localStorage.setItem('chats', JSON.stringify(adaptedChats));
    } catch (err) {
      console.error('Ошибка загрузки чатов:', {
        status: err.response?.status,
        message: err.message,
      });

      try {
        const storedChats = JSON.parse(localStorage.getItem('chats') || '[]');
        if (Array.isArray(storedChats)) {
          setChats(storedChats);
          console.log('Loaded chats from local storage');
        }
      } catch (storageError) {
        console.error('Ошибка чтения из localStorage:', storageError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onChatSelect = async (chatId) => {
    setSelectedChatId(chatId);
    setCurrentChatId(chatId);

    console.log(`Выбран чат ${chatId}`);

    try {
      await fetchMessages(chatId);
    } catch (error) {
      console.error('Ошибка загрузки сообщений после выбора чата:', error.message);
      setError('Ошибка загрузки сообщений');
    }
  };

  const createChat = async (title, isPrivate, membersArray = []) => {
    try {
      const token = getToken();
      if (!token) return;

      const chatsData = JSON.parse(localStorage.getItem('chats') || '[]');

      const members = chatsData
        .flatMap((chat) => chat.members.map((member) => member.id))
        .filter(Boolean);

      const uniqueMembers = Array.from(new Set([...members, ...membersArray]));

      if (uniqueMembers.length === 0) {
        setError('Добавьте участников для создания чата.');
        return;
      }

      const response = await $api.post(
        '/chats/',
        {
          title: title.trim(),
          members: uniqueMembers.slice(0, 100),
          is_private: isPrivate,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const newChat = {
        ...response.data,
        created_at: new Date(response.data.created_at),
        updated_at: new Date(response.data.updated_at),
      };

      const updatedChats = [newChat, ...chatsData];
      localStorage.setItem('chats', JSON.stringify(updatedChats));
      setChats(updatedChats);

      console.log('Обновленные чаты:', updatedChats);
    } catch (error) {
      console.error('Ошибка создания чата:', error.message);
      setError('Ошибка создания чата');
    }
  };

  return (
    <ChatContext.Provider
      value={{
        searchTerm,
        setSearchTerm,
        chats,
        setChats,
        messages,
        currentChatId,
        setCurrentChatId,
        createChat,
        onChatSelect,
        fetchChats,
        isLoading,
        error,
      }}>
      {children}
    </ChatContext.Provider>
  );
};

ChatProvider.propTypes = {
  children: PropTypes.node.isRequired,
};