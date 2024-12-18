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
    console.log('Token retrieved from localStorage:', token);
    return token;
  };

  const fetchMessages = async (chatId) => {
    try {
      const token = getToken();
      if (!token) return;

      console.log(`Fetching messages for chatId: ${chatId}`);

      const response = await $api.get(`/messages/?chat=${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Response data for messages:', response.data);

      const fetchedMessages = Array.isArray(response.data?.results) ? response.data.results : [];

      console.log(`Fetched ${fetchedMessages.length} messages.`);

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === chatId ? { ...chat, last_message: fetchedMessages.at(-1) || null } : chat,
        ),
      );
    } catch (err) {
      console.error('Failed to fetch messages for chat', {
        chatId,
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
    }
  };

  const fetchChats = async () => {
    try {
      const token = getToken();
      if (!token) {
        setError('Token отсутствует');
        return;
      }

      console.log('Fetching chats from server...');

      setIsLoading(true);
      setError(null);

      const response = await $api.get('/chats/', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, page_size: pageSize, search: searchTerm },
      });

      console.log('Server response for fetching chats:', response.data);

      const adaptedChats = Array.isArray(response.data?.results)
        ? response.data.results.map((chat) => ({
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
          }))
        : [];

      console.log('Adapted chats:', adaptedChats);

      setChats(adaptedChats);
      localStorage.setItem('chats', JSON.stringify(adaptedChats));
    } catch (err) {
      console.error('Ошибка загрузки чатов:', {
        status: err.response?.status,
        message: err.message,
        data: err.response?.data,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedChats = JSON.parse(localStorage.getItem('chats') || '[]');
    if (Array.isArray(storedChats)) {
      setChats(storedChats);
      storedChats.forEach((chat) => {
        if (chat.last_message) {
          console.log(
            `Loaded chat from localStorage: "${chat.title}" - Last message content: "${chat.last_message.content}"`,
          );
        }
      });
    } else {
      fetchChats();
    }
  }, []);

  const onChatSelect = async (chatId) => {
    setSelectedChatId(chatId);
    setCurrentChatId(chatId);

    console.log(`Selecting chat ${chatId}`);

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

      console.log('Creating chat with title:', title, 'isPrivate:', isPrivate);

      const response = await $api.post(
        '/chats/',
        {
          title: title.trim(),
          members: membersArray,
          is_private: isPrivate,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      console.log('Chat creation response:', response.data);

      const newChat = {
        ...response.data,
        created_at: new Date(response.data.created_at),
        updated_at: new Date(response.data.updated_at),
      };

      console.log('New chat data:', newChat);

      const updatedChats = [newChat, ...chats];
      setChats(updatedChats);
      localStorage.setItem('chats', JSON.stringify(updatedChats));
    } catch (err) {
      console.error('Failed to create chat:', {
        status: err.response?.status,
        message: err.message,
        data: err.response?.data,
      });
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
