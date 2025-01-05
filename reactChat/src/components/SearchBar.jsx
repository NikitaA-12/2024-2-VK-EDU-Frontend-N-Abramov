import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  const [isActive, setIsActive] = useState(false);
  const searchRef = useRef(null);

  const toggleSearch = () => {
    setIsActive(true);
  };

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleBlur = () => {
    if (searchTerm === '') {
      setIsActive(false);
    }
  };

  const handleClickOutside = (event) => {
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setIsActive(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="search-container" ref={searchRef}>
      <SearchIcon
        id="searchIcon"
        className={isActive ? 'hide' : ''}
        onClick={toggleSearch}
        fontSize="small"
      />
      <input
        type="text"
        id="searchInput"
        className={isActive ? 'active' : ''}
        placeholder="Поиск чатов..."
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setIsActive(true)}
        onBlur={handleBlur}
      />
    </div>
  );
};

SearchBar.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
};

export default SearchBar;
