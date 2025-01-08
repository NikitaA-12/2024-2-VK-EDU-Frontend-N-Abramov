import { useState, useEffect, useMemo, ChangeEvent, KeyboardEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createChat } from '../store/chatCreationSlice';
import { fetchUsers, setSelectedUsers } from '../store/userSlice';
import { AppDispatch } from '../store/store';

interface User {
  id: string;
  username: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, isPrivate: boolean) => Promise<void>;
  chatName: string;
  setChatName: React.Dispatch<React.SetStateAction<string>>;
}

const Modal = ({ isOpen, onClose, chatName, setChatName }: ModalProps) => {
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const dispatch = useDispatch<AppDispatch>();
  const { availableUsers, selectedUsers, isLoading } = useSelector((state: any) => state.users);

  useEffect(() => {
    if (isOpen && availableUsers.length === 0) {
      dispatch(fetchUsers({ userPageSize: 20 }) as any);
    }
  }, [isOpen, availableUsers.length, dispatch]);

  const validateChatName = (name: string): string => {
    if (name.trim().length < 3) {
      return 'Название чата должно содержать не менее 3 символов.';
    }
    if (/[^a-zA-Z0-9а-яА-Я\s]/.test(name)) {
      return 'Название чата может содержать только буквы, цифры и пробелы.';
    }
    return '';
  };

  const handleCreateChat = async (): Promise<void> => {
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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreateChat();
    }
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const handleCheckboxChange = (userId: string, isChecked: boolean): void => {
    const updatedSelectedUsers = isChecked
      ? [...selectedUsers, userId]
      : selectedUsers.filter((id: string) => id !== userId);
    dispatch(setSelectedUsers(updatedSelectedUsers));
  };

  const filteredUsers = useMemo(() => {
    return availableUsers.filter((user: User) => user.username.toLowerCase().includes(searchQuery));
  }, [availableUsers, searchQuery]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>): void => {
    const target = e.target as HTMLDivElement;
    const bottom = target.scrollHeight === target.scrollTop + target.clientHeight;
    if (bottom && availableUsers.length % 20 === 0) {
      dispatch(fetchUsers({ userPageSize: 20 }) as any);
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
            filteredUsers.map((user: User) => (
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

export default Modal;
