import React from 'react';
import LanguageButton from './LanguageButton';
import LanguageDropdownButton from './LanguageDropdownButton';
import languages from '../Language/languages.json';

interface LanguageControlProps {
  languagesList: string[];
  activeLanguage: string;
  onLanguageChange: (lang: string) => void;
  onOpenModal: () => void;
  isModalOpen: boolean;
}

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
          label={languages[lang]}
        />
      ))}
      <LanguageDropdownButton isActive={isModalOpen} onClick={onOpenModal} />
    </div>
  );
};

export default LanguageControl;
