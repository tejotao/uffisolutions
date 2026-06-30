import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LevelUpNotification = ({ levelName, color, icon }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[9900] bg-[#141414] border border-[#2a2a2a] p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-4 min-w-[300px]"
          style={{ borderBottomColor: color || '#f59e0b', borderBottomWidth: '3px' }}
        >
          <div className="text-3xl animate-bounce">
            {icon || '🎉'}
          </div>
          <div>
            <h4 className="text-white font-black text-sm uppercase tracking-wider">Level Up!</h4>
            <p className="text-gray-300 text-base font-bold">
              Subiste para <span style={{ color: color || '#f59e0b' }}>{levelName}</span>
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LevelUpNotification;