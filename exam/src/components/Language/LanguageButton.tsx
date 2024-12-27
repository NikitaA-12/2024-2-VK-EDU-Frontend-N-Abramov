import React from 'react';

interface LanguageButtonProps {
  language: string;
  isActive: boolean;
  onClick: () => void;
  label: string;
}

const LanguageButton: React.FC<LanguageButtonProps> = ({ language, isActive, onClick, label }) => {
  return (
    <button className={`translator__language-button ${isActive ? 'active' : ''}`} onClick={onClick}>
      {label}
    </button>
  );
};

export default LanguageButton;
