import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AdminProvider } from './contexts/AdminContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ClientFavoritesProvider } from './contexts/ClientFavoritesContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminProvider>
      <LanguageProvider>
        <ClientFavoritesProvider>
          <App />
        </ClientFavoritesProvider>
      </LanguageProvider>
    </AdminProvider>
  </StrictMode>,
);

