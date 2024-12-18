import PropTypes from 'prop-types';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useChatData } from './ChatContext';

const ChatItem = ({ chat, isActive, onClick, onDelete, isDeleting }) => {
  const { setChats } = useChatData();

  const lastMessageContent = chat.last_message?.text || 'Нет сообщений';
  const lastMessageTime = chat.last_message?.time;

  const handleMessageUpdate = (newMessage) => {
    setChats((prevChats) =>
      prevChats.map((updatedChat) =>
        updatedChat.id === chat.id
          ? {
              ...updatedChat,
              last_message: newMessage,
            }
          : updatedChat,
      ),
    );
  };

  return (
    <div className={`block ${isDeleting ? 'fadeOut' : ''}`} onClick={onClick}>
      <div className="imgBx">
        {chat.avatar ? (
          <img
            className="chatAvatar"
            src={chat.avatar}
            alt="Chat avatar"
            onError={(e) => {
              e.target.style.display = 'none';
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
            {chat.title.charAt(0).toUpperCase()}
          </div>
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

            <p className="time">{lastMessageTime}</p>
          </div>
        </div>

        <div className="message_p">
          <p>{lastMessageContent}</p>
          {chat.unread_messages_count > 0 && (
            <span className="unread-count">{chat.unread_messages_count}</span>
          )}
          <DoneAllIcon fontSize="small" className="read" />
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
      time: PropTypes.string,
      text: PropTypes.string,
    }),
    unread_messages_count: PropTypes.number,
  }).isRequired,
  isActive: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isDeleting: PropTypes.bool,
};

export default ChatItem;
