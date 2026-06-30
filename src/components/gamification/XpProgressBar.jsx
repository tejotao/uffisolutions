import React from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/contexts/I18nContext';
import { getXpProgress } from '@/constants/gamification';

const XpProgressBar = ({ user, xp, level }) => {
  const { t } = useI18n();
  const progress = getXpProgress(xp);

  if (!user || !level) return null;

  return (
    <div className="w-full bg-[#111] border-b border-[#1c1c1c] py-2 px-4 shadow-[inset_0_-1px_0_rgba(255,255,255,0.05)]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-6">
        
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-[#1c1c1c] border-2 shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ borderColor: level.color }}>
            <span className="text-lg md:text-xl drop-shadow-md">{level.icon}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white text-xs md:text-sm font-black leading-none">{t(`gamification.levels.${level.name}`) || level.name}</span>
            <span className="text-gray-400 text-[10px] md:text-xs font-bold">{xp} XP</span>
          </div>
        </div>

        <div className="flex-1 w-full max-w-md flex flex-col justify-center gap-1.5">
          <div className="flex justify-between items-end">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{t('gamification.xpPoints')}</span>
            <span className="text-[10px] font-black" style={{ color: level.color }}>
              {progress.isMax ? 'MAX' : `${progress.current} / ${progress.next}`}
            </span>
          </div>
          <div className="h-2.5 md:h-3 w-full bg-[#1a1a1a] rounded-full overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full relative"
              style={{
                background: `linear-gradient(90deg, ${level.color}, #f59e0b)`,
                boxShadow: `0 0 10px ${level.color}80`
              }}
            >
              <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 blur-[2px]" />
            </motion.div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default XpProgressBar;