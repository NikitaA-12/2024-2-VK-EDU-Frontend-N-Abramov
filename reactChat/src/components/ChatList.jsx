import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useChatData } from './ChatContext';
import ChatItem from './ChatItem';
import Modal from './Modal';

const ChatList = ({ onChatSelect, searchTerm }) => {
  const { chats, setChats } = useChatData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newChatId, setNewChatId] = useState(null);
  const [chatName, setChatName] = useState(''); // Состояние для имени нового чата

  useEffect(() => {
    // Сортируем чаты по времени последнего сообщения при изменении данных
    const sortedChats = [...chats].sort((a, b) => {
      const lastMessageA = a.messages[a.messages.length - 1]?.time || 0;
      const lastMessageB = b.messages[b.messages.length - 1]?.time || 0;
      return new Date(lastMessageB) - new Date(lastMessageA); // Сортируем по убыванию
    });

    // Обновляем чаты в контексте только если сортировка изменила порядок
    if (JSON.stringify(sortedChats) !== JSON.stringify(chats)) {
      setChats(sortedChats);
    }
  }, [chats, setChats]);

  useEffect(() => {
    if (newChatId !== null) {
      const timer = setTimeout(() => {
        setNewChatId(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [newChatId]);

  // Фильтрация чатов на основе searchTerm
  const filteredChats = chats.filter((chat) =>
    chat.chatName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Удаление чата
  const deleteChat = (chatId) => {
    const updatedChats = chats.filter((chat) => chat.chatId !== chatId);
    setChats(updatedChats); // Обновляем чаты в контексте
  };

  // Создание нового чата
  const handleCreateChat = () => {
    if (!chatName.trim()) return; // Проверка на пустое имя чата

    const newChat = {
      chatId: chats.length > 0 ? Math.max(...chats.map((chat) => chat.chatId)) + 1 : 1,
      chatName: chatName,
      participants: [chatName, 'You'],
      messages: [],
    };

    const updatedChats = [newChat, ...chats];
    setChats(updatedChats); // Добавляем новый чат через контекст
    setNewChatId(newChat.chatId);
    setIsModalOpen(false);
    setChatName(''); // Очищаем имя чата после создания
  };

  // Отправка сообщения
  const onSendMessage = (chatId, message) => {
    const updatedChats = chats.map((chat) => {
      if (chat.chatId === chatId) {
        const updatedMessages = [...chat.messages, message];
        return { ...chat, messages: updatedMessages };
      }
      return chat;
    });

    setChats(updatedChats); // Обновляем чаты через контекст
  };

  return (
    <div className="chatlist">
      <div className="chatlist-container">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <ChatItem
              key={chat.chatId}
              chat={chat}
              onChatClick={onChatSelect}
              onDelete={deleteChat}
              onSendMessage={onSendMessage}
              isNew={chat.chatId === newChatId} // Указываем новый чат
            />
          ))
        ) : (
          <div>No chats available</div> // Сообщение, если чаты не найдены
        )}
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateChat}
        chatName={chatName}
        setChatName={setChatName} // Передаем состояние и метод для обновления имени чата
      />
    </div>
  );
};

ChatList.propTypes = {
  onChatSelect: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
};

export default ChatList;
