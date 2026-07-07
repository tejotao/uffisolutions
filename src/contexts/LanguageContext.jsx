
import React, { createContext, useContext, useState } from 'react';
import { getTranslation } from '@/lib/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Always starts in English on a fresh page load — deliberately not
  // restored from a previous session, so every first read of any page
  // has a consistent, predictable starting language.
  const [language, setLanguage] = useState('en');
  const [userChangedLanguage, setUserChangedLanguage] = useState(false);

  const availableLanguages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' }
  ];

  const changeLanguage = (lang) => {
    setLanguage(lang);
    setUserChangedLanguage(true);
  };

  const t = (key) => {
    return getTranslation(language, key);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, userChangedLanguage, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
