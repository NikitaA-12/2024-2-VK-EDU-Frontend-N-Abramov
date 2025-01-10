import { memo, useCallback, useMemo } from 'react';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useDispatch } from 'react-redux';
import { selectChat } from '../store/chatsSlice';
import { format } from 'date-fns';
import LazyImage from './LazyImage';
import { AppDispatch } from '../store/store';

interface LastMessage {
  created_at?: string;
  text?: string;
}

interface Chat {
  id: string;
  title: string;
  avatar?: string;
  last_message?: LastMessage;
  unread_messages_count?: number;
}

interface ChatItemProps {
  chat: Chat;
  onClick: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
  isActive?: boolean;
}

const ChatItem: React.FC<ChatItemProps> = memo(
  ({ chat, onClick, onDelete, isDeleting = false, isActive = false }) => {
    const dispatch = useDispatch<AppDispatch>();

    const handleChatSelect = useCallback(async () => {
      await dispatch(selectChat({ chatId: chat.id }));
      onClick();
    }, [dispatch, onClick, chat.id]);

    const lastMessageContent = useMemo(() => {
      return chat.last_message?.text || 'Нет сообщений';
    }, [chat.last_message]);

    const lastMessageTime = useMemo(() => {
      return chat.last_message?.created_at || '';
    }, [chat.last_message]);

    const formattedTime = useMemo(() => {
      return lastMessageTime ? format(new Date(lastMessageTime), 'HH:mm') : '';
    }, [lastMessageTime]);

    return (
      <div
        className={`block ${isActive ? 'active' : ''} ${isDeleting ? 'fadeOut' : ''}`}
        onClick={handleChatSelect}>
        <div className="imgBx-item">
          {chat.avatar ? (
            <LazyImage src={chat.avatar} alt="Chat Avatar" className="chatAvatar" />
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
            {chat.unread_messages_count && chat.unread_messages_count > 0 && (
              <span className="unread-count">{chat.unread_messages_count}</span>
            )}
            <div className="read-wrapper">
              <DoneAllIcon fontSize="small" className="read" />
            </div>
          </div>
        </div>
      </div>
    );
  },
);

ChatItem.displayName = 'ChatItem';

export default ChatItem;
