import React, { useState, useEffect } from 'react';
import LanguageModal from './LanguageModal';

interface LanguageModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  languages: Record<string, string>;
  onSelectLanguage: (lang: string) => void;
}

const LanguageModalWrapper: React.FC<LanguageModalWrapperProps> = ({
  isOpen,
  onClose,
  languages,
  onSelectLanguage,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setSelectedLanguage(localStorage.getItem('selectedLanguage') || '');
    }
  }, [isOpen]);

  const handleSelectLanguage = (lang: string) => {
    setSelectedLanguage(lang);
    onSelectLanguage(lang);
    localStorage.setItem('selectedLanguage', lang);
  };

  if (!isOpen) return null;

  return (
    <LanguageModal
      languages={languages}
      onSelectLanguage={handleSelectLanguage}
      onClose={onClose}
      selectedLanguage={selectedLanguage}
    />
  );
};

export default LanguageModalWrapper;
