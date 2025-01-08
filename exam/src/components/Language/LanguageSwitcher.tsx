import LanguageControl from './LanguageControl';

interface LanguageSwitcherProps {
  sourceLanguage: string;
  targetLanguage: string;
  leftLanguages: string[];
  rightLanguages: string[];
  openSourceModal: () => void;
  openTargetModal: () => void;
  handleLanguageChange: (lang: string, type: 'source' | 'target') => void;
  swapLanguages: () => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  sourceLanguage,
  targetLanguage,
  leftLanguages,
  rightLanguages,
  openSourceModal,
  openTargetModal,
  handleLanguageChange,
  swapLanguages,
}) => {
  const handleSwap = () => {
    swapLanguages();
  };

  return (
    <div className="translator__header">
      <div className="translator__column translator__source-controls">
        <LanguageControl
          languagesList={leftLanguages}
          activeLanguage={sourceLanguage}
          onLanguageChange={(lang) => handleLanguageChange(lang, 'source')}
          onOpenModal={openSourceModal}
        />
      </div>

      <div className="translator__swap-languages">
        <button className="translator__swap-button" onClick={handleSwap}>
          <span className="material-icons">swap_horiz</span>
        </button>
      </div>

      <div className="translator__column translator__target-controls">
        <LanguageControl
          languagesList={rightLanguages}
          activeLanguage={targetLanguage}
          onLanguageChange={(lang) => handleLanguageChange(lang, 'target')}
          onOpenModal={openTargetModal}
        />
      </div>
    </div>
  );
};

export default LanguageSwitcher;
