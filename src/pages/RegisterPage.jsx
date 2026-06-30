
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { signUpWithEmail } from '@/lib/supabaseAuth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { generateClientCode } from '@/lib/clientCodeGenerator';
import Logo from '@/components/uffi/Logo';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [showEmailConfirmationModal, setShowEmailConfirmationModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: t('toast.error'),
        description: t('toast.fill_fields'),
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: t('toast.error'),
        description: t('toast.password_mismatch'),
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: t('toast.error'),
        description: t('toast.password_short'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const clientCode = await generateClientCode();
      const { success, error } = await signUpWithEmail(email, password, clientCode, name);
      
      if (success) {
        setRegisteredEmail(email);
        setShowEmailConfirmationModal(true);
      } else {
        toast({
          title: t('toast.error'),
          description: error?.message || t('toast.register_error'),
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: t('toast.error'),
        description: t('toast.register_error'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
          {t('buttons.back') || 'Back'}
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
            {t('auth.create_account_title') || 'Create Account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {t('auth.join_us') || 'Join our platform today'}
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
          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                {t('forms.name') || 'Name'}
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-[#2a2a2a] rounded-xl bg-[#1a1a1a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent transition-colors sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                {t('forms.email') || 'Email'}
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
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                {t('forms.password') || 'Password'}
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-[#2a2a2a] rounded-xl bg-[#1a1a1a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent transition-colors sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                {t('forms.confirm_password') || 'Confirm Password'}
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-[#2a2a2a] rounded-xl bg-[#1a1a1a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent transition-colors sm:text-sm"
                  placeholder="••••••••"
                />
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
                  t('forms.create_account') || 'Create Account'
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
                  {t('forms.has_account') || 'Already have an account?'}
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link to="/login" className="font-medium text-[#f59e0b] hover:text-[#d97706] transition-colors">
                {t('forms.login_link') || 'Login here'}
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showEmailConfirmationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#1a1a1a] border border-[#f59e0b]/30 rounded-2xl p-8 max-w-md w-full text-center shadow-[0_0_50px_-12px_rgba(245,158,11,0.25)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#f59e0b]/20 to-transparent rounded-bl-full pointer-events-none" />
              
              <div className="flex justify-center mb-6 relative z-10">
                <Logo size="lg" />
              </div>
              
              <h3 className="text-3xl font-black text-white mb-4 relative z-10">{t('modals.emailConfirmation.title')}</h3>
              
              <p className="text-gray-300 mb-6 leading-relaxed relative z-10">
                {t('modals.emailConfirmation.message')} <br />
                <span className="text-[#f59e0b] font-bold text-lg mt-2 mb-3 inline-block bg-[#f59e0b]/10 px-4 py-1.5 rounded-lg border border-[#f59e0b]/20">{registeredEmail}</span>
                <br />
                <span className="block mt-2">{t('modals.emailConfirmation.message_end')}</span>
              </p>
              
              <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5 mb-8 text-sm text-gray-400 text-left flex items-start gap-3 relative z-10 shadow-inner">
                <span className="text-xl">💡</span>
                <p>
                  {t('modals.emailConfirmation.tip')}
                </p>
              </div>

              <button
                onClick={() => navigate('/login')}
                className="w-full py-4 px-4 rounded-xl font-black text-black bg-[#f59e0b] hover:bg-[#d97706] transition-all shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1a1a1a] focus:ring-[#f59e0b] relative z-10"
              >
                {t('modals.emailConfirmation.button')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
