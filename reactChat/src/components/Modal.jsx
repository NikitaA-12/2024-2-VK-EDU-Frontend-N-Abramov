import { useState } from 'react';
import PropTypes from 'prop-types';

const Modal = ({ isOpen, onClose, onCreate }) => {
  const [chatName, setChatName] = useState('');

  // Функция для создания нового чата
  const createChat = () => {
    if (chatName.trim()) {
      console.log(`Создание чата с названием: "${chatName}"`);
      onCreate(chatName); // Передаем название чата в родительский компонент
      setChatName(''); // Сбрасываем поле ввода
      onClose(); // Закрываем модальное окно
    } else {
      alert('Пожалуйста, введите название чата');
    }
  };

  // Обработка нажатия клавиши Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Предотвращаем отправку формы
      createChat(); // Вызываем функцию создания чата при нажатии Enter
    }
  };

  // Обработка клика внутри модального окна
  const handleModalClick = (e) => {
    e.stopPropagation(); // Избегаем закрытия модального окна при клике внутри него
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
