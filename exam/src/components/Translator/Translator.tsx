import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LanguageModalWrapper from '../Language/LanguageModalWrapper';
import TranslatorTextarea from './TranslatorTextarea';
import languages from '../Language/languages.json';
import { useDispatch } from 'react-redux';
import { addTranslation } from '../../store/translationSlice';
import LanguageSwitcher from '../Language/LanguageSwitcher';
import useTranslationAPI from '../../hooks/useTranslationAPI';

const Translator: React.FC = () => {
  const [sourceLanguage, setSourceLanguage] = useState<string>('Autodetect');
  const [targetLanguage, setTargetLanguage] = useState<string>('en-GB');
  const [text, setText] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<{ source: boolean; target: boolean }>({
    source: false,
    target: false,
  });

  const { translatedText, loading, error, fetchTranslation } = useTranslationAPI(
    sourceLanguage,
    targetLanguage,
  );

  const [languagesList, setLanguagesList] = useState<{ left: string[]; right: string[] }>({
    left: ['Autodetect', 'ru-RU', 'de-DE'],
    right: ['en-GB', 'de-DE', 'ru-RU'],
  });

  const dispatch = useDispatch();

  const openModal = (type: 'source' | 'target') => {
    setIsModalOpen((prevState) => ({ ...prevState, [type]: true }));
  };

  const closeModals = () => {
    setIsModalOpen({ source: false, target: false });
  };

  const handleLanguageChange = (lang: string, type: 'source' | 'target') => {
    if (type === 'source') {
      setSourceLanguage(lang);
    } else {
      setTargetLanguage(lang);
    }

    if (lang === (type === 'source' ? sourceLanguage : targetLanguage)) {
      openModal(type);
    }
  };

  const handleLanguageSelect = (lang: string, type: 'source' | 'target') => {
    setLanguagesList((prev) => {
      const updatedLanguages = { ...prev };
      const oppositeType = type === 'source' ? 'left' : 'right';

      updatedLanguages[type] = lang;

      updatedLanguages[oppositeType] = updatedLanguages[oppositeType].filter((l) => l !== lang);

      updatedLanguages[oppositeType] = [lang, ...updatedLanguages[oppositeType]].slice(0, 3);

      return updatedLanguages;
    });

    if (type === 'source') {
      setSourceLanguage(lang);
    } else {
      setTargetLanguage(lang);
    }

    closeModals();
  };

  const swapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);

    setLanguagesList((prev) => ({
      left: [targetLanguage, ...prev.left.filter((l) => l !== targetLanguage)].slice(0, 3),
      right: [sourceLanguage, ...prev.right.filter((l) => l !== sourceLanguage)].slice(0, 3),
    }));

    setText(translatedText);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputText = event.target.value;
    setText(inputText);
    fetchTranslation(inputText);
  };

  useEffect(() => {
    if (translatedText) {
      const newTranslation = {
        sourceText: text,
        translatedText: translatedText,
        sourceLanguage,
        targetLanguage,
        timestamp: new Date().toISOString(),
      };
      dispatch(addTranslation(newTranslation));
      localStorage.setItem('translationHistory', JSON.stringify([newTranslation]));
    }
  }, [translatedText]);

  useEffect(() => {
    if (text && targetLanguage !== 'Autodetect') {
      fetchTranslation(text);
    }
  }, [targetLanguage, text, fetchTranslation]);

  return (
    <div className="translator">
      <LanguageSwitcher
        sourceLanguage={sourceLanguage}
        targetLanguage={targetLanguage}
        leftLanguages={languagesList.left}
        rightLanguages={languagesList.right}
        openSourceModal={() => openModal('source')}
        openTargetModal={() => openModal('target')}
        handleLanguageChange={handleLanguageChange}
        swapLanguages={swapLanguages}
      />

      <div className="translator__body">
        <TranslatorTextarea
          value={text}
          placeholder="Введите текст..."
          onChange={handleTextChange}
          isSource={true}
        />
        <TranslatorTextarea
          value={translatedText}
          placeholder="Переведенный текст появится здесь..."
          onChange={() => {}}
          isSource={false}
        />
      </div>

      <div className="translator__footer">
        <Link to="/history">
          <button className="translator__history-circle">
            <span className="material-icons">history</span>
          </button>
        </Link>
      </div>

      <LanguageModalWrapper
        isOpen={isModalOpen.source}
        onClose={closeModals}
        languages={languages}
        onSelectLanguage={(lang) => handleLanguageSelect(lang, 'source')}
      />

      <LanguageModalWrapper
        isOpen={isModalOpen.target}
        onClose={closeModals}
        languages={languages}
        onSelectLanguage={(lang) => handleLanguageSelect(lang, 'target')}
      />
    </div>
  );
};

export default Translator;
