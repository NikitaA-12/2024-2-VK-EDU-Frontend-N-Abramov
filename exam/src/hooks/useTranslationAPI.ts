import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';

const useTranslationAPI = (sourceLanguage: string, targetLanguage: string) => {
  const [translatedText, setTranslatedText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Дебаунсинг для запроса перевода
  const fetchTranslation = useCallback(
    debounce(async (inputText: string) => {
      if (inputText.trim()) {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
              inputText,
            )}&langpair=${sourceLanguage}|${targetLanguage}`,
          );
          const data = await response.json();
          if (data.responseData?.translatedText) {
            setTranslatedText(data.responseData.translatedText);
          } else {
            setError('Ошибка перевода');
          }
        } catch {
          setError('Ошибка при переводе');
        } finally {
          setLoading(false);
        }
      }
    }, 600), // Задержка 600 мс
    [sourceLanguage, targetLanguage],
  );

  useEffect(() => {
    return () => {
      fetchTranslation.cancel(); // Очистка дебаунса при размонтировании компонента
    };
  }, [fetchTranslation]);

  return { translatedText, loading, error, fetchTranslation };
};

export default useTranslationAPI;
