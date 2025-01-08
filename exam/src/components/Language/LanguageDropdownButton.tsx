interface LanguageDropdownButtonProps {
  isActive: boolean;
  onClick: () => void;
}

const LanguageDropdownButton: React.FC<LanguageDropdownButtonProps> = ({ isActive, onClick }) => {
  return (
    <button className={`translator__icon ${isActive ? 'active' : ''}`} onClick={onClick}>
      <span className="material-icons">keyboard_arrow_down</span>
    </button>
  );
};

export default LanguageDropdownButton;
