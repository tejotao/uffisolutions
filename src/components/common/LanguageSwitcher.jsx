
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export default function LanguageSwitcher({ className, showAllActive = false, onShowAllProducts = null, onLanguageSelect = null }) {
  const { language, changeLanguage, availableLanguages } = useLanguage();

  return (
    <div className={cn("flex items-center gap-1.5 p-1 rounded-xl", className)}>
      {onShowAllProducts && (
        <>
          <button
            onClick={() => onShowAllProducts()}
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg text-2xl transition-all duration-200",
              showAllActive
                ? "bg-[#f59e0b]/20 border border-[#f59e0b] scale-110 z-10 shadow-lg"
                : "border border-transparent bg-transparent hover:bg-[#222] opacity-60 hover:opacity-100"
            )}
            title="Show All Languages"
          >
            🌍
          </button>
          <div className="w-px h-6 bg-[#2a2a2a] mx-1"></div>
        </>
      )}
      
      {availableLanguages.map(lang => (
        <button
          key={lang.code}
          onClick={() => { changeLanguage(lang.code); onLanguageSelect?.(lang.code); }}
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-lg text-2xl transition-all duration-200",
            (!showAllActive && language === lang.code)
              ? "bg-[#f59e0b]/20 border border-[#f59e0b] scale-110 z-10 shadow-lg"
              : "border border-transparent bg-transparent hover:bg-[#222] opacity-60 hover:opacity-100"
          )}
          title={lang.name}
        >
          {lang.flag}
        </button>
      ))}
    </div>
  );
}
