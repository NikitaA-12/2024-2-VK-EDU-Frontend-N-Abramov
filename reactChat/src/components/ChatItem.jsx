import PropTypes from 'prop-types';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useDispatch } from 'react-redux';
import { selectChat } from '../store/chatsSlice';
import { format } from 'date-fns';

const ChatItem = ({ chat, onClick, onDelete, isDeleting = false }) => {
  const dispatch = useDispatch();

  const handleChatSelect = () => {
    dispatch(selectChat(chat.id));
    onClick();
  };

  const lastMessageContent =
    chat.last_message && chat.last_message.text ? chat.last_message.text : 'Нет сообщений';
  const lastMessageTime =
    chat.last_message && chat.last_message.created_at ? chat.last_message.created_at : '';

  const formattedTime = lastMessageTime ? format(new Date(lastMessageTime), 'HH:mm ') : '';

  return (
    <div className={`block ${isDeleting ? 'fadeOut' : ''}`} onClick={handleChatSelect}>
      <div className="imgBx-item">
        {chat.avatar ? (
          <img src={chat.avatar} alt="Chat Avatar" className="chatAvatar" />
        ) : (
          <div className="avatarLetter">{chat.title[0]}</div>
        )}
      </div>

      <div className="details">
        <div className="listHead">
          <h4>{chat.title}</h4>

          <div className="time-delete-wrapper">
            <IconButton
              className="delete-chat"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              size="small">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </div>
        </div>

        <div className="message_p">
          <div className="message-item">
            <p>{lastMessageContent}</p>
          </div>
          <div className="time-item">
            {formattedTime && <span className="time-stamp">{formattedTime}</span>}
          </div>
          {chat.unread_messages_count > 0 && (
            <span className="unread-count">{chat.unread_messages_count}</span>
          )}
          <div className="read-wrapper">
            <DoneAllIcon fontSize="small" className="read" />
          </div>
        </div>
      </div>
    </div>
  );
};

ChatItem.propTypes = {
  chat: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    last_message: PropTypes.shape({
      created_at: PropTypes.string,
      text: PropTypes.string,
    }),
    unread_messages_count: PropTypes.number,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isDeleting: PropTypes.bool,
};

export default ChatItem;
