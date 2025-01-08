import SearchBar from './SearchBar';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSearch: () => void;
  onProfileClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ searchTerm, setSearchTerm, onSearch, onProfileClick }) => {
  return (
    <header>
      <a href="#" className="logo">
        Simple Chat
      </a>
      <div className="action-container">
        <div className="search-container">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} onSearch={onSearch} />
        </div>

        <button onClick={onProfileClick} className="profile-btn">
          <PermIdentityIcon className="profile-btn-icon" />
        </button>
      </div>
    </header>
  );
};

export default Header;
