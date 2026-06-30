import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/use-toast';

function ForgotPassword() {
  const { resetPassword, loading } = useAuth();
  const { t, changeLanguage, language } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Handle cooldown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cooldown > 0) {
      toast({
        variant: "destructive",
        title: "Please wait",
        description: `You can try again in ${cooldown} seconds.`
      });
      return;
    }

    try {
      await resetPassword(email);
      // Start 60s cooldown on success to prevent spam
      setCooldown(60);
      toast({
        title: "Email Sent",
        description: "Check your inbox for the password reset link.",
      });
    } catch (error) {
      // If rate limited, extract time or set default
      if (error.message?.includes("security purposes")) {
         setCooldown(60);
         toast({
            variant: "destructive",
            title: "Too Many Requests",
            description: "Please wait a moment before trying again."
         });
      } else {
         toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Failed to send reset email."
         });
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('login.forgot.title')} - UffiSolutions</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden p-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black opacity-50" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />

        <div className="absolute top-8 right-8 flex gap-2 z-20">
          {['en', 'pt', 'es'].map(lang => (
            <button 
              key={lang} 
              onClick={() => changeLanguage(lang)}
              className={`text-xs font-bold uppercase px-2 py-1 rounded ${language === lang ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {lang}
            </button>
          ))}
          <a href="https://uffisolutions.com" className="ml-4 text-gray-500 hover:text-white transition-colors"><X className="w-6 h-6" /></a>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-800 overflow-hidden">
            <div className="p-8">
              <div className="mb-6">
                <Link to="/login" className="text-gray-400 hover:text-white text-sm flex items-center transition-colors">
                  <ArrowLeft className="w-4 h-4 mr-1" /> {t('login.forgot.back')}
                </Link>
              </div>
              
              <h1 className="text-2xl font-bold mb-2 text-white">{t('login.forgot.title')}</h1>
              <p className="text-gray-400 text-sm mb-6">{t('login.forgot.subtitle')}</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">{t('login.fields.email')}</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="you@company.com" 
                      required 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="pl-10 bg-gray-950/50 border-gray-800 text-white focus:border-blue-500 h-11 transition-all" 
                    />
                  </div>
                </div>

                {cooldown > 0 && (
                  <div className="flex items-center gap-2 text-yellow-500 text-sm bg-yellow-500/10 p-3 rounded-md border border-yellow-500/20">
                    <AlertCircle className="w-4 h-4" />
                    <span>Please wait {cooldown}s before trying again.</span>
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={loading || cooldown > 0}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : (
                    <span className="flex items-center gap-2">
                       {cooldown > 0 ? `Wait ${cooldown}s` : t('login.forgot.submit')} 
                       {cooldown === 0 && <Send className="w-4 h-4" />}
                    </span>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default ForgotPassword;