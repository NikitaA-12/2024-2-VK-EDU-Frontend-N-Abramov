import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { Provider } from 'react-redux';
import { store } from './store/store.ts';
import { BrowserRouter as Router } from 'react-router-dom';

const basename = '/2024-2-VK-EDU-Frontend-N-Abramov/';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <Router basename={basename}>
        <App />
      </Router>
    </Provider>
  </StrictMode>,
);
