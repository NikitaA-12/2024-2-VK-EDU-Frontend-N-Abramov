import axios from 'axios';
import { memoize } from './helpers.js';

const deepClone = (obj: any): any => {
  return JSON.parse(JSON.stringify(obj));
};

export const translate = memoize(
  async (
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
    detectLanguage: boolean = false,
  ): Promise<string | null> => {
    try {
      if (!text || text.trim().length === 0) {
        throw new Error('Text for translation is empty');
      }

      let langPair: string;
      if (detectLanguage || !sourceLanguage) {
        langPair = `auto|${targetLanguage}`;
      } else {
        langPair = `${sourceLanguage}|${targetLanguage}`;
      }

      const response = await axios.get(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
          text,
        )}&langpair=${langPair}&mt=1`,
      );

      if (response.data.responseStatus === 200) {
        const translatedText = response.data.responseData.translatedText;
        if (translatedText === text) {
          throw new Error('No translation available');
        }
        return translatedText;
      } else {
        throw new Error(response.data.responseDetails || 'Failed to get translation');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Translation error: ${error.message}`);
      }
      throw new Error('Translation error : An unknown error occurred');
    }
  },
);
