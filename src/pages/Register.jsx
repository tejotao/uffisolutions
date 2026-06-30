import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';

export default function Register() {
  const { t, lang } = useI18n();
  const { signUp } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Generate random secure password if empty, as Supabase requires one
    const finalPassword = formData.password || Math.random().toString(36).slice(-10) + "A1!";
    
    if (finalPassword.length < 6) {
      toast({
        title: "Erro",
        description: t('auth.passwordLength') || 'A senha deve ter pelo menos 6 caracteres.',
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      await signUp(formData.email, finalPassword, formData.name, lang);
      toast({
        title: t('auth.signUpSuccess') || 'Conta criada com sucesso!',
        description: t('auth.redirecting') || 'Redirecionando...',
      });
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      toast({
        title: "Erro no Cadastro",
        description: error.message || "Não foi possível criar a conta.",
        variant: "destructive"
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
        className="w-full max-w-md bg-[#141414] border border-[#2a2a2a] p-8 md:p-10 rounded-3xl shadow-2xl relative my-8"
      >
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="text-center mb-8 pt-4">
          <Link to="/" className="inline-block text-3xl font-black text-white mb-2 tracking-tight">
            Uffi<span className="text-[#f59e0b]">Solutions</span>
          </Link>
          <h2 className="text-gray-400 text-sm">{t('auth.createAccount') || 'Crie sua conta gratuita'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-semibold text-gray-300">{t('auth.fullName') || 'Nome Completo'} *</label>
            <input 
              id="name" 
              required 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] transition-all"
              placeholder="Seu nome"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-gray-300">{t('auth.email') || 'E-mail'} *</label>
            <input 
              id="email" 
              type="email" 
              required 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] transition-all"
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="whatsapp" className="text-sm font-semibold text-gray-300">{t('auth.whatsapp') || 'WhatsApp'} *</label>
            <input 
              id="whatsapp" 
              type="tel" 
              required 
              value={formData.whatsapp}
              onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] transition-all"
              placeholder="+44 7700 000000"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-semibold text-gray-300">{t('auth.password') || 'Senha'} <span className="text-gray-500 font-normal">(Opcional)</span></label>
            <input 
              id="password" 
              type="password" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] transition-all"
              placeholder="••••••••"
            />
            <p className="text-xs text-gray-500">Se deixado em branco, uma senha segura será gerada automaticamente.</p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold py-4 text-base rounded-xl transition-colors mt-4 disabled:opacity-70 shadow-[0_4px_14px_rgba(245,158,11,0.2)]"
          >
            {loading ? '...' : (t('auth.createAccountBtn') || 'Cadastrar-se')}
          </button>
        </form>

        <div className="mt-8 text-center text-gray-400 text-sm">
          {t('auth.alreadyHaveAccount') || 'Já possui uma conta?'} <Link to="/login" className="text-[#f59e0b] hover:text-[#d97706] font-bold transition-colors">{t('auth.loginHere') || 'Faça login aqui'}</Link>
        </div>
      </motion.div>
    </div>
  );
}