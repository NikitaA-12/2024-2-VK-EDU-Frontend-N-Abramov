import { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { initialChatData } from './chat-data';

// Создание контекста для чатов
const ChatContext = createContext();

// Хук для использования данных контекста
export const useChatData = () => useContext(ChatContext);

// Провайдер для управления данными чатов
export const ChatProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState(''); // Хранение текущего текста поиска
  const [chats, setChats] = useState(() => {
    try {
      const storedChats = JSON.parse(localStorage.getItem('chats'));
      if (storedChats && Array.isArray(storedChats.chats)) {
        return storedChats.chats;
      }
    } catch (error) {
      console.error('Ошибка чтения данных из localStorage:', error);
    }
    return initialChatData.chats; // Возвращаем начальные данные, если ничего нет в localStorage
  });

  const [selectedChatId, setSelectedChatId] = useState(null); // Хранение выбранного чата

  // Сохраняем чаты в localStorage при каждом изменении
  useEffect(() => {
    try {
      localStorage.setItem('chats', JSON.stringify({ chats }));
    } catch (error) {
      console.error('Ошибка записи данных в localStorage:', error);
    }
  }, [chats]);

  // Добавление нового чата
  const addChat = (chatName) => {
    const newChat = {
      chatId: chats.length > 0 ? Math.max(...chats.map((chat) => chat.chatId)) + 1 : 1,
      chatName,
      participants: [chatName, 'You'],
      messages: [],
    };
    setChats((prevChats) => [newChat, ...prevChats]);
  };

  // Обновление существующего чата
  const updateChat = (updatedChat) => {
    setChats((prevChats) => {
      const updated = prevChats.map((chat) =>
        chat.chatId === updatedChat.chatId ? updatedChat : chat,
      );
      localStorage.setItem('chats', JSON.stringify({ chats: updated })); // Сохраняем изменения
      return updated;
    });
  };

  // Удаление чата
  const deleteChat = (chatId) => {
    setChats((prevChats) => prevChats.filter((chat) => chat.chatId !== chatId));
    if (selectedChatId === chatId) {
      setSelectedChatId(null); // Сбрасываем выбранный чат, если он удален
    }
  };

  // Выбор чата
  const onChatSelect = (chatId) => {
    setSelectedChatId(chatId);
  };

  // Фильтрация чатов по поисковому запросу
  const filteredChats = chats.filter((chat) =>
    chat.chatName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <ChatContext.Provider
      value={{
        searchTerm,
        setSearchTerm,
        chats: filteredChats,
        setChats,
        addChat,
        updateChat,
        deleteChat,
        onChatSelect,
        selectedChatId,
      }}>
      {children}
    </ChatContext.Provider>
  );
};

ChatProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
