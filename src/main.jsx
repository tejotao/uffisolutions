
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { Toaster } from '@/components/ui/toaster';

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <LanguageProvider>
      <AuthProvider>
        <NotificationProvider>
          <App />
          <Toaster />
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  </>
);
