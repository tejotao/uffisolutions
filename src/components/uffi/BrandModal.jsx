import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const BrandModal = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const hasSeenModal = localStorage.getItem('uffi_brand_modal_seen');
    if (!hasSeenModal) {
      // Small delay to not be intrusive immediately
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (dontShowAgain) {
      localStorage.setItem('uffi_brand_modal_seen', 'true');
    }
  };

  const handleVisitHub = () => {
    window.open('https://hubukbox.uk', '_blank');
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0f0f0f] border border-[#d4af37]/30 rounded-3xl p-8 z-50 shadow-2xl shadow-[#d4af37]/10"
          >
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#d4af37]/10 rounded-full flex items-center justify-center mb-6 border border-[#d4af37]/20">
                <img 
                  src="https://horizons-cdn.hostinger.com/1db78d05-91f5-4455-8f8f-f031a8b68532/57ad90b43bad7c28578281f506f996bd.png" 
                  alt="UffiSphere" 
                  className="w-10 h-10 object-contain"
                />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">{t('modal.title')}</h3>
              <p className="text-[#d4af37] text-sm font-medium uppercase tracking-wider mb-4">{t('modal.subtitle')}</p>
              
              <p className="text-gray-400 mb-8 leading-relaxed">
                {t('modal.description')}
              </p>

              <div className="space-y-3 w-full">
                <Button 
                  onClick={handleVisitHub}
                  className="w-full bg-[#d4af37] hover:bg-[#b5952f] text-black font-bold h-12 rounded-xl flex items-center justify-center gap-2"
                >
                  {t('modal.visit_btn')} <ExternalLink className="w-4 h-4" />
                </Button>
                
                <Button 
                  onClick={handleClose}
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-white hover:bg-white/5 h-12 rounded-xl"
                >
                  {t('modal.stay_btn')}
                </Button>
              </div>

              <div className="mt-6 flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="dontShow" 
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="rounded border-gray-700 bg-gray-800 text-[#d4af37] focus:ring-[#d4af37]"
                />
                <label htmlFor="dontShow" className="text-xs text-gray-500 select-none cursor-pointer">
                  {t('modal.dont_show')}
                </label>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BrandModal;