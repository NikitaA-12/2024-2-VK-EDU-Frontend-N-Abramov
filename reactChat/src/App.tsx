import React, { useState } from 'react';
import TranslateUtils from './index';

const App = () => {
  const [inputText, setInputText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleTranslate = async () => {
    if (inputText) {
      try {
        const translated = await TranslateUtils.translate(inputText, 'ru', 'en');
        setTranslatedText(translated);
        setError('');
      } catch (err) {
        console.error('Ошибка при переводе:', err);
        setError('Ошибка при переводе');
        setTranslatedText('');
      }
    }
  };

  return (
    <div>
      <h1>Переводчик</h1>
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Введите текст"
      />
      <button onClick={handleTranslate}>Перевести</button>

      {error && <div style={{ color: 'red' }}>{error}</div>}
      {translatedText && !error && (
        <div>
          <h3>Перевод:</h3>
          <p>{translatedText}</p>
        </div>
      )}
    </div>
  );
};

export default App;
