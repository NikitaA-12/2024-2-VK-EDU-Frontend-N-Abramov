const API_URL = 'https://api.mymemory.translated.net/get';

export const fetchTranslationAPI = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
): Promise<string | null> => {
  const url = `${API_URL}?q=${encodeURIComponent(
    text,
  )}&langpair=${sourceLanguage}|${targetLanguage}`;

  try {
    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (data.responseStatus !== 200) {
      throw new Error(`API error: ${data.responseDetails}`);
    }

    console.log('API response:', data);
    return data.responseData.translatedText || null;
  } catch (error) {
    console.error('Error fetching translation:', error);
    throw new Error('Failed to get translation');
  }
};
