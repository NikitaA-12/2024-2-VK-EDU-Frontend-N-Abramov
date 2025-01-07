import { useNavigate } from 'react-router-dom';
import useTranslationHistory from '../hooks/useTranslationHistory';

// Маппинг для перевода кодов языков в их полные названия
const languageNames: { [key: string]: string } = {
  'en-GB': 'Английский (Великобритания)',
  'ru-RU': 'Русский',
  'de-DE': 'Немецкий',
};

const HistoryPage: React.FC = () => {
  const translationHistory = useTranslationHistory();
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div className="history-page">
      <button className="history-page__back-button" onClick={handleBackClick}>
        <span className="material-icons">arrow_back</span> Назад
      </button>
      <h1>История переводов</h1>
      {translationHistory.length > 0 ? (
        <ul className="history-page__list">
          {translationHistory.map((item, index) => (
            <li key={index} className="history-page__entry">
              <div className="history-page__entry-item">
                <strong>
                  {languageNames[item.sourceLanguage] || item.sourceLanguage} →{' '}
                  {languageNames[item.targetLanguage] || item.targetLanguage}
                </strong>
              </div>
              <div className="history-page__entry-item translation">
                Перевод: {item.sourceText} → {item.translatedText}
              </div>

              <div className="history-page__entry-item">
                {new Date(item.timestamp).toLocaleString('ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>История пуста.</p>
      )}
    </div>
  );
};

export default HistoryPage;
