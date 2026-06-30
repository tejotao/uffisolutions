import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/contexts/I18nContext';
import ConfettiEffect from './ConfettiEffect';

const LevelUpCelebration = ({ newLevel, onClose }) => {
  const { t } = useI18n();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!newLevel) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <ConfettiEffect />
        
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 15, stiffness: 100, duration: 0.5 }}
          className="bg-[#141414] border-2 border-[#f59e0b] p-8 md:p-10 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.3)] flex flex-col items-center text-center w-full max-w-[400px] md:max-w-[450px]"
        >
          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", delay: 0.2, duration: 0.8 }}
            className="text-7xl md:text-8xl mb-6 drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]"
            style={{ color: newLevel.color }}
          >
            {newLevel.icon}
          </motion.div>
          
          <h2 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight">
            {t('gamification.levelUpTitle')} <br/>
            <span style={{ color: newLevel.color }} className="drop-shadow-lg text-3xl md:text-4xl">
              {t(`gamification.levels.${newLevel.name}`) || newLevel.name}
            </span>
          </h2>
          
          <p className="text-gray-400 text-base md:text-lg mb-8 font-medium">
            {t('gamification.levelUpDesc')}
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-black py-4 px-10 rounded-xl w-full text-lg shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all"
          >
            {t('gamification.continue')}
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LevelUpCelebration;