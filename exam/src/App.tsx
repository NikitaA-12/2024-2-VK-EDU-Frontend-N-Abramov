import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Translator from './components/Translator';

function App() {
  return (
    <div className="app">
      <nav>
        <ul>
          <li>
            <Link to="/">Translator</Link>
          </li>
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<Translator />} />
      </Routes>
    </div>
  );
}

export default App;
