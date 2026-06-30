import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckSquare, Trash2 } from 'lucide-react';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';
import { useNotifications } from '@/contexts/NotificationContext';
import { useI18n } from '@/contexts/I18nContext';
import NotificationItem from '@/components/notifications/NotificationItem';
import Logo from '@/components/Logo';

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, unreadCount } = useNotifications();
  const { t } = useI18n();
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 flex flex-col relative">
      <Header />

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 md:px-8 pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Logo variant="icon" size="medium" />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center text-[#f59e0b]">
                <Bell size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-black">{t('notifications.title') || 'Notificações'}</h1>
                <p className="text-gray-400 text-sm">Tens {unreadCount} notificações não lidas</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => markAllAsRead()}
              disabled={unreadCount === 0}
              className="flex items-center gap-2 px-4 py-2 bg-[#1c1c1c] text-white text-sm font-bold rounded-lg hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckSquare size={16} />
              {t('notifications.markAllRead') || 'Marcar todas lidas'}
            </button>
          </div>
        </div>

        <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex border-b border-[#2a2a2a] bg-[#111]">
            {[
              { id: 'all', label: t('notifications.filters.all') || 'Todas' },
              { id: 'unread', label: t('notifications.filters.unread') || 'Não Lidas' },
              { id: 'read', label: t('notifications.filters.read') || 'Lidas' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 ${filter === f.id ? 'border-[#f59e0b] text-[#f59e0b] bg-[#1c1c1c]' : 'border-transparent text-gray-400 hover:text-white hover:bg-[#1a1a1a]'}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-16 text-center text-gray-500"
                >
                  <Bell size={64} className="mx-auto mb-4 opacity-20" />
                  <p className="text-lg">{t('notifications.emptyFilter') || 'Nenhuma notificação encontrada nesta aba.'}</p>
                </motion.div>
              ) : (
                filteredNotifications.map(notif => (
                  <NotificationItem 
                    key={notif.id}
                    notification={notif}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}