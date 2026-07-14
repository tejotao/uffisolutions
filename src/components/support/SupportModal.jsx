
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, LifeBuoy, Mail, Clock, CheckCircle2 } from 'lucide-react';
import { createTicket, getMyTickets } from '@/lib/supportQueries';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const SUPPORT_EMAIL = 'us@uffisolutions.com';

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function SupportModal({ user, onClose }) {
  const { toast } = useToast();
  const [type, setType] = useState('support');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ticketRef, setTicketRef] = useState(null);
  const [myTickets, setMyTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getMyTickets(user.id).then(setMyTickets);
  }, [user.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast({ title: 'Please fill in both subject and message.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await createTicket({ userId: user.id, type, subject, message });
      if (error) throw error;

      const ref = data.id.slice(0, 8).toUpperCase();
      const mailSubject = `[Ticket #${ref}] ${subject}`;
      const mailBody = `${message}\n\n---\nTicket ID: ${ref}\nAccount: ${user.email}`;
      const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;

      setTicketRef(ref);
      setMyTickets((prev) => [data, ...prev]);
      window.location.href = mailtoUrl;
    } catch {
      toast({ title: 'Error opening ticket', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2a2a2a] shrink-0">
          <div className="flex items-center gap-2.5">
            <LifeBuoy size={18} className="text-amber-400" />
            <h2 className="text-lg font-bold text-white">Contact Support</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {ticketRef ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Mail className="text-emerald-400" size={24} />
              </div>
              <h3 className="text-white font-bold mb-2">Ticket #{ticketRef} opened</h3>
              <p className="text-sm text-zinc-400 mb-1">Your email app should have opened with the message ready to send.</p>
              <p className="text-xs text-zinc-600">If it didn't, email us directly at {SUPPORT_EMAIL} and mention ticket #{ticketRef}.</p>
            </div>
          ) : myTickets.length > 0 && !showForm ? (
            <div className="space-y-4">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Your tickets</p>
              <div className="space-y-2.5">
                {myTickets.map((t) => {
                  const ref = t.id.slice(0, 8).toUpperCase();
                  const resolved = t.status === 'resolved';
                  return (
                    <div key={t.id} className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-3.5">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <p className="text-sm font-semibold text-white">{t.subject}</p>
                        <span className={cn('shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide',
                          resolved ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' : 'bg-amber-500/10 text-amber-400 border-amber-500/25')}>
                          {resolved ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                          {resolved ? 'Resolved' : 'Open'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600">#{ref} · {formatDate(t.created_at)}</p>
                    </div>
                  );
                })}
              </div>
              <button type="button" onClick={() => setShowForm(true)}
                className="w-full flex justify-center items-center gap-2 py-2.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-black transition-colors">
                <Mail size={14} /> Open New Ticket
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {myTickets.length > 0 && (
                <button type="button" onClick={() => setShowForm(false)}
                  className="text-xs text-zinc-500 hover:text-white transition-colors">
                  ← Back to your tickets
                </button>
              )}
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Type</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setType('support')}
                    className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${type === 'support' ? 'bg-amber-500/10 border-amber-500/40 text-amber-400' : 'bg-[#0f0f0f] border-[#2a2a2a] text-zinc-400 hover:text-white'}`}>
                    Support Request
                  </button>
                  <button type="button" onClick={() => setType('feedback')}
                    className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${type === 'feedback' ? 'bg-amber-500/10 border-amber-500/40 text-amber-400' : 'bg-[#0f0f0f] border-[#2a2a2a] text-zinc-400 hover:text-white'}`}>
                    Feedback
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Subject</label>
                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                  placeholder="Briefly describe what this is about"
                  className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Message</label>
                <textarea rows="5" value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's going on..."
                  className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors resize-none" />
              </div>

              <p className="text-xs text-zinc-600">
                We'll record this with a ticket ID and open your email app to send it to us — that's where the conversation continues.
              </p>

              <button type="submit" disabled={submitting}
                className="w-full flex justify-center items-center gap-2 py-2.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-black transition-colors disabled:opacity-50">
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                {submitting ? 'Opening ticket...' : 'Open Ticket & Email Us'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
