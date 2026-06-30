import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';
import { Lock, ArrowLeft } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function ChangePasswordPage() {
  const { user, updatePassword, loading: authLoading } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(formData.newPassword);
      toast({
        title: "Senha atualizada!",
        description: "Sua senha foi alterada com sucesso.",
      });
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err) {
      setError(err.message || "Erro ao atualizar senha.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return <div className="min-h-screen bg-[#0a0a0a]" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white font-sans">
      <Header />
      
      <main className="flex-grow pt-32 pb-20 px-4 sm:px-6 flex items-center justify-center">
        <div className="w-full max-w-md bg-[#141414] border border-[#2a2a2a] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#f59e0b] to-[#d97706]" />
          
          <button 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm font-medium"
          >
            <ArrowLeft size={16} /> Voltar para o perfil
          </button>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-[#f59e0b]/10 rounded-xl flex items-center justify-center text-[#f59e0b]">
              <Lock size={24} />
            </div>
            <h1 className="text-2xl font-black text-white">{t('profile.changePwd') || 'Alterar Senha'}</h1>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-medium mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Senha Atual</label>
              <input
                type="password"
                name="currentPassword"
                required
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] transition-all"
                placeholder="••••••••"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Nova Senha</label>
              <input
                type="password"
                name="newPassword"
                required
                value={formData.newPassword}
                onChange={handleInputChange}
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] transition-all"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Confirmar Nova Senha</label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="flex-1 bg-[#2a2a2a] hover:bg-[#333] text-white px-4 py-3.5 rounded-xl font-bold transition-colors"
              >
                {t('profile.cancel') || 'Cancelar'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#f59e0b] hover:bg-[#d97706] text-black px-4 py-3.5 rounded-xl font-bold transition-colors disabled:opacity-70 shadow-[0_4px_14px_rgba(245,158,11,0.2)]"
              >
                {loading ? 'Salvando...' : 'Salvar Senha'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}