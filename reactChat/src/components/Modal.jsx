import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { createChat } from '../store/chatCreationSlice';
import { fetchUsers, setSelectedUsers } from '../store/userSlice';

const Modal = ({ isOpen, onClose }) => {
  const [chatName, setChatName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const dispatch = useDispatch();
  const { availableUsers, selectedUsers, isLoading } = useSelector((state) => state.users);

  useEffect(() => {
    if (isOpen && availableUsers.length === 0) {
      dispatch(fetchUsers({ userPageSize: 20 }));
    }
  }, [isOpen, availableUsers.length, dispatch]);

  const validateChatName = (name) => {
    if (name.trim().length < 3) {
      return 'Название чата должно содержать не менее 3 символов.';
    }
    if (/[^a-zA-Z0-9а-яА-Я\s]/.test(name)) {
      return 'Название чата может содержать только буквы, цифры и пробелы.';
    }
    return '';
  };

  const handleCreateChat = async () => {
    const trimmedName = chatName.trim();
    const validationError = validateChatName(trimmedName);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    onClose();

    try {
      await dispatch(createChat({ title: trimmedName, isPrivate, membersArray: selectedUsers }));
      setChatName('');
      setIsPrivate(false);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Не удалось создать чат. Попробуйте снова.');
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreateChat();
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const handleCheckboxChange = (userId, isChecked) => {
    const updatedSelectedUsers = isChecked
      ? [...selectedUsers, userId]
      : selectedUsers.filter((id) => id !== userId);
    dispatch(setSelectedUsers(updatedSelectedUsers));
  };

  const filteredUsers = availableUsers.filter((user) =>
    user.username.toLowerCase().includes(searchQuery),
  );

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;
    if (bottom && availableUsers.length % 20 === 0) {
      dispatch(fetchUsers({ userPageSize: 20 }));
    }
  };

  return (
    <div
      className={`modal ${isOpen ? 'open' : ''}`}
      onClick={onClose}
      style={{ display: isOpen ? 'flex' : 'none' }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={onClose}>
          &times;
        </span>

        <h2>Создать новый чат</h2>

        <input
          type="text"
          value={chatName}
          placeholder="Введите название чата"
          onChange={(e) => setChatName(e.target.value)}
          onKeyDown={handleKeyDown}
          id="chatNameInput"
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

        <h3>Выберите участников</h3>

        <input
          type="text"
          placeholder="Поиск пользователей по имени"
          value={searchQuery}
          onChange={handleSearchChange}
          style={{ marginBottom: '10px', marginTop: '5px', padding: '8px', width: '100%' }}
        />

        <div
          className="user-selection"
          onScroll={handleScroll}
          style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {isLoading ? (
            <p>Загрузка пользователей...</p>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`user-row ${selectedUsers.includes(user.id) ? 'selected' : ''}`}>
                <input
                  type="checkbox"
                  id={`user-${user.id}`}
                  checked={selectedUsers.includes(user.id)}
                  onChange={(e) => handleCheckboxChange(user.id, e.target.checked)}
                />
                <label htmlFor={`user-${user.id}`}>{user.username}</label>
                <hr />
              </div>
            ))
          )}
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
