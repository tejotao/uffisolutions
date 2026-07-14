
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, ArrowLeft, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loginWithEmail, signUpWithEmail } from '@/lib/supabaseAuth';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { generateClientCode } from '@/lib/clientCodeGenerator';
import Logo from '@/components/uffi/Logo';

const SUPPORTED_LANGUAGES = ['en', 'pt', 'es', 'it'];

const StepBadge = ({ n, label, active, done }) => (
  <div className="flex items-center gap-2">
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
      done ? 'bg-emerald-500 text-black' : active ? 'bg-[#f59e0b] text-black' : 'bg-[#2a2a2a] text-gray-500'
    }`}>
      {done ? <Check size={13} strokeWidth={3} /> : n}
    </div>
    <span className={`text-xs ${active ? 'text-white font-semibold' : 'text-gray-500'}`}>{label}</span>
  </div>
);

export default function BuyAuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { t, changeLanguage } = useLanguage();

  const [step, setStep] = useState('email'); // 'email' | 'password'
  const [emailExists, setEmailExists] = useState(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showEmailConfirmationModal, setShowEmailConfirmationModal] = useState(false);

  useEffect(() => {
    const lang = searchParams.get('lang');
    if (lang && SUPPORTED_LANGUAGES.includes(lang)) {
      changeLanguage(lang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setCheckingEmail(true);
    try {
      const res = await fetch('/api/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'check-email failed');
      setEmailExists(!!data.exists);
      setStep('password');
    } catch {
      toast({ title: t('toast.error'), description: t('toast.register_error'), variant: 'destructive' });
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const { success, error } = await loginWithEmail(email, password);
    if (success) {
      navigate('/dashboard');
      // App.jsx's onAuthStateChange sets user; UserDashboard resumes the
      // pending purchase (see ProductDetail.jsx's handleBuy).
    } else {
      toast({ title: t('toast.error'), description: error?.message || t('toast.login_error'), variant: 'destructive' });
      setSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!name || !password || !confirmPassword) {
      toast({ title: t('toast.error'), description: t('toast.fill_fields'), variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: t('toast.error'), description: t('toast.password_mismatch'), variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      toast({ title: t('toast.error'), description: t('toast.password_short'), variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const clientCode = await generateClientCode();
      const { success, error } = await signUpWithEmail(email, password, clientCode, name);
      if (success) {
        setShowEmailConfirmationModal(true);
      } else {
        toast({ title: t('toast.error'), description: error?.message || t('toast.register_error'), variant: 'destructive' });
      }
    } catch {
      toast({ title: t('toast.error'), description: t('toast.register_error'), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const backToEmail = () => {
    setStep('email');
    setEmailExists(null);
    setPassword('');
    setConfirmPassword('');
    setName('');
  };

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

        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>
        <h2 className="text-center text-3xl font-black text-white tracking-tight">
          {t('onboard.title')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          {t('onboard.subtitle')}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        {/* Step tracker */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-4 mb-5 flex flex-wrap items-center justify-between gap-3">
          <StepBadge n={1} label={t('onboard.step_email')} active={step === 'email'} done={step === 'password'} />
          <StepBadge n={2} label={emailExists === false ? t('onboard.step_confirm') : t('onboard.step_password')} active={step === 'password'} done={false} />
          <StepBadge n={3} label={t('onboard.step_pay')} active={false} done={false} />
        </div>

        <div className="bg-[#141414] py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-[#2a2a2a]">
          <AnimatePresence mode="wait">
            {step === 'email' && (
              <motion.form key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6" onSubmit={handleEmailSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">{t('forms.email')}</label>
                  <div className="mt-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="email" type="email" autoComplete="email" required autoFocus
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-[#2a2a2a] rounded-xl bg-[#1a1a1a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent transition-colors sm:text-sm"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>
                <button
                  type="submit" disabled={checkingEmail}
                  className="w-full flex justify-center py-3 px-4 rounded-xl shadow-lg text-sm font-bold text-black bg-[#f59e0b] hover:bg-[#d97706] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {checkingEmail ? <Loader2 className="w-5 h-5 animate-spin" /> : t('onboard.continue')}
                </button>
              </motion.form>
            )}

            {step === 'password' && emailExists && (
              <motion.form key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6" onSubmit={handleLoginSubmit}>
                <p className="text-sm text-gray-400 -mt-2">{t('onboard.welcome_back')} <span className="text-white font-semibold">{email}</span></p>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">{t('forms.password')}</label>
                  <div className="mt-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="password" type="password" autoComplete="current-password" required autoFocus
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-[#2a2a2a] rounded-xl bg-[#1a1a1a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent transition-colors sm:text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <button
                  type="submit" disabled={submitting}
                  className="w-full flex justify-center py-3 px-4 rounded-xl shadow-lg text-sm font-bold text-black bg-[#f59e0b] hover:bg-[#d97706] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t('forms.login_link')}
                </button>
                <button type="button" onClick={backToEmail} className="w-full text-center text-xs text-gray-500 hover:text-gray-300 transition-colors">
                  {t('onboard.change_email')}
                </button>
              </motion.form>
            )}

            {step === 'password' && emailExists === false && (
              <motion.form key="signup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6" onSubmit={handleSignupSubmit}>
                <p className="text-sm text-gray-400 -mt-2">{t('onboard.new_here')} <span className="text-white font-semibold">{email}</span></p>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300">{t('forms.name')}</label>
                  <div className="mt-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="name" type="text" required autoFocus
                      value={name} onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-[#2a2a2a] rounded-xl bg-[#1a1a1a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent transition-colors sm:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">{t('forms.password')}</label>
                  <div className="mt-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="password" type="password" autoComplete="new-password" required
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-[#2a2a2a] rounded-xl bg-[#1a1a1a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent transition-colors sm:text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">{t('forms.confirm_password')}</label>
                  <div className="mt-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="confirmPassword" type="password" autoComplete="new-password" required
                      value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-[#2a2a2a] rounded-xl bg-[#1a1a1a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent transition-colors sm:text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <button
                  type="submit" disabled={submitting}
                  className="w-full flex justify-center py-3 px-4 rounded-xl shadow-lg text-sm font-bold text-black bg-[#f59e0b] hover:bg-[#d97706] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t('forms.create_account')}
                </button>
                <button type="button" onClick={backToEmail} className="w-full text-center text-xs text-gray-500 hover:text-gray-300 transition-colors">
                  {t('onboard.change_email')}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {showEmailConfirmationModal && (
          <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-[#1a1a1a] border border-[#f59e0b]/30 rounded-2xl p-8 max-w-md w-full text-center shadow-[0_0_50px_-12px_rgba(245,158,11,0.25)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#f59e0b]/20 to-transparent rounded-bl-full pointer-events-none" />
              <div className="flex justify-center mb-6 relative z-10">
                <Logo size="lg" />
              </div>
              <h3 className="text-3xl font-black text-white mb-4 relative z-10">{t('modals.emailConfirmation.title')}</h3>
              <p className="text-gray-300 mb-6 leading-relaxed relative z-10">
                {t('modals.emailConfirmation.message')} <br />
                <span className="text-[#f59e0b] font-bold text-lg mt-2 mb-3 inline-block bg-[#f59e0b]/10 px-4 py-1.5 rounded-lg border border-[#f59e0b]/20">{email}</span>
                <br />
                <span className="block mt-2">{t('onboard.confirm_then_pay')}</span>
              </p>
              <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5 text-sm text-gray-400 text-left flex items-start gap-3 relative z-10 shadow-inner">
                <span className="text-xl">💡</span>
                <p>{t('modals.emailConfirmation.tip')}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
