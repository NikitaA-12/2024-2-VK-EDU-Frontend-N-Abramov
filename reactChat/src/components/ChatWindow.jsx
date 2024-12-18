import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import { useChatData } from './ChatContext';

axios.defaults.baseURL = 'https://vkedu-fullstack-div2.ru';

const ChatWindow = ({ onBackClick = () => console.warn('Back click handler not provided') }) => {
  const { currentChatId, chats, setChats } = useChatData();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);

  const getToken = () => localStorage.getItem('token');

  const fetchCurrentUser = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await axios.get('/api/user/current/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Ошибка получения информации о текущем пользователе:', error.message);
    }
  };

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      if (!token) return;

      const response = await axios.get('/api/messages/', {
        params: {
          chat: currentChatId,
          page: 1,
          page_size: 50,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 && response.data?.results) {
        const fetchedMessages = response.data.results;

        // Сортируем сообщения по времени создания (от старых к новым)
        const sortedMessages = fetchedMessages.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at),
        );

        setMessages(sortedMessages);

        const storedChats = JSON.parse(localStorage.getItem('chats')) || [];
        const updatedChats = storedChats.map((chat) => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: sortedMessages,
              last_message: sortedMessages[sortedMessages.length - 1],
            };
          }
          return chat;
        });

        localStorage.setItem('chats', JSON.stringify(updatedChats));
        setChats(updatedChats);
      }
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const adjustTextareaHeight = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentChatId) return;

    const token = getToken();
    if (!token) return;

    const newMessage = {
      id: `${Date.now()}`,
      text: inputMessage,
      chat: currentChatId,
      created_at: new Date().toISOString(),
      sender: currentUser,
    };

    try {
      const response = await axios.post('/api/messages/', newMessage, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 201) {
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages, newMessage].sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at),
          );
          return updatedMessages;
        });

        const storedChats = JSON.parse(localStorage.getItem('chats')) || [];
        const updatedChats = storedChats.map((chat) => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: [...(chat.messages || []), newMessage].sort(
                (a, b) => new Date(a.created_at) - new Date(b.created_at),
              ),
              last_message: newMessage,
            };
          }
          return chat;
        });

        localStorage.setItem('chats', JSON.stringify(updatedChats));
        setChats(updatedChats);
      }
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error.message);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentChatId) {
      fetchMessages();
    }
  }, [currentChatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const currentChat = chats.find((chat) => chat.id === currentChatId);

  const getChatInitial = (name) => (name ? name.charAt(0).toUpperCase() : '');

  return (
    <div className="chatBox">
      <div className="chat_header">
        <span id="back" className="back-arrow" onClick={() => onBackClick()}>
          <ArrowBackIcon />
        </span>

        {currentChat && (
          <div className="imgcontent">
            <div className="imgBx">
              {currentChat.avatar ? (
                <img src={currentChat.avatar} alt="Chat Avatar" className="avatar" />
              ) : (
                <div className="default-avatar">{getChatInitial(currentChat.title)}</div>
              )}
            </div>
            <h3>{currentChat.title}</h3>
          </div>
        )}
      </div>

      {isLoading && <p>Loading messages...</p>}

      <div className="messageBox">
        {messages.map((msg) => {
          const isOutgoing = currentUser && msg.sender?.id === currentUser.id;
          return (
            <div key={msg.id} className={`message ${isOutgoing ? 'outgoing' : 'incoming'}`}>
              {msg.sender?.avatar && (
                <img
                  src={msg.sender.avatar}
                  alt={`${msg.sender.username}'s avatar`}
                  className="avatar"
                />
              )}
              <div className="message-content">
                <span className="username">{msg.sender?.username}</span>
                <div className="message-text">{msg.text || '[No text]'}</div>
                <span className="time">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          );
        })}
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
  onBackClick: PropTypes.func,
};

export default ChatWindow;
