import LanguageButton from './LanguageButton';
import LanguageDropdownButton from './LanguageDropdownButton';
import languagesData from '../Language/languages.json';

interface LanguageControlProps {
  languagesList: string[];
  activeLanguage: string;
  onLanguageChange: (lang: string) => void;
  onOpenModal: () => void;
  isModalOpen: boolean;
}

const languages: Record<string, string> = languagesData;

const LanguageControl: React.FC<LanguageControlProps> = ({
  languagesList,
  activeLanguage,
  onLanguageChange,
  onOpenModal,
  isModalOpen,
}) => {
  return (
    <div className="translator__controls">
      {languagesList.map((lang) => (
        <LanguageButton
          key={lang}
          language={lang}
          isActive={lang === activeLanguage}
          onClick={() => onLanguageChange(lang)}
          label={languages[lang] || 'Unknown Language'}
        />
      ))}
      <LanguageDropdownButton isActive={isModalOpen} onClick={onOpenModal} />
    </div>
  );
};

export default LanguageControl;
