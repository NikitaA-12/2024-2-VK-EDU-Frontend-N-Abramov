import { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneAllIcon from '@mui/icons-material/DoneAll';

const formatTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ChatItem = ({
  title,
  avatar,
  lastMessage,
  unreadMessagesCount,
  onClick,
  onDelete,
  isNew = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const firstLetter = title.charAt(0).toUpperCase();
  const lastMessageTime = lastMessage?.time ? formatTime(lastMessage.time) : '';
  const lastMessageContent = lastMessage?.content || 'Нет сообщений';

  useEffect(() => {
    if (isNew) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  const handleDelete = (e) => {
    e.stopPropagation();
    setIsDeleting(true);

    setTimeout(() => {
      onDelete();
    }, 300);
  };

  return (
    <div
      className={`block ${isNew && isVisible ? 'fadeIn' : ''} ${isDeleting ? 'fadeOut' : ''}`}
      onClick={onClick}>
      <div className="imgBx">
        {avatar ? (
          <img
            className="chatAvatar"
            src={avatar}
            alt="Chat avatar"
            onError={(e) => {
              e.target.style.display = 'none'; // Скрыть аватар при ошибке загрузки
            }}
          />
        ) : (
          <div
            className="avatarLetter"
            style={{
              display: 'flex',
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
        )}
      </div>
      <div className="details">
        <div className="listHead">
          <h4>{title}</h4>
          <div className="time-delete-wrapper">
            <IconButton className="delete-chat" onClick={handleDelete} size="small">
              <DeleteIcon fontSize="small" />
            </IconButton>
            <p className="time">{lastMessageTime}</p>
          </div>
        </div>
        <div className="message_p">
          <p>{lastMessageContent}</p>
          {unreadMessagesCount > 0 && <span className="unread-count">{unreadMessagesCount}</span>}
          <DoneAllIcon fontSize="small" className="read" />
        </div>
      </div>
    </div>
  );
};

ChatItem.propTypes = {
  title: PropTypes.string.isRequired,
  avatar: PropTypes.string,
  lastMessage: PropTypes.shape({
    time: PropTypes.string,
    content: PropTypes.string,
  }),
  unreadMessagesCount: PropTypes.number,
  onClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isNew: PropTypes.bool,
};

export default ChatItem;
