
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTranslation } from '@/lib/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [userChangedLanguage, setUserChangedLanguage] = useState(false);

  const availableLanguages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' }
  ];

  useEffect(() => {
    const savedLang = localStorage.getItem('app-language');
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    setUserChangedLanguage(true);
    localStorage.setItem('app-language', lang);
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
