import { supabase } from './supabaseClient';

// Get all notifications for a user
export const getNotifications = async (userId) => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) { console.error('getNotifications error:', error); return []; }
  return data || [];
};

// Get unread notifications count
export const getUnreadCount = async (userId) => {
  if (!userId) return 0;
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);
  if (error) return 0;
  return count || 0;
};

// Mark a notification as read
export const markAsRead = async (notificationId) => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);
  if (error) { console.error('markAsRead error:', error); return false; }
  return true;
};

// Mark all notifications as read for a user
export const markAllAsRead = async (userId) => {
  if (!userId) return false;
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
  if (error) { console.error('markAllAsRead error:', error); return false; }
  return true;
};

// Delete a notification
export const deleteNotification = async (notificationId) => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);
  if (error) { console.error('deleteNotification error:', error); return false; }
  return true;
};

// Create a notification for a user (admin use)
export const createNotification = async (userId, type, title, description) => {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      description,
      read: false,
      created_at: new Date().toISOString()
    });
  if (error) { console.error('createNotification error:', error); return false; }
  return true;
};