import React from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/contexts/I18nContext';
import { Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export default function LanguageDropdown({ className }) {
  const { lang, changeLanguage, availableLangs } = useI18n();

  const currentLang = availableLangs.find(
    (l) => l.code === lang || (lang === 'pt' && l.code === 'pt-br')
  ) || availableLangs[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors focus:outline-none",
            className
          )}
          aria-label="Select Language"
        >
          <span className="text-lg">{currentLang.flag}</span>
          <span className="hidden sm:inline-block">{currentLang.label}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-40 bg-[#141414] border-[#2a2a2a] text-white shadow-xl rounded-xl p-1"
      >
        {availableLangs.map(({ code, flag, label }) => {
          const isActive = lang === code || (lang === 'pt' && code === 'pt-br');
          return (
            <DropdownMenuItem
              key={code}
              onClick={() => changeLanguage(code)}
              className={cn(
                "flex items-center justify-between cursor-pointer rounded-lg px-3 py-2.5 transition-colors mb-1 last:mb-0",
                isActive 
                  ? "bg-[#f59e0b]/10 text-[#f59e0b] focus:bg-[#f59e0b]/20 focus:text-[#f59e0b]" 
                  : "hover:bg-white/10 focus:bg-white/10 text-gray-300"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{flag}</span>
                <span className="font-medium">{label}</span>
              </div>
              {isActive && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}