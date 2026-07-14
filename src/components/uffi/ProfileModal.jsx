
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, CheckCircle, Lock } from 'lucide-react';
import { updateUser } from '@/lib/catalogQueries';
import { updatePassword } from '@/lib/supabaseAuth';
import { useToast } from '@/components/ui/use-toast';
import { getInitials } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { useLanguage } from '@/contexts/LanguageContext';

const CONTACT_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'phone', label: 'Phone Call' },
];

const FIELD_KEYS = [
  'full_name', 'phone', 'whatsapp', 'contact_preference',
  'address_street', 'address_number', 'city', 'postal_code', 'country', 'birth_date', 'language',
];

const DEFAULTS = { contact_preference: 'email', language: 'en' };
const emptyForm = () => FIELD_KEYS.reduce((acc, key) => ({ ...acc, [key]: DEFAULTS[key] || '' }), {});

export default function ProfileModal({ user, onClose }) {
  const { toast } = useToast();
  const { availableLanguages, changeLanguage } = useLanguage();
  const [formData, setFormData] = useState(emptyForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select(FIELD_KEYS.join(','))
        .eq('id', user.id)
        .single();
      if (cancelled) return;
      if (data) {
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          whatsapp: data.whatsapp || '',
          contact_preference: data.contact_preference || 'email',
          address_street: data.address_street || '',
          address_number: data.address_number || '',
          city: data.city || '',
          postal_code: data.postal_code || '',
          country: data.country || '',
          birth_date: data.birth_date || '',
          language: data.language || 'en',
        });
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData, preferred_language: formData.language };
      Object.keys(payload).forEach((key) => { if (payload[key] === '') payload[key] = null; });
      const { error } = await updateUser(user.id, payload);
      if (error) throw error;
      changeLanguage(formData.language);
      toast({ title: 'Profile updated', className: 'border-emerald-500 bg-zinc-900 text-white' });
      onClose();
    } catch {
      toast({ title: 'Error saving profile', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({ title: 'Password must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    setChangingPassword(true);
    try {
      const { success, error } = await updatePassword(newPassword);
      if (!success) throw error;
      toast({ title: 'Password updated', className: 'border-emerald-500 bg-zinc-900 text-white' });
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast({ title: 'Error updating password', variant: 'destructive' });
    } finally {
      setChangingPassword(false);
    }
  };

  const initials = getInitials(formData.full_name, user.email);

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2a2a2a] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-zinc-800 border border-amber-500/30 flex items-center justify-center text-sm font-bold text-amber-400 shrink-0">
              {initials}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">My Profile</h2>
              <p className="text-xs text-zinc-500">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-amber-500" size={28} />
            </div>
          ) : (
            <form id="profileForm" onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Full Name</label>
                <input type="text" name="full_name" value={formData.full_name} onChange={handleChange}
                  className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="Your full name" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Phone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="+44 20 0000 0000" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">WhatsApp</label>
                  <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange}
                    className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="+44 20 0000 0000" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Preferred Contact Method</label>
                  <select name="contact_preference" value={formData.contact_preference} onChange={handleChange}
                    className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors appearance-none">
                    {CONTACT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Language</label>
                  <select name="language" value={formData.language} onChange={handleChange}
                    className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors appearance-none">
                    {availableLanguages.map((lang) => (
                      <option key={lang.code} value={lang.code}>{lang.flag} {lang.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-1 border-t border-[#2a2a2a]">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 mt-4">Address</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-zinc-500 mb-1.5">Street</label>
                    <input type="text" name="address_street" value={formData.address_street} onChange={handleChange}
                      className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5">Number</label>
                    <input type="text" name="address_number" value={formData.address_number} onChange={handleChange}
                      className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5">City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange}
                      className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5">Postal Code</label>
                    <input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange}
                      className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5">Country</label>
                    <input type="text" name="country" value={formData.country} onChange={handleChange}
                      className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Date of Birth</label>
                <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange}
                  className="w-full sm:w-1/2 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors" />
              </div>
            </form>
          )}

          {!loading && (
            <div className="pt-5 mt-5 border-t border-[#2a2a2a]">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Lock size={12} /> Change Password
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors" />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors" />
              </div>
              <button type="button" onClick={handleChangePassword} disabled={changingPassword || !newPassword}
                className="px-5 py-2 rounded-xl font-bold bg-zinc-800 hover:bg-zinc-700 text-white transition-colors disabled:opacity-50 flex items-center gap-2 text-sm">
                {changingPassword ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                {changingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-[#2a2a2a] flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} disabled={saving}
            className="px-5 py-2.5 rounded-xl font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
            Cancel
          </button>
          <button type="submit" form="profileForm" disabled={saving || loading}
            className="px-6 py-2.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-black transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
