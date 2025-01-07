import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessage } from '../store/messagesSlice';
import { selectCurrentChat, setCurrentChat } from '../store/chatsSlice';
import { fetchCurrentUser, selectCurrentUser } from '../store/userSlice';
import { useParams } from 'react-router-dom';
import useLoadAllMessages from '../hooks/useLoadAllMessages';

const ChatWindow = ({ onBackClick = () => console.warn('Back click handler not provided') }) => {
  const dispatch = useDispatch();
  const { id: chatId } = useParams();
  const currentChat = useSelector((state) => selectCurrentChat(state));
  const currentUser = useSelector((state) => selectCurrentUser(state));

  const [inputMessage, setInputMessage] = useState('');
  const [localMessages, setLocalMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    if (currentUser) {
      console.log('Текущий пользователь загружен:', currentUser);
    } else {
      console.log('Текущий пользователь не загружен');
    }
  }, [currentUser]);

  useEffect(() => {
    if (chatId && !currentChat) {
      console.log('Устанавливаем текущий чат с ID:', chatId);
      dispatch(setCurrentChat(chatId));
    } else {
      console.log('Чат уже установлен или ID чата отсутствует');
    }
  }, [chatId, currentChat, dispatch]);

  const { allMessages, loading, error } = useLoadAllMessages(chatId);

  useEffect(() => {
    if (loading) {
      console.log('Загрузка сообщений началась...');
    }
    if (error) {
      console.error('Ошибка при загрузке сообщений:', error);
    }
  }, [loading, error]);

  useEffect(() => {
    if (allMessages && typeof allMessages === 'object') {
      console.log('Группировка сообщений по датам...');
      const messagesArray = Object.keys(allMessages).reduce((acc, date) => {
        return acc.concat(allMessages[date]);
      }, []);

      setLocalMessages(messagesArray.reverse());
    } else {
      console.error('All messages data is not an object:', allMessages);
    }
  }, [allMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [localMessages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const adjustTextareaHeight = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !chatId) return;

    const tempMessage = {
      id: `temp-${Date.now()}`,
      chatId: chatId,
      text: inputMessage,
      sender: {
        id: currentUser.id,
        username: currentUser.username,
        avatar: currentUser.avatar,
      },
      created_at: new Date().toISOString(),
    };

    console.log('Отправка временного сообщения:', tempMessage);

    setLocalMessages((prevMessages) => {
      if (Array.isArray(prevMessages)) {
        return [...prevMessages, tempMessage];
      }
      return [tempMessage];
    });

    setInputMessage('');

    try {
      console.log('Пытаемся отправить сообщение...');
      await dispatch(sendMessage({ chatId, text: inputMessage })).unwrap();
      console.log('Сообщение отправлено успешно!');
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error.message);
      setLocalMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== tempMessage.id));
    }
  };

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

  const groupedMessages = groupMessagesByDate(localMessages);

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
                <div className="default-avatar">{currentChat.title[0]}</div>
              )}
            </div>
            <h3>{currentChat.title}</h3>
          </div>
        )}
      </div>

      {loading && (
        <div className="loadingWrapper">
          <span>Загрузка сообщений</span>
        </div>
      )}

      {error && (
        <div className="errorWrapper">
          <span>Ошибка при загрузке сообщений: {error}</span>
        </div>
      )}

      <div className="messageBox">
        {Object.keys(groupedMessages).map((date) => (
          <div key={date}>
            <div className="date-divider">{date}</div>
            {groupedMessages[date].map((msg) => {
              const isOutgoing = msg.sender?.id === currentUser.id;
              return (
                <div key={msg.id} className={`message ${isOutgoing ? 'outgoing' : 'incoming'}`}>
                  {!isOutgoing && msg.sender?.avatar && (
                    <img
                      src={msg.sender.avatar}
                      alt={`${msg.sender.username}'s avatar`}
                      className="avatar"
                    />
                  )}
                  {isOutgoing && msg.sender?.avatar && (
                    <img
                      src={msg.sender.avatar}
                      alt={`${msg.sender.username}'s avatar`}
                      className="avatar"
                    />
                  )}
                  <div className="message-content">
                    {<span className="username">{msg.sender?.username}</span>}
                    <div
                      className={`message-text ${
                        isOutgoing ? 'outgoing-message' : 'incoming-message'
                      }`}>
                      {msg.text || '[No text]'}
                    </div>
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
  onBackClick: PropTypes.func,
};

export default ChatWindow;
