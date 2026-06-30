import React, { createContext, useContext, useState, useEffect } from 'react';
import ptBr from '../locales/pt-br.json';
import en from '../locales/en.json';
import it from '../locales/it.json';
import es from '../locales/es.json';

const translations = { 'pt-br': ptBr, en, it, es };
const VALID_LANGUAGES = ['pt-br', 'en', 'it', 'es'];

const I18nContext = createContext(null);

export const I18nProvider = ({ children }) => {
  const [lang, setLangState] = useState('pt-br');

  const isValidLanguage = (l) => VALID_LANGUAGES.includes(l) || l === 'pt';

  useEffect(() => {
    const saved = localStorage.getItem('preferredLanguage') || localStorage.getItem('uffisolutions_lang');
    
    if (saved && isValidLanguage(saved)) {
      setLangState(saved === 'pt' ? 'pt-br' : saved);
    } else {
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('pt')) setLangState('pt-br');
      else if (browserLang.startsWith('en')) setLangState('en');
      else if (browserLang.startsWith('it')) setLangState('it');
      else if (browserLang.startsWith('es')) setLangState('es');
      else setLangState('pt-br');
    }
  }, []);

  const changeLanguage = (newLang) => {
    let validLang = isValidLanguage(newLang) ? newLang : 'pt-br';
    if (validLang === 'pt') validLang = 'pt-br';
    
    setLangState(validLang);
    localStorage.setItem('preferredLanguage', validLang);
    localStorage.setItem('uffisolutions_lang', validLang);
  };

  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[lang];
    
    // Attempt to get value in current language
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        value = undefined;
        break;
      }
    }

    // Fallback to pt-br
    if (value === undefined) {
      let fallbackValue = translations['pt-br'];
      for (const fk of keys) {
        if (fallbackValue && fallbackValue[fk] !== undefined) {
          fallbackValue = fallbackValue[fk];
        } else {
          return key; // return key if completely missing
        }
      }
      value = fallbackValue;
    }

    if (typeof value === 'string') {
      return Object.keys(params).reduce(
        (str, paramKey) => str.replace(`{${paramKey}}`, params[paramKey]),
        value
      );
    }
    
    return value;
  };

  const availableLangs = [
    { code: 'pt-br', flag: '🇧🇷', label: 'PT-BR' },
    { code: 'en', flag: '🇬🇧', label: 'EN' },
    { code: 'it', flag: '🇮🇹', label: 'IT' },
    { code: 'es', flag: '🇪🇸', label: 'ES' }
  ];

  return (
    <I18nContext.Provider value={{ t, lang, changeLanguage, setLang: changeLanguage, availableLangs, isValidLanguage }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};