import { useState } from 'react';
import PropTypes from 'prop-types';

const Modal = ({ isOpen, onClose, onCreate }) => {
  const [chatName, setChatName] = useState('');

  const createChat = () => {
    if (chatName.trim()) {
      onCreate(chatName); // Передаем название чата родительскому компоненту
      setChatName(''); // Сбрасываем значение поля ввода
    } else {
      alert('Пожалуйста, введите название чата'); // Предупреждение, если поле пустое
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      createChat(); // Создание чата по нажатию Enter
    }
  };

  // Избегаем закрытия модального окна при клике внутри него
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
          onKeyDown={handleKeyDown} // Обработка нажатия клавиши Enter
          required
        />
        <button id="createChatButton" onClick={createChat}>
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
