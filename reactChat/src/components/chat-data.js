import { useEffect, useState } from 'react';

// Определяем начальные данные чатов
export const initialChatData = {
  chats: [
    {
      chatId: 1,
      chatName: 'You',
      participants: ['You', 'right'],
      messages: [
        {
          type: 'incoming',
          from: 'You',
          content: "Hey, how's it going?",
          time: '2024-10-15T10:00',
          read: true,
        },
        {
          type: 'outgoing',
          from: 'right',
          content: 'All good, thanks! How about you?',
          time: '2024-10-15T10:05',
          read: true,
        },
        {
          type: 'incoming',
          from: 'You',
          content: "I'm doing well, thanks for asking!",
          time: '2024-10-15T10:10',
          read: true,
        },
      ],
    },
    {
      chatId: 2,
      chatName: 'Jane Smith',
      participants: ['Jane Smith', 'right'],
      messages: [
        {
          type: 'outgoing',
          from: 'right',
          content: "Hey Jane, let's catch up soon!",
          time: '2024-10-15T12:30',
          read: true,
        },
        {
          type: 'incoming',
          from: 'Jane Smith',
          content: 'Sure! How about tomorrow?',
          time: '2024-10-15T12:35',
          read: true,
        },
        {
          type: 'outgoing',
          from: 'right',
          content: "Sounds good. Let's meet at 10 AM.",
          time: '2024-10-15T12:40',
          read: true,
        },
      ],
    },
  ],
};

// Основной компонент для работы с чатами
export function useChatData() {
  const [chatData, setChatData] = useState(() => {
    const savedChatData = localStorage.getItem('chats');
    const parsedData = savedChatData ? JSON.parse(savedChatData) : null;

    // Проверяем, является ли parsedData объектом и содержит ли ключ chats
    return parsedData && Array.isArray(parsedData.chats) ? parsedData : initialChatData; // Возвращаем начальные данные, если формат неправильный
  });

  // Сохраняем данные чатов в localStorage при каждом обновлении
  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(chatData));
  }, [chatData]);

  return {
    chatData,
    setChatData, // Обеспечиваем возможность изменять данные чатов
  };
}
