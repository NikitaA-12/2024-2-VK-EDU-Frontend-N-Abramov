import React, { useState, useMemo } from 'react';

interface LanguageModalProps {
  languages: Record<string, string>;
  onSelectLanguage: (lang: string) => void;
  onClose: () => void;
  selectedLanguage: string;
}

const LanguageModal: React.FC<LanguageModalProps> = ({
  languages,
  onSelectLanguage,
  onClose,
  selectedLanguage,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLanguageCodes = useMemo(() => {
    if (!searchQuery.trim()) return Object.keys(languages);
    const lowerCaseQuery = searchQuery.toLowerCase();
    return Object.keys(languages).filter((langCode) =>
      languages[langCode].toLowerCase().includes(lowerCaseQuery),
    );
  }, [searchQuery, languages]);

  const handleLanguageClick = (langCode: string) => {
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
        <div className="language-modal__list-wrapper">
          <ul className="language-modal__list">
            {filteredLanguageCodes.map((langCode) => (
              <li
                key={langCode}
                className={`language-modal__item ${langCode === selectedLanguage ? 'active' : ''}`} // Добавляем класс active для выбранного языка
                onClick={() => handleLanguageClick(langCode)}>
                {languages[langCode]}
              </li>
            ))}
          </ul>
        </div>
        <button className="language-modal__close" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default LanguageModal;
