import PropTypes from 'prop-types';
import SearchBar from './SearchBar';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import { Link } from 'react-router-dom';

const Header = ({ searchTerm, setSearchTerm, onSearch }) => {
  return (
    <header>
      <a href="#" className="logo">
        Simple Chat
      </a>
      <div className="action-container">
        <div className="search-container">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} onSearch={onSearch} />
        </div>

        <Link to="/profile" className="profile-link">
          <PermIdentityIcon className="profile-btn" />
        </Link>
      </div>
    </header>
  );
};

Header.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onProfileClick: PropTypes.func.isRequired,
};

export default Header;
