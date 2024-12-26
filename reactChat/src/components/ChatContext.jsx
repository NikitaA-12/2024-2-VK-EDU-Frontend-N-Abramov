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
  const [userPage, setUserPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const getToken = () => {
    const token = localStorage.getItem('token');
    console.log('Retrieved token:', token);
    return token;
  };

  const fetchMessages = async (chatId) => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await $api.get(`/messages/?chat=${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedMessages = response.data?.results || [];
      console.log(`Fetched messages for chat ${chatId}:`, fetchedMessages);

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                last_message:
                  fetchedMessages.length > 0 ? fetchedMessages[fetchedMessages.length - 1] : null,
              }
            : chat,
        ),
      );
    } catch (err) {
      console.error('Failed to fetch messages', err.message);
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

      console.log('Fetched chats from server:', adaptedChats);

      setChats(adaptedChats);
      localStorage.setItem('chats', JSON.stringify(adaptedChats));
    } catch (err) {
      console.error('Ошибка загрузки чатов:', {
        status: err.response?.status,
        message: err.message,
      });

      try {
        const storedChats = JSON.parse(localStorage.getItem('chats'));
        if (storedChats && Array.isArray(storedChats)) {
          setChats(storedChats);
          console.log('Loaded chats from local storage');
        }
      } catch (storageError) {
        console.error('Error reading from localStorage:', storageError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = getToken();
      if (!token) return;

      setIsLoading(true);
      let allUsers = [];
      let currentPage = 1; // Локальная переменная для текущей страницы
      let hasNextPage = true;

      while (hasNextPage) {
        const response = await $api.get('/users/', {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: currentPage, page_size: userPageSize },
        });

        const users = response.data?.results || [];
        allUsers = [...allUsers, ...users];

        if (response.data?.next) {
          currentPage += 1; // Увеличиваем локальный номер страницы
        } else {
          hasNextPage = false; // Заканчиваем загрузку, если нет ссылки `next`
        }

        console.log(`Загружено пользователей с сервера (страница ${currentPage - 1}):`, users);
      }

      setAvailableUsers(allUsers);
      console.log('Общее количество загруженных пользователей:', allUsers.length);
    } catch (err) {
      console.error('Не удалось загрузить пользователей:', err.message);
      setError('Ошибка при загрузке пользователей');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedChats = localStorage.getItem('chats');
    if (storedChats) {
      const chatsFromStorage = JSON.parse(storedChats);
      setChats(chatsFromStorage);

      chatsFromStorage.forEach((chat) => {
        if (chat.last_message) {
          console.log(
            `Loaded chat from localStorage: "${chat.title}" - Last message content: "${chat.last_message.content}"`,
          );
        }
      });
    } else {
      fetchChats();
    }
  }, [page, pageSize, searchTerm]);

  useEffect(() => {
    if (chats.length > 0) {
      fetchUsers();
    }
  }, [chats]);

  useEffect(() => {
    console.log('Updated availableUsers:', availableUsers);
  }, [availableUsers]);

  const onChatSelect = async (chatId) => {
    setSelectedChatId(chatId);
    setCurrentChatId(chatId);

    console.log(`Selecting chat ${chatId}`);

    try {
      await fetchMessages(chatId);

      const selectedChat = chats.find((chat) => chat.id === chatId);
      if (selectedChat && selectedChat.last_message) {
        console.log(
          `Chat "${selectedChat.title}" - Last message content: "${selectedChat.last_message.content}", Time: ${selectedChat.last_message.time}`,
        );
      }
    } catch (error) {
      console.error('Ошибка загрузки сообщений после выбора чата:', error.message);
      setError('Ошибка загрузки сообщений');
    }
  };

  const createChat = async (title, isPrivate, membersArray = []) => {
    try {
      const token = getToken();
      if (!token) return;

      const chatsData = JSON.parse(localStorage.getItem('chats')) || [];

      const members = chatsData
        .flatMap((chat) => chat.members.map((member) => member.id))
        .filter((id) => id);

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

      console.log('Chats updated and stored in localStorage:', updatedChats);
    } catch (error) {
      console.error('Failed to create chat:', error.message);
      setError('Failed to create chat');
    }
  };

  const handleUserSelection = (userId, isSelected) => {
    setSelectedUsers((prev) => {
      if (isSelected) {
        return [...prev, userId];
      } else {
        return prev.filter((id) => id !== userId);
      }
    });
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
        availableUsers,
        selectedUsers,
        handleUserSelection,
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

export default ChatProvider;
