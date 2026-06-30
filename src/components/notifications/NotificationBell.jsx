import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationDropdown from './NotificationDropdown';

const NotificationBell = () => {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-300 hover:text-white transition-colors rounded-full hover:bg-white/5"
      >
        <motion.div
          animate={unreadCount > 0 ? {
            rotate: [0, 15, -15, 10, -10, 0],
            transition: { repeat: Infinity, repeatDelay: 5, duration: 0.5 }
          } : {}}
        >
          <Bell className="w-5 h-5 md:w-6 md:h-6" />
        </motion.div>
        
        {unreadCount > 0 && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-[#0a0a0a]"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <NotificationDropdown isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

export default NotificationBell;