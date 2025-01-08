import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import { sendMessage } from '../store/messagesSlice';
import { selectCurrentChat, setCurrentChat } from '../store/chatsSlice';
import { fetchCurrentUser, selectCurrentUser } from '../store/userSlice';
import useLoadAllMessages from '../hooks/useLoadAllMessages';
import LazyImage from './LazyImage';
import { ThunkDispatch } from '@reduxjs/toolkit';
import { RootState } from '../store/store';
import { AnyAction } from 'redux';

interface Message {
  id: string;
  chatId: string;
  text: string;
  sender: {
    id: string;
    username: string;
    avatar?: string;
  };
  created_at: string;
}

interface GroupedMessages {
  [date: string]: Message[];
}

interface ChatWindowProps {
  chatId: string;
  onBackClick?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ onBackClick = () => {} }) => {
  const dispatch: ThunkDispatch<RootState, unknown, AnyAction> = useDispatch();
  const { id: chatId } = useParams<{ id: string }>();
  const currentChat = useSelector(selectCurrentChat);
  const currentUser = useSelector(selectCurrentUser);

  const [inputMessage, setInputMessage] = useState('');
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [scrollOnSend, setScrollOnSend] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const initialScrollDone = useRef(false);

  const { allMessages, loading, error } = useLoadAllMessages(chatId || '');

  useEffect(() => {
    if (!currentUser) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, currentUser]);

  useEffect(() => {
    if (chatId && !currentChat) {
      dispatch(setCurrentChat(chatId));
    }
  }, [chatId, currentChat, dispatch]);

  useEffect(() => {
    if (allMessages && typeof allMessages === 'object') {
      const messagesArray = Object.keys(allMessages).reduce<Message[]>((acc, date) => {
        return acc.concat(allMessages[date] as Message[]);
      }, []);

      const sortedMessages = messagesArray.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );

      setLocalMessages(sortedMessages);
      initialScrollDone.current = false;
    }
  }, [allMessages]);

  useEffect(() => {
    if (!initialScrollDone.current && localMessages.length > 0) {
      scrollToBottom(false);
      initialScrollDone.current = true;
    }
  }, [localMessages]);

  useEffect(() => {
    if (scrollOnSend) {
      scrollToBottom(true);
      setScrollOnSend(false);
    }
  }, [scrollOnSend]);

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  const adjustTextareaHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target || textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !chatId || !currentUser?.id) return;

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      chatId,
      text: inputMessage,
      sender: {
        id: currentUser.id,
        username: currentUser.username,
        avatar: currentUser.avatar || undefined,
      },
      created_at: new Date().toISOString(),
    };

    setLocalMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, tempMessage];
      localStorage.setItem(`messages_${chatId}`, JSON.stringify(updatedMessages));
      return updatedMessages;
    });

    setScrollOnSend(true);
    setInputMessage('');
    resetTextareaHeight();

    try {
      const sentMessage = await dispatch(sendMessage({ chatId, text: inputMessage })).unwrap();

      setLocalMessages((prevMessages) => {
        const updatedMessages = prevMessages.map((msg) =>
          msg.id === tempMessage.id ? sentMessage : msg,
        );
        localStorage.setItem(`messages_${chatId}`, JSON.stringify(updatedMessages));
        return updatedMessages;
      });
    } catch (error: any) {
      setLocalMessages((prevMessages) => {
        const updatedMessages = prevMessages.filter((msg) => msg.id !== tempMessage.id);
        localStorage.setItem(`messages_${chatId}`, JSON.stringify(updatedMessages));
        return updatedMessages;
      });
    }
  };

  const groupMessagesByDate = (messages: Message[]): GroupedMessages => {
    return messages.reduce<GroupedMessages>((acc, message) => {
      const messageDate = new Date(message.created_at).toLocaleDateString();
      if (!acc[messageDate]) {
        acc[messageDate] = [];
      }
      acc[messageDate].push(message);
      return acc;
    }, {});
  };

  const groupedMessages = groupMessagesByDate(localMessages);

  if (!currentUser) {
    return <div>Загрузка пользователя...</div>;
  }

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
                <LazyImage src={currentChat.avatar} alt="Chat Avatar" className="avatar" />
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
              const isOutgoing = msg.sender?.id === currentUser?.id;
              return (
                <div key={msg.id} className={`message ${isOutgoing ? 'outgoing' : 'incoming'}`}>
                  {!isOutgoing && msg.sender?.avatar && (
                    <LazyImage
                      src={msg.sender.avatar}
                      alt={`${msg.sender.username}'s avatar`}
                      className="avatar"
                    />
                  )}
                  <div className="message-content">
                    <span className="username">{msg.sender?.username}</span>
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
          rows={1}
          ref={textareaRef}
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

export default ChatWindow;
