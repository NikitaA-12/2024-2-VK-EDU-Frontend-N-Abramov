export const chatData = {
  chats: [
    {
      chatId: 1,
      participants: ['You', 'right'],
      messages: [
        {
          type: 'incoming',
          from: 'You',
          content: "Hey, how's it going?",
          time: '2024-10-15T10:00',
        },
        {
          type: 'outgoing',
          from: 'right',
          content: 'All good, thanks! How about you?',
          time: '2024-10-15T10:05',
        },
        {
          type: 'incoming',
          from: 'You',
          content: "I'm doing well, thanks for asking!",
          time: '2024-10-15T10:10',
        },
      ],
    },
    {
      chatId: 2,
      participants: ['Jane Smith', 'right'],
      messages: [
        {
          type: 'outgoing',
          from: 'right',
          content: "Hey Jane, let's catch up soon!",
          time: '2024-10-15T12:30',
        },
        {
          type: 'incoming',
          from: 'Jane Smith',
          content: 'Sure! How about tomorrow?',
          time: '2024-10-15T12:35',
        },
        {
          type: 'outgoing',
          from: 'right',
          content: "Sounds good. Let's meet at 10 AM.",
          time: '2024-10-15T12:40',
        },
      ],
    },
  ],
};

// Сохраняем данные чатов в localStorage
export function saveChatsToLocalStorage() {
  try {
    localStorage.setItem('chatData', JSON.stringify(chatData));
    console.log('Чаты успешно сохранены в localStorage.');
  } catch (error) {
    console.error('Ошибка при сохранении чатов в localStorage:', error);
  }
}

// Загружаем данные чатов из localStorage
export function loadChatsFromLocalStorage() {
  try {
    const storedChats = localStorage.getItem('chatData');
    if (storedChats) {
      chatData.chats = JSON.parse(storedChats).chats;
    }
    console.log('Чаты успешно загружены из localStorage.');
  } catch (error) {
    console.error('Ошибка при загрузке чатов из localStorage:', error);
  }
}
