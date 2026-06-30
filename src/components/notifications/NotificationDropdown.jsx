import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useNotifications } from '@/contexts/NotificationContext';
import { useI18n } from '@/contexts/I18nContext';
import NotificationItem from './NotificationItem';
import { Bell } from 'lucide-react';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, unreadCount } = useNotifications();
  const { t } = useI18n();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute top-14 right-0 w-[90vw] max-w-[350px] bg-[#141414] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden z-50 origin-top-right"
        >
          <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between bg-[#111]">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Bell size={18} className="text-[#f59e0b]" />
              {t('notifications.title') || 'Notificações'}
            </h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllAsRead()}
                className="text-xs text-[#f59e0b] hover:text-[#d97706] font-bold transition-colors"
              >
                {t('notifications.markAllRead') || 'Marcar todas lidas'}
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell size={40} className="mx-auto mb-3 opacity-20" />
                <p>{t('notifications.empty') || 'Sem notificações no momento.'}</p>
              </div>
            ) : (
              notifications.slice(0, 10).map(notif => (
                <NotificationItem 
                  key={notif.id}
                  notification={notif}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                  onCloseDropdown={onClose}
                />
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <Link 
              to="/notifications" 
              onClick={onClose}
              className="block w-full p-3 text-center text-sm font-bold text-gray-400 hover:text-white hover:bg-[#1c1c1c] transition-colors border-t border-[#2a2a2a] bg-[#111]"
            >
              {t('notifications.viewAll') || 'Ver todas as notificações'}
            </Link>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;