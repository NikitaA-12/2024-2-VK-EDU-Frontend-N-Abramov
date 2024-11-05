import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneAllIcon from '@mui/icons-material/DoneAll';

const formatTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ChatItem = ({ chat, onChatClick, onDelete, isNew }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // Состояние для удаления
  const firstLetter = chat.participants[0].charAt(0).toUpperCase();
  const lastMessageTime = chat.messages.length
    ? formatTime(chat.messages[chat.messages.length - 1].time)
    : '';
  const lastMessageContent = chat.messages.length
    ? chat.messages[chat.messages.length - 1].content
    : 'Нет сообщений';

  const avatarSrc = `/${chat.chatId}.png`;

  useEffect(() => {
    if (isNew) {
      setIsVisible(true); // Применяем анимацию появления только для новых чатов
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 1000);

      return () => clearTimeout(timer); // Очищаем таймер при размонтировании
    }
  }, [isNew]);

  const handleDelete = (e) => {
    e.stopPropagation();
    setIsDeleting(true); // Устанавливаем состояние удаления

    // Удаление через 300 мс (время анимации)
    setTimeout(() => {
      onDelete(chat.chatId);
    }, 300);
  };

  return (
    <div
      className={`block ${isNew && isVisible ? 'fadeIn' : ''} ${isDeleting ? 'fadeOut' : ''}`}
      onClick={() => onChatClick(chat, avatarSrc, firstLetter)}>
      <div className="imgBx">
        <img
          id={`chatAvatar${chat.chatId}`}
          className="chatAvatar"
          src={avatarSrc}
          alt="Chat avatar"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextElementSibling.style.display = 'flex';
          }}
        />
        <div
          className="avatarLetter"
          style={{
            display: 'none',
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
            <IconButton
              className="delete-chat"
              onClick={handleDelete} // Используем функцию удаления
              size="small">
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
  isNew: PropTypes.bool, // Добавлено свойство для новых чатов
};

ChatItem.propTypes = {
  chat: PropTypes.object.isRequired,
  onChatClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isNew: PropTypes.bool,
};

export default ChatItem;
