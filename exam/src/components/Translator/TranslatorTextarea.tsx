interface TranslatorTextareaProps {
  value: string;
  placeholder: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isSource: boolean; // Флаг: это текст исходного языка или перевода
}

const TranslatorTextarea: React.FC<TranslatorTextareaProps> = ({
  value,
  placeholder,
  onChange,
  isSource,
}) => {
  return (
    <textarea
      className={`translator__textarea ${
        isSource ? 'translator__textarea--source' : 'translator__textarea--target'
      }`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
};

export default TranslatorTextarea;
