import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Translator from './components/Translator/Translator';
import HistoryPage from './components/HistoryPage';
import './style/main.scss';

function App() {
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
