import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchMessagesPage } from '../store/messagesSlice';

const groupMessagesByDate = (messages) => {
  return messages.reduce((acc, message) => {
    const messageDate = new Date(message.created_at).toLocaleDateString();
    if (!acc[messageDate]) {
      acc[messageDate] = [];
    }
    acc[messageDate].push(message);
    return acc;
  }, {});
};

const useLoadAllMessages = (chatId) => {
  const [allMessages, setAllMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!chatId) return;

    const loadMessages = async () => {
      setLoading(true);
      setError(null);

      const storedMessages = localStorage.getItem(`messages_${chatId}`);
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        const groupedMessages = groupMessagesByDate(parsedMessages);
        setAllMessages(groupedMessages);
        setLoading(false);
        return;
      }

      let nextPage = 1;
      let hasMore = true;
      let messages = [];

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
      } catch (err) {
        setError(err.message || 'Ошибка загрузки сообщений');
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [chatId, dispatch]);

  return { allMessages, loading, error };
};

export default useLoadAllMessages;
