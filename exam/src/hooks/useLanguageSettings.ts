import { useState, useCallback } from 'react';

interface LanguageSettings {
  sourceLanguage: string;
  targetLanguage: string;
  languagesList: {
    left: string[];
    right: string[];
  };
  isSourceModalOpen: boolean;
  isTargetModalOpen: boolean;
  handleLanguageChange: (lang: string, type: 'source' | 'target') => void;
  swapLanguages: () => void;
  openSourceModal: (isOpen: boolean) => void;
  openTargetModal: (isOpen: boolean) => void;
}

const useLanguageSettings = () => {
  const [sourceLanguage, setSourceLanguage] = useState<string>('en-GB');
  const [targetLanguage, setTargetLanguage] = useState<string>('de-DE');
  const [languagesList, setLanguagesList] = useState<{ left: string[]; right: string[] }>({
    left: ['en-GB', 'ru-RU', 'de-DE'],
    right: ['de-DE', 'ru-RU', 'en-GB'],
  });
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isSourceModalOpen, setIsSourceModalOpen] = useState<boolean>(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState<boolean>(false);

  const handleLanguageChange = useCallback((lang: string, type: 'source' | 'target') => {
    if (type === 'source') {
      setSourceLanguage(lang);
    } else {
      setTargetLanguage(lang);
    }
  }, []);

  const swapLanguages = useCallback(() => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);

    const newText = translatedText;
    setTranslatedText('');
    fetchTranslation(newText);

    setLanguagesList((prev) => ({
      left: [targetLanguage, ...prev.left.filter((l) => l !== targetLanguage)].slice(0, 3),
      right: [sourceLanguage, ...prev.right.filter((l) => l !== sourceLanguage)].slice(0, 3),
    }));
  }, [sourceLanguage, targetLanguage, translatedText, fetchTranslation]);

  const openSourceModal = (isOpen: boolean) => setIsSourceModalOpen(isOpen);
  const openTargetModal = (isOpen: boolean) => setIsTargetModalOpen(isOpen);

  return {
    sourceLanguage,
    targetLanguage,
    languagesList,
    isSourceModalOpen,
    isTargetModalOpen,
    handleLanguageChange,
    swapLanguages,
    openSourceModal,
    openTargetModal,
    translatedText,
  };
};

export default useLanguageSettings;
