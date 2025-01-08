import { useState, useEffect, useRef, ChangeEvent, FocusEvent } from 'react';
import SearchIcon from '@mui/icons-material/Search';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSearch: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, setSearchTerm, onSearch }) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement | null>(null);

  const toggleSearch = () => {
    setIsActive(true);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    if (searchTerm === '') {
      setIsActive(false);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      setIsActive(false);
    }
  };

  const handleSearch = () => {
    onSearch();
  };

  useEffect(() => {
    const handleClickOutsideTyped = (event: MouseEvent) => handleClickOutside(event);
    document.addEventListener('mousedown', handleClickOutsideTyped);

    return () => {
      document.removeEventListener('mousedown', handleClickOutsideTyped);
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
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      />
    </div>
  );
};

export default SearchBar;
