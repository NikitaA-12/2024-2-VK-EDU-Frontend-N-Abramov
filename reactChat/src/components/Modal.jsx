import { useState } from 'react';
import PropTypes from 'prop-types';
import { useChatData } from './ChatContext';

const Modal = ({ isOpen, onClose }) => {
  const [chatName, setChatName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { createChat } = useChatData();

  console.log('Modal isOpen:', isOpen);

  const validateChatName = (name) => {
    console.log('Validating chat name:', name);

    if (name.trim().length < 3) {
      return 'Название чата должно содержать не менее 3 символов.';
    }
    if (/[^a-zA-Z0-9а-яА-Я\s]/.test(name)) {
      return 'Название чата может содержать только буквы, цифры и пробелы.';
    }
    return '';
  };

  const handleCreateChat = async () => {
    console.log('Attempting to create chat with name:', chatName, 'Private:', isPrivate);

    const trimmedName = chatName.trim();
    const validationError = validateChatName(trimmedName);

    if (validationError) {
      console.warn('Validation error:', validationError);
      setErrorMessage(validationError);
      return;
    }

    try {
      console.log('Calling createChat method');
      await createChat(trimmedName, isPrivate);
      console.log('Chat created successfully');

      setChatName('');
      setIsPrivate(false);
      setErrorMessage('');
      onClose();

      console.log('Chat creation completed, closing modal');
    } catch (error) {
      console.error('Ошибка при создании чата:', error);
      setErrorMessage('Не удалось создать чат. Попробуйте снова.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      console.log('Enter key pressed, creating chat');
      e.preventDefault();
      handleCreateChat();
    }
  };

  const handleModalClick = (e) => {
    console.log('Modal content clicked');
    e.stopPropagation();
  };

  return (
    <div
      className={`modal ${isOpen ? 'open' : ''}`}
      onClick={onClose}
      style={{ display: isOpen ? 'flex' : 'none' }}>
      <div className="modal-content" onClick={handleModalClick}>
        <span className="close" onClick={onClose}>
          &times;
        </span>

        <h2>Создать новый чат</h2>

        <input
          type="text"
          value={chatName}
          placeholder="Введите название чата"
          onChange={(e) => {
            console.log('Chat name input change:', e.target.value);
            setChatName(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          id="chatNameInput"
          required
        />

        <div className="private-checkbox">
          <label>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => {
                console.log('Private chat checkbox changed:', e.target.checked);
                setIsPrivate(e.target.checked);
              }}
            />
            Приватный чат
          </label>
        </div>

        {errorMessage && <p className="error">{errorMessage}</p>}

        <button
          id="createChatButton"
          onClick={handleCreateChat}
          disabled={!chatName.trim()}
          style={{ cursor: !chatName.trim() ? 'not-allowed' : 'pointer' }}>
          Создать чат
        </button>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Modal;
