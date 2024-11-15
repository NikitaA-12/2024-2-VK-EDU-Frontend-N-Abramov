import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import avatar1 from '../assets/1.png';
import avatar2 from '../assets/2.png';

const avatars = {
  1: avatar1,
  2: avatar2,
};

const formatTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ChatItem = ({ chat, onChatClick, onDelete, isNew }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const firstLetter = chat.participants[0].charAt(0).toUpperCase();
  const lastMessageTime = chat.messages.length
    ? formatTime(chat.messages[chat.messages.length - 1].time)
    : '';
  const lastMessageContent = chat.messages.length
    ? chat.messages[chat.messages.length - 1].content
    : 'Нет сообщений';

  const avatarSrc = avatars[chat.chatId];

  useEffect(() => {
    if (isNew) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isNew]);

  const handleDelete = (e) => {
    e.stopPropagation();
    setIsDeleting(true);

    setTimeout(() => {
      onDelete(chat.chatId);
    }, 300);
  };

  return (
    <div
      className={`block ${isNew && isVisible ? 'fadeIn' : ''} ${isDeleting ? 'fadeOut' : ''}`}
      onClick={() => onChatClick(chat, avatarSrc, firstLetter)}>
      <div className="imgBx">
        {avatarSrc ? (
          <img
            id={`chatAvatar${chat.chatId}`}
            className="chatAvatar"
            src={avatarSrc}
            alt="Chat avatar"
            onError={(e) => {
              e.target.style.display = 'none'; // Скрыть изображение при ошибке загрузки
              e.target.nextElementSibling.style.display = 'flex'; // Показать первую букву
            }}
          />
        ) : null}
        <div
          className="avatarLetter"
          style={{
            display: avatarSrc ? 'none' : 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '24px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            color: '#fafafa',
            backgroundColor: '#8f9efe',
          }}>
          {firstLetter}
        </div>
      </div>
      <div className="details">
        <div className="listHead">
          <h4>{chat.participants[0]}</h4>
          <div className="time-delete-wrapper">
            <IconButton className="delete-chat" onClick={handleDelete} size="small">
              <DeleteIcon fontSize="small" />
            </IconButton>
            <p className="time">{lastMessageTime}</p>
          </div>
        </div>
        <div className="message_p">
          <p>{lastMessageContent}</p>
          <DoneAllIcon fontSize="small" className="read" />
        </div>
      </div>
    </div>
  );
};

ChatItem.propTypes = {
  chat: PropTypes.shape({
    chatId: PropTypes.number.isRequired,
    participants: PropTypes.arrayOf(PropTypes.string).isRequired,
    messages: PropTypes.arrayOf(PropTypes.object).isRequired,
  }).isRequired,
  onChatClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isNew: PropTypes.bool,
};

export default ChatItem;
