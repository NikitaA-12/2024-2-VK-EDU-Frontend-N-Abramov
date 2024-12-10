import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import { useChatData } from './ChatContext';

const API_BASE_URL = 'https://vkedu-fullstack-div2.ru/api';

const ChatWindow = ({ onBackClick = () => console.warn('Back click handler not provided') }) => {
  const { currentChatId, chats, setChats } = useChatData();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [alignment, setAlignment] = useState('right');
  const [nextPage, setNextPage] = useState(null);
  const messagesEndRef = useRef(null);

  const getToken = () => localStorage.getItem('token');

  // Загружаем сообщения при смене текущего чата
  useEffect(() => {
    const fetchMessages = async () => {
      if (currentChatId) {
        console.log('Fetching messages for chat ID:', currentChatId);
        try {
          const token = getToken();
          const response = await axios.get(`${API_BASE_URL}/messages/?chat=${currentChatId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const { results, next } = response.data;
          console.log('Messages fetched:', results);
          setMessages(results);
          setNextPage(next);
        } catch (error) {
          console.error('Ошибка загрузки сообщений:', error.message);
        }
      }
    };

    fetchMessages();
  }, [currentChatId]);

  // Загрузка следующей страницы сообщений
  const loadMoreMessages = async () => {
    if (!nextPage) return;

    console.log('Loading more messages from:', nextPage);
    try {
      const token = getToken();
      const response = await axios.get(nextPage, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { results, next } = response.data;
      console.log('More messages loaded:', results);
      setMessages((prevMessages) => [...prevMessages, ...results]);
      setNextPage(next);
    } catch (error) {
      console.error('Ошибка загрузки следующей страницы сообщений:', error.message);
    }
  };

  // Отправка сообщения
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentChatId) return;

    console.log('Sending message:', inputMessage);
    const token = getToken();
    if (!token) {
      console.error('Token отсутствует');
      return;
    }

    try {
      const url = `${API_BASE_URL}/messages/`;
      const response = await axios.post(
        url,
        { text: inputMessage, chat: currentChatId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const newMessage = response.data;
      console.log('Message sent:', newMessage);
      setMessages((prevMessages) => [newMessage, ...prevMessages]);
      setInputMessage('');
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error.message);
    }
  };

  // Прочитать сообщение
  const markMessageAsRead = async (messageId) => {
    console.log('Marking message as read:', messageId);
    try {
      const token = getToken();
      await axios.post(`${API_BASE_URL}/message/${messageId}/read/`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Ошибка пометки сообщения как прочитанного:', error.message);
    }
  };

  const adjustTextareaHeight = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  const toggleAlignment = () => {
    console.log('Toggling alignment. Current alignment:', alignment);
    setAlignment((prevAlignment) => (prevAlignment === 'right' ? 'left' : 'right'));
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <div className="chatBox">
      <div className="chat_header">
        <span id="back" className="back-arrow" onClick={onBackClick}>
          <ArrowBackIcon />
        </span>

        <span id="toggleAlignment" className="material-symbols-outlined" onClick={toggleAlignment}>
          <SyncAltIcon />
        </span>
      </div>

      <div className="messageBox">
        <button onClick={loadMoreMessages} disabled={!nextPage} className="load-more-btn">
          Загрузить ещё
        </button>
        {messages.map((msg) => (
          <div key={msg.id} className="message">
            <div className="message-content">
              <div className="sender-info">
                {msg.sender?.avatar && (
                  <img
                    src={msg.sender.avatar}
                    alt={`${msg.sender.username}'s avatar`}
                    className="avatar"
                  />
                )}
                <span className="username">{msg.sender?.first_name || 'Unknown'}</span>
              </div>
              <p>{msg.text || '[No text]'}</p>
              {msg.files?.length > 0 && (
                <div className="message-files">
                  {msg.files.map((file, index) => (
                    <a key={index} href={file.item} target="_blank" rel="noopener noreferrer">
                      Вложение {index + 1}
                    </a>
                  ))}
                </div>
              )}
              <span className="time">
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="messageInput">
        <textarea
          id="messageInput"
          placeholder="Введите сообщение..."
          rows="1"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onInput={adjustTextareaHeight}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <button id="send-btn" className="send-btn" onClick={handleSendMessage}>
          <SendIcon />
        </button>
      </div>
    </div>
  );
};

ChatWindow.propTypes = {
  onBackClick: PropTypes.func,
};

export default ChatWindow;
