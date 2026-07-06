import { supabase } from './supabaseClient';

export const TICKET_TYPES = ['support', 'feedback'];

export const createTicket = async ({ userId, type, subject, message }) => {
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({ user_id: userId, type, subject, message })
      .select()
      .single();
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('createTicket error:', error);
    return { data: null, error };
  }
};

export const getMyTickets = async (userId) => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) { console.error('getMyTickets error:', error); return []; }
  return data || [];
};

// Admin use — manual two-step join (same pattern as accessQueries.js) so it
// works without a declared FK relationship being selectable in one query.
export const getAllTickets = async () => {
  const { data: tickets, error } = await supabase
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { console.error('getAllTickets error:', error); return []; }
  if (!tickets || tickets.length === 0) return [];

  const userIds = [...new Set(tickets.map((t) => t.user_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', userIds);

  const byId = Object.fromEntries((profiles || []).map((p) => [p.id, p]));
  return tickets.map((t) => ({ ...t, user: byId[t.user_id] || null }));
};

// Powers the badge on the admin nav — count only, no row data needed.
export const getOpenTicketCount = async () => {
  const { count, error } = await supabase
    .from('support_tickets')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'open');
  if (error) { console.error('getOpenTicketCount error:', error); return 0; }
  return count || 0;
};

export const resolveTicket = async (ticketId, resolvedBy) => {
  const { error } = await supabase
    .from('support_tickets')
    .update({ status: 'resolved', resolved_at: new Date().toISOString(), resolved_by: resolvedBy })
    .eq('id', ticketId);
  if (error) console.error('resolveTicket error:', error);
  return { error };
};

export const reopenTicket = async (ticketId) => {
  const { error } = await supabase
    .from('support_tickets')
    .update({ status: 'open', resolved_at: null, resolved_by: null })
    .eq('id', ticketId);
  if (error) console.error('reopenTicket error:', error);
  return { error };
};
