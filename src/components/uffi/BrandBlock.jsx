import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Check, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const BrandBlock = () => {
  const { t } = useLanguage();
  const [viewState, setViewState] = useState('hidden'); // 'loading', 'notice', 'bar', 'hidden'

  useEffect(() => {
    // Initial load check
    const storedState = localStorage.getItem('uffi_brand_state');
    if (!storedState) {
      setViewState('notice');
    } else if (storedState === 'accepted') {
      setViewState('bar');
    } else {
      setViewState('hidden');
    }

    // Listener for footer reopen
    window.openBrandBlock = () => {
      setViewState('notice');
      localStorage.removeItem('uffi_brand_state');
    };

    return () => {
      delete window.openBrandBlock;
    };
  }, []);

  const handleAccept = () => {
    localStorage.setItem('uffi_brand_state', 'accepted');
    setViewState('bar');
  };

  const handleDismiss = () => {
    localStorage.setItem('uffi_brand_state', 'dismissed');
    setViewState('hidden');
  };

  if (viewState === 'hidden' || viewState === 'loading') return null;

  return (
    <AnimatePresence mode="wait">
      {viewState === 'notice' && (
        <motion.section
          key="notice"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="bg-[#f5f5f5] text-gray-800 border-b border-gray-200 relative overflow-hidden"
        >
          <div className="max-w-4xl mx-auto px-4 py-8 text-center">
            <div className="flex justify-center mb-4">
               <div className="bg-gray-200 p-2 rounded-full">
                  <Info className="w-5 h-5 text-gray-500" />
               </div>
            </div>
            
            <p className="text-gray-600 leading-relaxed text-sm md:text-base font-medium mb-6 max-w-2xl mx-auto">
              {t('brand_block.text')}
            </p>

            <Button 
              onClick={handleAccept}
              variant="outline"
              className="bg-white hover:bg-gray-50 text-gray-900 border-gray-300 font-medium px-8 py-2 h-auto rounded-full shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              {t('brand_block.accept_btn')}
            </Button>
          </div>
        </motion.section>
      )}

      {viewState === 'bar' && (
        <motion.section
          key="bar"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="bg-neutral-900 border-b border-[#d4af37]/20 relative"
        >
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center relative">
            <a 
              href="https://hubukbox.uk" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#d4af37] hover:text-white transition-colors text-xs md:text-sm font-medium flex items-center gap-2 tracking-wide uppercase"
            >
              {t('brand_block.visit_link')} <ExternalLink className="w-3 h-3" />
            </a>

            <button 
              onClick={handleDismiss}
              className="absolute right-4 text-gray-500 hover:text-white transition-colors p-1"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
};

export default BrandBlock;