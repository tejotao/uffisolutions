
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, Loader2, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loginWithEmail } from '@/lib/supabaseAuth';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import Logo from '@/components/uffi/Logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: t('toast.error'),
        description: t('toast.fill_fields'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const { success, error } = await loginWithEmail(email, password);

    if (success) {
      setLoginSuccess(true);
      // App.jsx onAuthStateChange will set user → route auto-redirects to /dashboard
    } else {
      toast({
        title: t('toast.error'),
        description: error?.message || t('toast.login_error'),
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    setRecoveryError('');
    
    if (!recoveryEmail) {
      setRecoveryError(t('toast.fill_fields'));
      return;
    }

    setRecoveryLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setIsRecoveryModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error(err);
      setRecoveryError(err.message || t('toast.error'));
    } finally {
      setRecoveryLoading(false);
    }
  };

  const closeModals = () => {
    setIsRecoveryModalOpen(false);
    setIsSuccessModalOpen(false);
    setRecoveryEmail('');
    setRecoveryError('');
  };

  if (loginSuccess) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="text-emerald-400" size={28} />
          </div>
          <p className="text-white font-semibold text-lg">Signing in...</p>
          <p className="text-zinc-500 text-sm">Redirecting to your dashboard</p>
          <Loader2 className="animate-spin text-amber-500 mx-auto" size={20} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-[#f59e0b] transition-colors mb-8 ml-4 sm:ml-0"
        >
          <ArrowLeft size={20} />
          {t('buttons.back')}
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <h2 className="text-center text-3xl font-black text-white tracking-tight">
            {t('auth.welcome_back')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {t('auth.login_sub')}
          </p>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-[#141414] py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-[#2a2a2a]">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                {t('forms.email')}
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-[#2a2a2a] rounded-xl bg-[#1a1a1a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent transition-colors sm:text-sm"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                {t('forms.password')}
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-[#2a2a2a] rounded-xl bg-[#1a1a1a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent transition-colors sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#f59e0b] focus:ring-[#f59e0b] border-[#2a2a2a] rounded bg-[#1a1a1a]"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                  {t('forms.remember_me')}
                </label>
              </div>

              <div className="text-sm">
                <button 
                  type="button"
                  onClick={() => setIsRecoveryModalOpen(true)}
                  className="font-medium text-[#f59e0b] hover:text-[#d97706] transition-colors focus:outline-none"
                >
                  {t('forms.forgot_password')}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-black bg-[#f59e0b] hover:bg-[#d97706] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#141414] focus:ring-[#f59e0b] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  t('forms.login_link')
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#2a2a2a]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#141414] text-gray-500">
                  {t('forms.no_account')}
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link to="/register" className="font-medium text-[#f59e0b] hover:text-[#d97706] transition-colors">
                {t('forms.create_account')}
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recovery Modal */}
      <AnimatePresence>
        {isRecoveryModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6 sm:p-8 w-full max-w-md relative shadow-2xl"
            >
              <button 
                onClick={closeModals}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1"
              >
                <X size={20} />
              </button>
              
              <h3 className="text-2xl font-black text-white mb-2">{t('modals.recovery.title')}</h3>
              <p className="text-gray-400 text-sm mb-6">
                {t('modals.recovery.subtitle')}
              </p>
              
              <form onSubmit={handleRecoverySubmit}>
                <div className="mb-6 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-[#2a2a2a] rounded-xl bg-[#1a1a1a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent transition-colors sm:text-sm"
                    placeholder="Seu email"
                  />
                  {recoveryError && (
                    <p className="text-red-500 text-xs mt-2">{recoveryError}</p>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={recoveryLoading}
                  className="w-full flex justify-center py-3 px-4 rounded-xl shadow-lg text-sm font-bold text-black bg-[#f59e0b] hover:bg-[#d97706] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {recoveryLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    t('modals.recovery.send_link')
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {isSuccessModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-8 w-full max-w-md text-center shadow-2xl relative"
            >
              <button 
                onClick={closeModals}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1"
              >
                <X size={20} />
              </button>
              
              <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} />
              </div>
              
              <h3 className="text-2xl font-black text-white mb-4">{t('modals.recovery.success_title')}</h3>
              
              <p className="text-gray-300 text-sm mb-4">
                {t('modals.recovery.success_desc')}
              </p>
              
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 mb-8">
                <p className="text-xs text-gray-400">
                  {t('modals.recovery.tip')}
                </p>
              </div>
              
              <button
                onClick={closeModals}
                className="w-full flex justify-center py-3 px-4 rounded-xl shadow-lg text-sm font-bold text-black bg-[#f59e0b] hover:bg-[#d97706] transition-all"
              >
                {t('buttons.ok')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
