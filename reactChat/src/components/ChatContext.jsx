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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('token');

  // Получение сообщений для выбранного чата
  const fetchMessages = async (chatId) => {
    try {
      const token = getToken();
      if (!token) {
        console.error('Token отсутствует');
        return;
      }

      const response = await $api.get(`/chats/${chatId}/messages/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedMessages = response.data;
      setMessages(fetchedMessages);

      console.log('Fetched messages:', fetchedMessages);
    } catch (err) {
      console.error('Ошибка получения сообщений:', {
        status: err.response?.status,
        message: err.message,
        url: `/chats/${chatId}/messages/`,
        data: err.response?.data,
      });
      setError('Ошибка загрузки сообщений');
    }
  };

  // Получение чатов из API
  useEffect(() => {
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

        const adaptedChats = response.data.results.map((chat) => ({
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
        }));

        setChats(adaptedChats);
      } catch (err) {
        console.error('Ошибка загрузки чатов:', {
          status: err.response?.status,
          message: err.message,
        });
        setError('Ошибка загрузки чатов');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, [page, searchTerm, pageSize]);

  // Создание нового чата
  const addChat = async (chatName) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Token отсутствует');
        return;
      }

      const response = await $api.post(
        '/chats/',
        { title: chatName, is_private: true },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const newChat = {
        id: response.data.id,
        title: response.data.title,
        members: response.data.members,
        creator: response.data.creator,
        avatar: response.data.avatar,
        created_at: new Date(response.data.created_at),
        updated_at: new Date(response.data.updated_at),
        is_private: response.data.is_private,
        last_message: response.data.last_message,
        unread_messages_count: parseInt(response.data.unread_messages_count, 10) || 0,
      };

      setChats((prevChats) => [newChat, ...prevChats]);
    } catch (err) {
      console.error('Ошибка создания чата:', err.message);
      setError('Ошибка создания чата');
    }
  };

  // Удаление чата
  const deleteChat = async (chatId) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Token отсутствует');
        return;
      }

      await $api.delete(`/chats/${chatId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
    } catch (err) {
      console.error('Ошибка удаления чата:', err.message);
      setError('Ошибка удаления чата');
    }
  };

  const onChatSelect = async (chatId) => {
    setSelectedChatId(chatId);
    try {
      await fetchMessages(chatId);
    } catch (error) {
      console.error('Ошибка загрузки сообщений после выбора чата:', error.message);
      setError('Ошибка загрузки сообщений');
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <ChatContext.Provider
      value={{
        searchTerm,
        setSearchTerm,
        chats: filteredChats,
        setChats,
        messages,
        addChat,
        deleteChat,
        onChatSelect,
        selectedChatId,
        isLoading,
        setPage,
        page,
        setPageSize,
        pageSize,
        error,
      }}>
      {children}
    </ChatContext.Provider>
  );
};

ChatProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
