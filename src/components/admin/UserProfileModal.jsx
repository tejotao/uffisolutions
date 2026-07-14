
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, CheckCircle, Contact } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { updateUser } from '@/lib/catalogQueries';
import { useToast } from '@/components/ui/use-toast';
import { getInitials, cn } from '@/lib/utils';

const CLASSIFICATION_OPTIONS = ['VIP', 'Standard', 'Lead', 'At risk', 'Inactive'];

const CONTACT_LABELS = { email: 'Email', whatsapp: 'WhatsApp', phone: 'Phone Call' };

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const ReadField = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-sm text-zinc-200">{value || '—'}</p>
  </div>
);

export default function UserProfileModal({ targetUser, onClose, onSaved, isSelf }) {
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [classification, setClassification] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUser.id)
        .single();
      if (cancelled) return;
      setProfile(data || null);
      setClassification(data?.classification || '');
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [targetUser.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await updateUser(targetUser.id, { classification: classification || null });
      if (error) throw error;
      toast({ title: 'Classification updated', className: 'border-emerald-500 bg-zinc-900 text-white' });
      onSaved?.();
      onClose();
    } catch (error) {
      const message = error?.message?.includes('protected fields')
        ? 'You cannot set your own classification'
        : 'Error updating classification';
      toast({ title: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const initials = getInitials(profile?.full_name, targetUser.email);
  const address = profile
    ? [profile.address_street, profile.address_number, profile.city, profile.postal_code, profile.country]
        .filter(Boolean).join(', ')
    : '';

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-4 bg-black/85 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-[#111] border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold text-amber-400 shrink-0">
              {initials}
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Contact size={15} className="text-amber-400" /> User Profile
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">{targetUser.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800">
            <X size={17} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto custom-scrollbar space-y-5">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-amber-500" size={28} />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2">
                  Classification (admin only)
                </label>
                <select
                  value={classification}
                  onChange={(e) => setClassification(e.target.value)}
                  disabled={isSelf}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">— Not set —</option>
                  {CLASSIFICATION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {isSelf && (
                  <p className="text-xs text-zinc-500 mt-1.5">You cannot classify your own account.</p>
                )}
              </div>

              <div className="border-t border-zinc-800 pt-4 grid grid-cols-2 gap-4">
                <ReadField label="Full Name" value={profile?.full_name} />
                <ReadField label="Client Code" value={profile?.client_code} />
                <ReadField label="Phone" value={profile?.phone} />
                <ReadField label="WhatsApp" value={profile?.whatsapp} />
                <ReadField label="Preferred Contact" value={CONTACT_LABELS[profile?.contact_preference] || profile?.contact_preference} />
                <ReadField label="Date of Birth" value={formatDate(profile?.birth_date)} />
                <div className="col-span-2">
                  <ReadField label="Address" value={address} />
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-4 grid grid-cols-2 gap-4">
                <ReadField label="Signed Up" value={formatDate(profile?.created_at)} />
                <ReadField label="Last Login" value={formatDate(profile?.last_login)} />
              </div>
            </>
          )}
        </div>

        <div className="p-5 border-t border-zinc-800 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} disabled={saving} className="px-5 py-2.5 rounded-xl font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading || isSelf}
            className={cn('px-6 py-2.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-black transition-colors disabled:opacity-50 flex items-center gap-2')}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            {saving ? 'Saving...' : 'Save Classification'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
