import TranslateUtils from './index.js';

const testCases = [
  { text: 'Hello', sourceLang: 'en', targetLang: 'ru' },
  { text: 'Привет', sourceLang: 'ru', targetLang: 'en' },
  { text: '', sourceLang: 'en', targetLang: 'ru' },
  { text: '   ', sourceLang: 'en', targetLang: 'ru' },
  { text: '1234', sourceLang: 'en', targetLang: 'ru' },
  { text: 'Hello', sourceLang: 'en', targetLang: 'de' },
  { text: 'Bonjour', sourceLang: 'fr', targetLang: 'en' },
  { text: 'Guten Morgen', sourceLang: 'de', targetLang: 'ru' },
  { text: 'Hola', sourceLang: 'es', targetLang: 'fr' },
];

const testTranslation = async (text: string, sourceLang: string, targetLang: string) => {
  try {
    if (!text.trim()) {
      console.log(
        `"${text}" из ${sourceLang} в ${targetLang} → Ошибка: Пустой текст или только пробелы`,
      );
      return;
    }

    const translated = await TranslateUtils.translate(text, sourceLang, targetLang);

    console.log(`"${text}" из ${sourceLang} в ${targetLang} → "${translated}"`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`"${text}" из ${sourceLang} в ${targetLang} → Ошибка: ${error.message}`);
    } else {
      console.error(`"${text}" из ${sourceLang} в ${targetLang} → Неизвестная ошибка`);
    }
  }
};

const runTests = async () => {
  for (const { text, sourceLang, targetLang } of testCases) {
    await testTranslation(text, sourceLang, targetLang);
  }
};

runTests();
