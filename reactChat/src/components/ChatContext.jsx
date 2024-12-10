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
  const [currentChatId, setCurrentChatId] = useState(null); // Добавили текущий ID чата
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getToken = () => {
    const token = localStorage.getItem('token');
    console.log('Retrieved token:', token);
    return token;
  };

  // Получение сообщений для выбранного чата
  const fetchMessages = async (chatId) => {
    console.log(`Fetching messages for chatId: ${chatId}`);

    try {
      const token = getToken();
      if (!token) {
        console.error('Authorization token not found.');
        return;
      }

      const response = await $api.get(`/messages/?chat=${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedMessages = response.data?.results || [];
      console.log('Fetched messages:', fetchedMessages);

      setMessages(fetchedMessages);
    } catch (err) {
      console.error('Error fetching messages:', {
        status: err.response?.status,
        message: err.message,
        url: `/messages/?chat=${chatId}`,
      });
      setError('Ошибка загрузки сообщений');
    }
  };

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

      localStorage.setItem('chats', JSON.stringify(adaptedChats));
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

  useEffect(() => {
    const storedChats = localStorage.getItem('chats');
    if (storedChats) {
      const chatsFromStorage = JSON.parse(storedChats);
      setChats(chatsFromStorage);
      console.log('Loaded chats from local storage');
    } else {
      fetchChats();
    }
  }, []);

  const onChatSelect = async (chatId) => {
    console.log(`Selected chat ID: ${chatId}`);
    setSelectedChatId(chatId);
    setCurrentChatId(chatId); // Устанавливаем текущий ID чата

    try {
      await fetchMessages(chatId);
    } catch (error) {
      console.error('Ошибка загрузки сообщений после выбора чата:', error.message);
      setError('Ошибка загрузки сообщений');
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
        currentChatId, // Возвращаем currentChatId в контексте
        setCurrentChatId,
        addChat: async (chatName) => {
          try {
            const token = getToken();
            if (!token) return;

            const response = await $api.post(
              '/chats/',
              { title: chatName, is_private: true },
              {
                headers: { Authorization: `Bearer ${token}` },
              },
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
        },
        deleteChat: async (chatId) => {
          try {
            const token = getToken();
            if (!token) return;

            await $api.delete(`/chats/${chatId}/`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            const updatedChats = chats.filter((chat) => chat.id !== chatId);
            setChats(updatedChats);
            localStorage.setItem('chats', JSON.stringify(updatedChats));
          } catch (err) {
            console.error('Ошибка удаления чата:', err.message);
            setError('Ошибка удаления чата');
          }
        },
        onChatSelect,
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
