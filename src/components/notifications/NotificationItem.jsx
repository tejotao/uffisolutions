import React from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/contexts/I18nContext';

const getTimeAgo = (dateStr, t) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return t('notifications.time.now') || 'agora mesmo';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${t('notifications.time.ago') || 'há'} ${diffInMinutes} ${t('notifications.time.min') || 'min'}`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${t('notifications.time.ago') || 'há'} ${diffInHours} ${t('notifications.time.hours') || 'horas'}`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${t('notifications.time.ago') || 'há'} ${diffInDays} ${t('notifications.time.days') || 'dias'}`;
};

const NotificationItem = ({ notification, onMarkAsRead, onDelete, onCloseDropdown }) => {
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
      if (onCloseDropdown) onCloseDropdown();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`relative p-4 border-b border-[#2a2a2a] hover:bg-[#1c1c1c] transition-colors group ${!notification.read ? 'bg-[#1a150b]' : 'bg-[#141414]'}`}
    >
      <div 
        className={`flex gap-3 cursor-pointer ${notification.action_url ? 'hover:opacity-80' : ''}`}
        onClick={handleClick}
      >
        <div className="text-2xl mt-1 shrink-0">{notification.icon}</div>
        <div className="flex-1 pr-8">
          <h4 className={`text-sm mb-1 ${!notification.read ? 'text-white font-bold' : 'text-gray-300 font-medium'}`}>
            {notification.title}
          </h4>
          <p className="text-xs text-gray-400 leading-snug mb-2 line-clamp-2">
            {notification.description}
          </p>
          <span className="text-[10px] text-[#f59e0b] font-bold">
            {getTimeAgo(notification.created_at, t)}
          </span>
        </div>
      </div>

      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.read && (
          <button 
            onClick={(e) => { e.stopPropagation(); onMarkAsRead(notification.id); }}
            className="text-gray-400 hover:text-green-500 transition-colors"
            title={t('notifications.markRead') || 'Marcar como lida'}
          >
            <Check size={16} />
          </button>
        )}
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
          className="text-gray-400 hover:text-red-500 transition-colors"
          title={t('notifications.delete') || 'Apagar'}
        >
          <X size={16} />
        </button>
      </div>
      
      {!notification.read && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#f59e0b]" />
      )}
    </motion.div>
  );
};

export default NotificationItem;