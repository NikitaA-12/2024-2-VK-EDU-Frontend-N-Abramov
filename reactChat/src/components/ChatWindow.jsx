import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';

const API_BASE_URL = 'https://vkedu-fullstack-div2.ru/api';

const ChatWindow = ({ onBackClick, selectedChatId = null }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [alignment, setAlignment] = useState('right');
  const messagesEndRef = useRef(null);

  // Получаем токен из localStorage
  const getToken = () => localStorage.getItem('token');

  // 📌 Получение сообщений для текущего чата через API
  const fetchMessagesFromAPI = async () => {
    if (!selectedChatId) {
      console.warn('Chat ID is not provided. Skipping message fetch.');
      return;
    }

    const token = getToken();
    if (!token) {
      console.error('Authorization token not found.');
      return;
    }

    try {
      const url = `${API_BASE_URL}/chats/${selectedChatId}/messages/`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedMessages = response.data;
      console.log('Fetched messages:', fetchedMessages);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Ошибка при загрузке сообщений:', {
        status: error.response?.status,
        message: error.message,
        url: `${API_BASE_URL}/chats/${selectedChatId}/messages/`,
        data: error.response?.data,
      });
    }
  };

  // 📌 Отправка нового сообщения через API
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedChatId) {
      console.warn('Message or Chat ID is not provided.');
      return;
    }

    const token = getToken();
    if (!token) {
      console.error('Authorization token not found.');
      return;
    }

    try {
      const url = `${API_BASE_URL}/chats/${selectedChatId}/messages/`;

      const response = await axios.post(
        url,
        { text: inputMessage },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const newMessage = response.data;
      console.log('Message successfully sent:', newMessage);

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputMessage('');
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', {
        message: error.message,
        status: error.response?.status,
        url: `${API_BASE_URL}/chats/${selectedChatId}/messages/`,
        data: error.response?.data,
      });
    }
  };

  const adjustTextareaHeight = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  const toggleAlignment = () =>
    setAlignment((prevAlignment) => (prevAlignment === 'right' ? 'left' : 'right'));

  // 📜 Вывод сообщений при выборе чата для диагностики
  useEffect(() => {
    if (selectedChatId) {
      console.log(`Initiating message fetch for Chat ID: ${selectedChatId}`);
      fetchMessagesFromAPI();
    }
  }, [selectedChatId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.type}`}>
            <div className="message-content">
              <p>{msg.text}</p>
              <span className={`time ${msg.type}`}>
                {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
          <SendIcon className="custom-icon" />
        </button>
      </div>
    </div>
  );
};

ChatWindow.propTypes = {
  onBackClick: PropTypes.func.isRequired,
  selectedChatId: PropTypes.string,
};

export default ChatWindow;
