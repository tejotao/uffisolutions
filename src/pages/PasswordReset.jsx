import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { InputDark } from '@/components/ui/input-dark';
import { toast } from '@/components/ui/use-toast';
import CloseButton from '@/components/CloseButton';

export default function PasswordReset() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast({ title: t('auth.emailRequired') || 'Email obrigatório', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast({
        title: t('auth.resetEmailSent') || 'Email enviado!',
        description: t('auth.checkInbox') || 'Verifica a tua caixa de entrada.',
      });
    } catch (error) {
      toast({
        title: t('auth.error') || 'Erro',
        description: error.message || 'Não foi possível enviar o email.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#141414] border border-[#2a2a2a] rounded-2xl shadow-2xl p-8 relative"
      >
        <CloseButton onClick={() => navigate('/login')} className="absolute top-4 right-4" />
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {t('auth.resetPassword') || 'Recuperar Password'}
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            {t('auth.resetInstructions') || 'Insere o teu email e enviamos-te um link para recuperar a password.'}
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="text-5xl mb-4">✉️</div>
            <p className="text-white font-medium">
              {t('auth.checkInbox') || 'Email enviado! Verifica a tua caixa de entrada.'}
            </p>
            <Link to="/login" className="text-[#f59e0b] hover:text-[#d97706] font-bold inline-block mt-4">
              {t('auth.backToLogin') || 'Voltar ao login'}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 font-medium">{t('auth.email') || 'Email'}</Label>
              <InputDark
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold py-6 text-base rounded-xl transition-colors" 
              disabled={loading}
            >
              {loading
                ? (t('auth.sending') || 'A enviar...')
                : (t('auth.sendResetLink') || 'Enviar link de recuperação')}
            </Button>
            <div className="text-center mt-4">
              <Link to="/login" className="text-sm text-[#f59e0b] hover:text-[#d97706] font-bold transition-colors">
                {t('auth.backToLogin') || 'Voltar ao login'}
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}