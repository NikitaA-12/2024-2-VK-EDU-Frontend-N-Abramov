import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setHistory } from '../store/translationSlice';
import { RootState } from '../store/store';

const useTranslationHistory = () => {
  const translationHistory = useSelector((state: RootState) => state.translation.history);
  const dispatch = useDispatch();

  useEffect(() => {
    if (translationHistory.length === 0) {
      const savedHistory = localStorage.getItem('translationHistory');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        dispatch(setHistory(parsedHistory));
      }
    }
  }, [dispatch, translationHistory.length]);

  return translationHistory;
};

export default useTranslationHistory;
