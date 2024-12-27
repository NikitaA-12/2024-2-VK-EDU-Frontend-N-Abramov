import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setHistory } from '../store/translationSlice';

const useTranslationHistory = () => {
  const translationHistory = useSelector((state: RootState) => state.translation.history);
  const dispatch = useDispatch();

  useEffect(() => {
    const savedHistory = localStorage.getItem('translationHistory');
    if (savedHistory) {
      dispatch(setHistory(JSON.parse(savedHistory)));
    }
  }, [dispatch]);

  return translationHistory;
};

export default useTranslationHistory;
