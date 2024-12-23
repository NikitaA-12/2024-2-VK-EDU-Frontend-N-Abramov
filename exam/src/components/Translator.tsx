import React, { useState, useEffect } from 'react';
import './Translator.css';
import LanguageModal from './LanguageModal';
import languages from './languages.json';
import { useDispatch, useSelector } from 'react-redux';
import { setHistory, addTranslation } from './translationSlice';

const Translator: React.FC = () => {
  const [sourceLanguage, setSourceLanguage] = useState<string>('en-GB');
  const [targetLanguage, setTargetLanguage] = useState<string>('de-DE');
  const [text, setText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentLanguageType, setCurrentLanguageType] = useState<'source' | 'target'>('source');
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const leftLanguages = ['en-GB', 'ru-RU', 'de-DE'];
  const rightLanguages = ['de-DE', 'ru-RU', 'en-GB'];

  const translationHistory = useSelector((state: RootState) => state.translation.history);
  const dispatch = useDispatch();

  const handleLanguageChange = (lang: string, type: 'source' | 'target') => {
    if (type === 'source') {
      setSourceLanguage(lang);
      if (lang === 'en-GB') setTargetLanguage('ru-RU');
      else if (lang === 'ru-RU') setTargetLanguage('en-GB');
    } else {
      setTargetLanguage(lang);
    }
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputText = event.target.value;
    setText(inputText);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const newTimeout = setTimeout(() => {
      fetchTranslation(inputText);
    }, 1000);

    setTypingTimeout(newTimeout);
  };

  const openModal = (type: 'source' | 'target') => {
    setCurrentLanguageType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleLanguageSelect = (lang: string) => {
    handleLanguageChange(lang, currentLanguageType);
    closeModal();
  };

  const fetchTranslation = async (inputText: string) => {
    if (inputText) {
      try {
        const response = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
            inputText,
          )}&langpair=${sourceLanguage}|${targetLanguage}`,
          { method: 'GET' },
        );

        const data = await response.json();

        if (data.responseData && data.responseData.translatedText) {
          const newTranslation = {
            sourceText: inputText,
            translatedText: data.responseData.translatedText,
            sourceLanguage,
            targetLanguage,
            timestamp: new Date().toISOString(),
          };
          setTranslatedText(data.responseData.translatedText);

          const updatedHistory = [newTranslation, ...translationHistory];
          dispatch(addTranslation(newTranslation));
          localStorage.setItem('translationHistory', JSON.stringify(updatedHistory));
        } else {
          setTranslatedText('Ошибка перевода');
        }
      } catch (error) {
        setTranslatedText('Ошибка при переводе');
      }
    }
  };

  const swapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem('translationHistory');
    if (savedHistory) {
      dispatch(setHistory(JSON.parse(savedHistory)));
    }
  }, [dispatch]);

  return (
    <div className="translator">
      <div className="translator__column">
        <div className="translator__controls">
          {leftLanguages.map((lang) => (
            <button
              key={lang}
              className={`translator__language-button ${
                lang === sourceLanguage ? 'translator__language-button--active' : ''
              }`}
              onClick={() => handleLanguageChange(lang, 'source')}>
              {languages[lang]}
            </button>
          ))}
          <button className="translator__icon" onClick={() => openModal('source')}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M5.41 7.59L4 9l8 8 8-8-1.41-1.41L12 14.17"></path>
            </svg>
          </button>
        </div>
        <textarea
          className="translator__textarea"
          placeholder="Введите текст..."
          value={text}
          onChange={handleTextChange}></textarea>
      </div>

      <div className="translator__swap-languages">
        <button className="translator__swap-button" onClick={swapLanguages}>
          <svg width="48" height="48" viewBox="0 0 24 24">
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div className="translator__column">
        <div className="translator__controls">
          {rightLanguages.map((lang) => (
            <button
              key={lang}
              className={`translator__language-button ${
                lang === targetLanguage ? 'translator__language-button--active' : ''
              }`}
              onClick={() => handleLanguageChange(lang, 'target')}>
              {languages[lang]}
            </button>
          ))}
          <button className="translator__icon" onClick={() => openModal('target')}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M5.41 7.59L4 9l8 8 8-8-1.41-1.41L12 14.17"></path>
            </svg>
          </button>
        </div>
        <div className="translator__output">
          {translatedText || 'Переведенный текст появится здесь...'}
        </div>
      </div>

      <div className="translator__history">
        <h3>История переводов</h3>
        <ul>
          {translationHistory.map((item, index) => (
            <li key={index}>
              <div>
                <strong>{languages[item.sourceLanguage]}:</strong> {item.sourceText}
              </div>
              <div>
                <strong>{languages[item.targetLanguage]}:</strong> {item.translatedText}
              </div>
              <div>
                <small>{new Date(item.timestamp).toLocaleString()}</small>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {isModalOpen && (
        <LanguageModal
          languages={languages}
          onSelectLanguage={handleLanguageSelect}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default Translator;
