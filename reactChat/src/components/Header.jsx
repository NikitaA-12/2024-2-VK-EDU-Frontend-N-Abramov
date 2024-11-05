import PropTypes from 'prop-types';
import SearchBar from './SearchBar';
const Header = ({ searchTerm, setSearchTerm, onSearch }) => {
  return (
    <header>
      <a href="#" className="logo">
        Simple Chat
      </a>
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} onSearch={onSearch} />
    </header>
  );
};

Header.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
};

export default Header;
