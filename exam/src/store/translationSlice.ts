import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TranslationHistoryItem {
  sourceText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestamp: string;
}

interface TranslationState {
  history: TranslationHistoryItem[];
}

const initialState: TranslationState = {
  history: [],
};

const translationSlice = createSlice({
  name: 'translation',
  initialState,
  reducers: {
    setHistory(state, action: PayloadAction<TranslationHistoryItem[]>) {
      state.history = action.payload;

      localStorage.setItem('translationHistory', JSON.stringify(state.history));
    },
    addTranslation(state, action: PayloadAction<TranslationHistoryItem>) {
      state.history = [action.payload, ...state.history];

      localStorage.setItem('translationHistory', JSON.stringify(state.history));
    },
  },
});

export const { setHistory, addTranslation } = translationSlice.actions;
export default translationSlice.reducer;
