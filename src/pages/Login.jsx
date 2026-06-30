import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Loader2, Info } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; // Make sure this path matches your client export

export default function Login() {
  const { t } = useI18n();
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { message, redirectTo } = location.state || {};

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        await signIn(email, password);
        toast({
          title: "Sucesso",
          description: "Login realizado com sucesso!"
        });
        navigate(redirectTo || '/dashboard');
      } else {
        // Sign Up Flow
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, whatsapp }
          }
        });

        if (error) throw error;
        
        // Manual profile creation fallback just in case trigger fails
        if (data?.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: email,
            full_name: fullName,
            whatsapp: whatsapp,
            created_at: new Date().toISOString()
          });
        }
        
        toast({
          title: "Conta criada!",
          description: "Sua conta foi criada com sucesso."
        });
        
        // If require email confirmation, you might want to redirect to a 'verify email' page instead.
        // For immediate login bypass (assuming auto-confirm or session established):
        if (data.session) {
          navigate(redirectTo || '/dashboard');
        } else {
          toast({
            title: "Verifique seu e-mail",
            description: "Enviamos um link de confirmação para o seu e-mail."
          });
          setIsLogin(true); // Switch back to login if session isn't automatically started
        }
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro inesperado. Tente novamente.",
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
        className="w-full max-w-md bg-[#141414] border border-[#2a2a2a] p-8 md:p-10 rounded-3xl shadow-2xl relative mt-10 mb-10"
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
          <h2 className="text-gray-400 text-sm leading-relaxed mb-4">
            {isLogin 
              ? 'Acesse sua conta para continuar.'
              : 'Preencha os dados abaixo para criar sua conta.'}
          </h2>
        </div>

        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b] p-4 rounded-xl mb-6 text-sm flex items-start gap-3"
            >
              <Info size={18} className="mt-0.5 shrink-0" />
              <p>{message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <>
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-semibold text-gray-300">Nome Completo</label>
                <input 
                  id="fullName" 
                  type="text" 
                  required={!isLogin}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] transition-all"
                  placeholder="Seu nome"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="whatsapp" className="text-sm font-semibold text-gray-300">WhatsApp</label>
                <input 
                  id="whatsapp" 
                  type="tel" 
                  required={!isLogin}
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] transition-all"
                  placeholder="+44 7000 000000"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-gray-300">{t('auth.email') || 'E-mail'}</label>
            <input 
              id="email" 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] transition-all"
              placeholder="seu@email.com"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-sm font-semibold text-gray-300">{t('auth.password') || 'Senha'}</label>
              {isLogin && (
                <Link to="/password-reset" className="text-xs text-[#f59e0b] hover:text-[#d97706] font-bold transition-colors">
                  {t('auth.forgotPassword') || 'Esqueceu a senha?'}
                </Link>
              )}
            </div>
            <input 
              id="password" 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold py-3.5 text-base rounded-xl transition-colors mt-4 disabled:opacity-70 shadow-[0_4px_14px_rgba(245,158,11,0.2)] flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin w-5 h-5" />}
            {loading 
              ? (isLogin ? 'Entrando...' : 'Cadastrando...') 
              : (isLogin ? (t('auth.loginBtn') || 'Entrar na Conta') : 'Criar Minha Conta')}
          </button>
        </form>

        <div className="mt-8 text-center text-gray-400 text-sm">
          {isLogin ? (
            <>
              {t('auth.needAccount') || 'Ainda não tem conta?'} <button onClick={() => setIsLogin(false)} className="text-[#f59e0b] hover:text-[#d97706] font-bold transition-colors">Cadastre-se</button>
            </>
          ) : (
            <>
              Já possui uma conta? <button onClick={() => setIsLogin(true)} className="text-[#f59e0b] hover:text-[#d97706] font-bold transition-colors">Faça login</button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}