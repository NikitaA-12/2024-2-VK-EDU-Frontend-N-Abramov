import React, { useState } from 'react';
import './LanguageModal.css';

interface LanguageModalProps {
  languages: { [key: string]: string };
  onSelectLanguage: (lang: string) => void;
  onClose: () => void;
}

const LanguageModal: React.FC<LanguageModalProps> = ({ languages, onSelectLanguage, onClose }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLanguages = Object.entries(languages).filter(([_, langName]) =>
    langName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleLanguageClick = (langCode: string) => {
    console.log(`Language selected: ${langCode}`);
    onSelectLanguage(langCode);
  };

  return (
    <div className="language-modal">
      <div className="language-modal__content">
        <input
          type="text"
          className="language-modal__search"
          placeholder="Поиск..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <ul className="language-modal__list">
          {filteredLanguages.map(([langCode, langName]) => (
            <li
              key={langCode}
              className="language-modal__item"
              onClick={() => handleLanguageClick(langCode)}>
              {langName}
            </li>
          ))}
        </ul>
        <button className="language-modal__close" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default LanguageModal;
