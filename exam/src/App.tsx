import { Routes, Route, useNavigate } from 'react-router-dom';
import Translator from './components/Translator/Translator';
import HistoryPage from './components/HistoryPage';
import { useEffect } from 'react';
import './style/main.scss';

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Translator />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </div>
  );
}

export default App;
