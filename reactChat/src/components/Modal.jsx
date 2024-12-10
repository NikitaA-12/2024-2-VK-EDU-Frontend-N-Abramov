import { useState } from 'react';
import PropTypes from 'prop-types';

const Modal = ({ isOpen, onClose, onCreate }) => {
  const [chatName, setChatName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Валидация названия чата
  const validateChatName = (name) => {
    if (name.trim().length < 3) {
      return 'Название чата должно содержать не менее 3 символов.';
    }
    if (/[^a-zA-Z0-9а-яА-Я\s]/.test(name)) {
      return 'Название чата может содержать только буквы, цифры и пробелы.';
    }
    return '';
  };

  // Создание чата
  // Создание чата
  const createChat = async () => {
    const trimmedName = chatName.trim(); // убираем лишние пробелы
    const validationError = validateChatName(trimmedName);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      console.log('Попытка создать чат с параметрами:', {
        title: trimmedName,
        is_private: isPrivate,
      });

      // Передаем только название чата и приватность, не объект с параметрами
      await onCreate(trimmedName, isPrivate);

      // Сброс состояния формы
      setChatName('');
      setIsPrivate(false);
      setErrorMessage('');
      onClose();
    } catch (error) {
      console.error('Ошибка при создании чата:', error);
      setErrorMessage('Не удалось создать чат. Попробуйте снова.');
    }
  };

  // Обработка нажатия клавиши Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      createChat();
    }
  };

  // Обработка клика внутри модального окна
  const handleModalClick = (e) => {
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
          onChange={(e) => setChatName(e.target.value)}
          id="chatNameInput"
          placeholder="Введите название чата"
          onKeyDown={handleKeyDown}
          required
        />
        <div className="private-checkbox">
          <label>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            Приватный чат
          </label>
        </div>
        {errorMessage && <p className="error">{errorMessage}</p>}
        <button
          id="createChatButton"
          onClick={createChat}
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
  onCreate: PropTypes.func.isRequired,
};

export default Modal;
