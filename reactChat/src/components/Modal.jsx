import { useState } from 'react';
import PropTypes from 'prop-types';
import { useChatData } from './ChatContext';

const Modal = ({ isOpen, onClose }) => {
  const [chatName, setChatName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const {
    createChat,
    availableUsers,
    handleUserSelection,
    selectedUsers,
    setUserPage,
    userPage,
    isLoading,
  } = useChatData();

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
      await createChat(trimmedName, isPrivate, selectedUsers);
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

  const handleSearchChange = (e) => {
    console.log('Search input change:', e.target.value);
    setSearchQuery(e.target.value.toLowerCase());
  };

  const handleCheckboxChange = (userId, isChecked) => {
    console.log('User selection changed:', userId, isChecked);
    handleUserSelection(userId, isChecked);
  };

  const filteredUsers = availableUsers.filter((user) =>
    user.username.toLowerCase().includes(searchQuery),
  );

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;
    if (bottom && availableUsers.length % 20 === 0) {
      setUserPage(userPage + 1);
    }
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

        <h3>Выберите участников (не обязательно)</h3>

        {/* Поле для поиска пользователей */}
        <input
          type="text"
          placeholder="Поиск пользователей по имени"
          value={searchQuery}
          onChange={handleSearchChange}
          style={{ marginBottom: '10px', padding: '8px', width: '100%' }}
        />

        <div
          className="user-selection"
          onScroll={handleScroll} // Обработчик события прокрутки
          style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {isLoading ? (
            <p>Загрузка пользователей...</p>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id}>
                <input
                  type="checkbox"
                  id={`user-${user.id}`}
                  checked={selectedUsers.includes(user.id)}
                  onChange={(e) => handleCheckboxChange(user.id, e.target.checked)}
                />
                <label htmlFor={`user-${user.id}`}>{user.username}</label>
              </div>
            ))
          )}
        </div>

        {errorMessage && <p className="error">{errorMessage}</p>}

        <button
          id="createChatButton"
          onClick={handleCreateChat}
          disabled={!chatName.trim()} // Отключаем кнопку только если название чата пустое
          style={{
            cursor: !chatName.trim() ? 'not-allowed' : 'pointer',
          }}>
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
