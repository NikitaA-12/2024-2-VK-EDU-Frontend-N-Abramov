import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  const [isActive, setIsActive] = useState(false);
  const searchRef = useRef(null); // Ссылка на контейнер поиска

  // Включение состояния активного поиска
  const toggleSearch = () => {
    setIsActive(true);
  };

  // Обработка изменения текста в поле ввода
  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Обработка потери фокуса
  const handleBlur = () => {
    if (searchTerm === '') {
      setIsActive(false);
    }
  };

  // Обработчик клика вне области поиска
  const handleClickOutside = (event) => {
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setIsActive(false); // Скрываем поле ввода, если клик был вне компонента поиска
    }
  };

  // Используем useEffect для добавления слушателя на клик по документу
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside); // Убираем слушатель при размонтировании компонента
    };
  }, []);

  return (
    <div className="search-container" ref={searchRef}>
      <SearchIcon
        id="searchIcon"
        className={isActive ? 'hide' : ''}
        onClick={toggleSearch} // Включение активного поиска по клику на иконку
        fontSize="small"
      />
      <input
        type="text"
        id="searchInput"
        className={isActive ? 'active' : ''} // Стили для активного поиска
        placeholder="Поиск чатов..."
        value={searchTerm}
        onChange={handleInputChange} // Обновление состояния при вводе
        onFocus={() => setIsActive(true)} // Включение поиска при фокусе на input
        onBlur={handleBlur} // Выход из активного состояния при потере фокуса
      />
    </div>
  );
};

SearchBar.propTypes = {
  searchTerm: PropTypes.string.isRequired, // Текущий текст поиска
  setSearchTerm: PropTypes.func.isRequired, // Функция для обновления текста поиска
};

export default SearchBar;
