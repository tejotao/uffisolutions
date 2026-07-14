
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LifeBuoy, AlertTriangle, Mail, CheckCircle, RotateCcw, Loader2, MessageSquare } from 'lucide-react';
import { getAllTickets, resolveTicket, reopenTicket } from '@/lib/supportQueries';
import { useToast } from '@/components/ui/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { canAccess } from '@/lib/rolePermissions';
import { cn } from '@/lib/utils';

const SUPPORT_EMAIL = 'us@uffisolutions.com';

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function TicketCard({ ticket, onResolve, onReopen, busy }) {
  const ref = ticket.id.slice(0, 8).toUpperCase();
  const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Re: [Ticket #${ref}] ${ticket.subject}`)}`;

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide',
              ticket.type === 'feedback' ? 'bg-blue-500/10 text-blue-400 border-blue-500/25' : 'bg-amber-500/10 text-amber-400 border-amber-500/25')}>
              {ticket.type}
            </span>
            <span className="text-[10px] text-zinc-600 font-mono">#{ref}</span>
          </div>
          <h3 className="text-white font-bold text-sm">{ticket.subject}</h3>
        </div>
        <span className="text-[10px] text-zinc-600 whitespace-nowrap">{formatDate(ticket.created_at)}</span>
      </div>

      <p className="text-sm text-zinc-400 whitespace-pre-wrap mb-4">{ticket.message}</p>

      <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
        <p className="text-xs text-zinc-500">
          {ticket.user?.full_name || 'Unknown'} · <span className="text-zinc-600">{ticket.user?.email || '—'}</span>
        </p>
        <div className="flex items-center gap-2">
          <a href={mailtoUrl}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors">
            <Mail size={13} /> Reply
          </a>
          {ticket.status === 'open' ? (
            <button onClick={() => onResolve(ticket.id)} disabled={busy}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors disabled:opacity-50">
              {busy ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />} Mark Resolved
            </button>
          ) : (
            <button onClick={() => onReopen(ticket.id)} disabled={busy}
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors disabled:opacity-50">
              {busy ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />} Reopen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminSupport({ user }) {
  const { toast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const permissions = {
    canRead: canAccess(user, 'support', 'read'),
    canUpdate: canAccess(user, 'support', 'update'),
  };

  const load = async () => {
    setIsLoading(true);
    try {
      setTickets(await getAllTickets());
    } catch {
      toast({ title: 'Error loading tickets', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (permissions.canRead) load(); else setIsLoading(false); }, []);

  if (!permissions.canRead) {
    return (
      <AdminLayout user={user}>
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <AlertTriangle size={48} className="text-red-500" />
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
        </div>
      </AdminLayout>
    );
  }

  const handleResolve = async (id) => {
    if (!permissions.canUpdate) return;
    setBusyId(id);
    const { error } = await resolveTicket(id, user.id);
    if (!error) load();
    setBusyId(null);
  };

  const handleReopen = async (id) => {
    if (!permissions.canUpdate) return;
    setBusyId(id);
    const { error } = await reopenTicket(id);
    if (!error) load();
    setBusyId(null);
  };

  const open = tickets.filter((t) => t.status === 'open');
  const resolved = tickets.filter((t) => t.status === 'resolved');

  return (
    <AdminLayout user={user}>
      <div className="px-6 sm:px-8 py-8 max-w-4xl mx-auto">
        <div className="mb-8 pb-6 border-b border-zinc-800">
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <LifeBuoy className="text-amber-400 w-7 h-7" /> Support
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {open.length} open · {resolved.length} resolved · reply happens by email, this is just the record
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-zinc-600">
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20 text-zinc-600">
            <MessageSquare size={36} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">No tickets yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <section>
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Open ({open.length})</h2>
              {open.length === 0 ? (
                <p className="text-sm text-zinc-600">Nothing open right now.</p>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {open.map((t) => (
                      <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <TicketCard ticket={t} onResolve={handleResolve} onReopen={handleReopen} busy={busyId === t.id} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </section>

            {resolved.length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Resolved ({resolved.length})</h2>
                <div className="space-y-3 opacity-70">
                  {resolved.map((t) => (
                    <TicketCard key={t.id} ticket={t} onResolve={handleResolve} onReopen={handleReopen} busy={busyId === t.id} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
