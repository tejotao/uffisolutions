
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/uffi/Logo';

export default function ResetPasswordPage() {
  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [loading, setLoading]       = useState(false);
  const [done, setDone]             = useState(false);
  const [error, setError]           = useState('');
  const [validSession, setValidSession] = useState(false);
  const [checking, setChecking]     = useState(true);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Supabase sends recovery tokens as hash params (#access_token=...&type=recovery)
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setValidSession(true);
    });
    // Also check session directly
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) setValidSession(true);
      setChecking(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message || 'Could not update password. Try again.');
    } else {
      setDone(true);
      toast({ title: 'Password updated!', className: 'border-emerald-500 bg-zinc-900 text-white' });
      setTimeout(() => navigate('/login'), 2500);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-500" size={28} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <button onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-gray-400 hover:text-[#f59e0b] transition-colors mb-8 ml-4 sm:ml-0">
          <ArrowLeft size={20} /> Back to Login
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="flex justify-center mb-6"><Logo size="lg" /></div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            {done ? 'Password updated!' : 'Set new password'}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {done ? 'Redirecting to login...' : 'Choose a strong password for your account.'}
          </p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#141414] py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-[#2a2a2a]">

          {done ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center">
                <CheckCircle size={28} className="text-emerald-400" />
              </div>
              <p className="text-zinc-400 text-sm text-center">Your password has been changed. Taking you to login…</p>
            </div>
          ) : !validSession ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <AlertCircle size={40} className="text-amber-500" />
              <p className="text-white font-bold">Invalid or expired link</p>
              <p className="text-zinc-400 text-sm">This reset link has expired or was already used. Request a new one.</p>
              <button onClick={() => navigate('/login')}
                className="mt-2 bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">
                Back to Login
              </button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" minLength={6}
                    className="block w-full pl-10 pr-3 py-3 border border-[#2a2a2a] rounded-xl bg-[#1a1a1a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent transition-colors sm:text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-3 py-3 border border-[#2a2a2a] rounded-xl bg-[#1a1a1a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent transition-colors sm:text-sm" />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                  <AlertCircle size={15} className="shrink-0" /> {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-black bg-[#f59e0b] hover:bg-[#d97706] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#141414] focus:ring-[#f59e0b] transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
