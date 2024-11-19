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
