import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchMessagesPage } from '../store/messagesSlice';
import { RootState } from '../store/store';
import { ThunkDispatch } from '@reduxjs/toolkit';

interface Message {
  created_at: string;
  [key: string]: any;
}

interface GroupedMessages {
  [date: string]: Message[];
}

const groupMessagesByDate = (messages: Message[]): GroupedMessages => {
  return messages.reduce((acc: GroupedMessages, message: Message) => {
    const messageDate = new Date(message.created_at).toLocaleDateString();
    if (!acc[messageDate]) {
      acc[messageDate] = [];
    }
    acc[messageDate].push(message);
    return acc;
  }, {});
};

const useLoadAllMessages = (chatId: string | null) => {
  const [allMessages, setAllMessages] = useState<GroupedMessages>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const dispatch: ThunkDispatch<RootState, unknown, any> = useDispatch();

  useEffect(() => {
    if (!chatId) return;

    const loadMessages = async () => {
      setLoading(true);
      setError(null);

      const storedMessages = localStorage.getItem(`messages_${chatId}`);
      if (storedMessages) {
        const parsedMessages: Message[] = JSON.parse(storedMessages);
        const groupedMessages = groupMessagesByDate(parsedMessages);
        setAllMessages(groupedMessages);
        setLoading(false);
        return;
      }

      let nextPage = 1;
      let hasMore = true;
      let messages: Message[] = [];

      try {
        while (hasMore) {
          const response = await dispatch(fetchMessagesPage({ chatId, page: nextPage })).unwrap();
          messages = [...messages, ...response.results];
          hasMore = !!response.next;
          nextPage += 1;
        }

        const groupedMessages = groupMessagesByDate(messages);
        setAllMessages(groupedMessages);
        localStorage.setItem(`messages_${chatId}`, JSON.stringify(messages));
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Ошибка загрузки сообщений');
        } else {
          setError('Неизвестная ошибка');
        }
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [chatId, dispatch]);

  return { allMessages, loading, error };
};

export default useLoadAllMessages;
