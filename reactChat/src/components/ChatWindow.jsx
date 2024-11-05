import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import SendIcon from '@mui/icons-material/Send';
import '../styles/chat-styles.css';
import '../styles/message-input.css';

const ChatWindow = ({ activeChat, onBackClick, avatar, letter }) => {
  // Инициализация состояния
  const [messages, setMessages] = useState(activeChat ? activeChat.messages : []);
  const [alignment, setAlignment] = useState('right');
  const [newMessageIndexes, setNewMessageIndexes] = useState([]);
  const messageInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Загрузка сообщений из локального хранилища при изменении activeChat
  useEffect(() => {
    if (activeChat) {
      const storedChats = JSON.parse(localStorage.getItem('chats'));
      if (storedChats) {
        const currentChat = storedChats.chats.find((chat) => chat.chatId === activeChat.chatId);
        if (currentChat) {
          setMessages(currentChat.messages.map((msg) => ({ ...msg, read: true }))); // Все сообщения помечаем как прочитанные при загрузке
        }
      }
    }
  }, [activeChat]);

  // Скроллинг к концу списка сообщений
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const saveChatsToLocalStorage = (updatedChat) => {
    const storedChats = JSON.parse(localStorage.getItem('chats')) || { chats: [] };
    const chatIndex = storedChats.chats.findIndex((chat) => chat.chatId === activeChat.chatId);
    if (chatIndex !== -1) {
      storedChats.chats[chatIndex] = updatedChat;
    } else {
      storedChats.chats.push(updatedChat);
    }
    localStorage.setItem('chats', JSON.stringify(storedChats));
  };

  const handleSendMessage = () => {
    const messageInput = messageInputRef.current; // Используем ref для доступа к элементу
    const message = messageInput.value.trim();

    if (message) {
      const newMessage = {
        type: 'outgoing',
        from: alignment,
        content: message,
        time: new Date().toISOString(),
        read: false, // Новое сообщение еще не прочитано
      };

      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      setNewMessageIndexes((prev) => [...prev, updatedMessages.length - 1]);

      const updatedChat = {
        ...activeChat,
        messages: updatedMessages,
      };

      saveChatsToLocalStorage(updatedChat);
      messageInput.value = '';
      adjustTextareaHeight();

      // Удаляем индекс нового сообщения через 1 секунду
      setTimeout(() => {
        setNewMessageIndexes((prev) =>
          prev.filter((index) => index !== updatedMessages.length - 1),
        );
      }, 1000);
    }
  };

  const toggleAlignment = () => {
    setAlignment((prevAlignment) => (prevAlignment === 'right' ? 'left' : 'right'));
    setMessages((prevMessages) =>
      prevMessages.map((msg) => ({
        ...msg,
        type: msg.type === 'outgoing' ? 'incoming' : 'outgoing',
      })),
    );
  };

  const adjustTextareaHeight = () => {
    const textarea = messageInputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  // Проверяем, есть ли активный чат, перед выводом
  if (!activeChat) {
    return <div className="chatBox hide">Select a chat to start messaging</div>;
  }

  return (
    <div className="chatBox">
      <div className="chat_header">
        <span id="back" className="back-arrow" onClick={onBackClick}>
          <ArrowBackIcon />
        </span>
        <div className="imgcontent">
          <div className="imgBx">
            {avatar ? (
              <img id="chatAvatar" src={avatar} alt="avatar" />
            ) : (
              <div className="initials">{letter}</div>
            )}
          </div>
          <h3 id="chatName">
            {activeChat.chatName}
            <br />
            <span className="status">online</span>
          </h3>
        </div>
        <span id="toggleAlignment" className="material-symbols-outlined" onClick={toggleAlignment}>
          <SyncAltIcon />
        </span>
      </div>
      <div className="messageBox">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.type} ${
              newMessageIndexes.includes(index) ? 'bubble-animation' : ''
            }`}>
            <div className="message-content">
              <p>{msg.content}</p>
              <span className={`time ${msg.type}`}>
                {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="checkmarks">
                {msg.read ? (
                  <svg
                    className="MuiSvgIcon-root MuiSvgIcon-fontSizeSmall read css-120dh41-MuiSvgIcon-root"
                    focusable="false"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    data-testid="DoneAllIcon">
                    <path
                      d="m18 7-1.41-1.41-6.34 6.34 1.41 1.41zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12zM.41 13.41 6 19l1.41-1.41L1.83 12z"
                      className="checkmark"></path>
                  </svg>
                ) : (
                  <svg
                    className="MuiSvgIcon-root MuiSvgIcon-fontSizeSmall read css-120dh41-MuiSvgIcon-root"
                    focusable="false"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    data-testid="DoneIcon">
                    <path
                      d="M9 16.17L4.83 12 3.41 13.41 9 19l12-12-1.41-1.41z"
                      className="checkmark"
                    />
                  </svg>
                )}
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
          ref={messageInputRef}
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
  activeChat: PropTypes.shape({
    chatId: PropTypes.number.isRequired,
    chatName: PropTypes.string.isRequired,
    participants: PropTypes.arrayOf(PropTypes.string).isRequired,
    messages: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string.isRequired,
        from: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        time: PropTypes.string.isRequired,
        read: PropTypes.bool.isRequired, // Поле для статуса прочтения
      }),
    ).isRequired,
  }).isRequired,
  onBackClick: PropTypes.func.isRequired,
  avatar: PropTypes.string,
  letter: PropTypes.string,
};

export default ChatWindow;
