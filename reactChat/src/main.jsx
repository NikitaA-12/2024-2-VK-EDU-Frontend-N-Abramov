import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { ChatProvider } from './components/ChatContext.jsx';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <ChatProvider>
        <App />
      </ChatProvider>
    </HashRouter>
  </StrictMode>,
);