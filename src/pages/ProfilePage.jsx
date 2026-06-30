import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';

export default function ProfilePage() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    birth_date: '',
    bio: '',
    avatar_url: ''
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (data) {
        setFormData({
          name: data.name || '',
          whatsapp: data.whatsapp || '',
          birth_date: data.birth_date || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || ''
        });
      } else {
        setFormData({
          name: '',
          whatsapp: '',
          birth_date: '',
          bio: '',
          avatar_url: ''
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro ao carregar o perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Email validation
      if (!user?.email) {
        throw new Error('Email do usuário não encontrado. Faça login novamente.');
      }

      // 2. Name validation
      if (!formData.name || !formData.name.trim()) {
        throw new Error('O campo Nome é obrigatório.');
      }

      // 3 & 4. Data conversion and Payload structure
      const payload = {
        user_id: user.id,
        email: user.email,
        name: formData.name.trim(),
        whatsapp: formData.whatsapp?.trim() || null,
        bio: formData.bio?.trim() || null,
        avatar_url: formData.avatar_url?.trim() || null,
        birth_date: formData.birth_date || null,
        updated_at: new Date().toISOString()
      };

      // 5. Profile check
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingProfile) {
        // 6. UPDATE logic
        const { error: updateError } = await supabase
          .from('profiles')
          .update(payload)
          .eq('user_id', user.id);
          
        if (updateError) throw updateError;
      } else {
        // 7. INSERT logic
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([payload]);
          
        if (insertError) throw insertError;
      }

      // 9. Success feedback
      setSuccess('Perfil salvo com sucesso!');
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

    } catch (err) {
      // 8. Error handling
      setError(err.message || 'Erro ao salvar as informações.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans">
      <Header />

      <main className="flex-grow pt-32 pb-20 px-4 sm:px-6 lg:px-8 w-full">
        {/* 15. Layout: centered max-w-2xl container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2">Meu Perfil</h1>
            <p className="text-gray-400">Atualize suas informações pessoais e de contato.</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl mb-6 flex items-start gap-3"
              >
                <span className="text-lg">❌</span>
                <p className="mt-0.5">{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-green-500/10 border border-green-500/30 text-green-500 p-4 rounded-xl mb-6 flex items-start gap-3"
              >
                <span className="text-lg">✅</span>
                <p className="mt-0.5">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6 md:p-8 shadow-xl">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#f59e0b]"></div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                
                {/* Email (Disabled) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">E-mail</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white opacity-60 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500">O e-mail não pode ser alterado por aqui.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Nome <span className="text-[#f59e0b]">*</span></label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f59e0b] transition-colors"
                      placeholder="Seu nome completo"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">WhatsApp</label>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f59e0b] transition-colors"
                      placeholder="+55 11 99999-9999"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Birth Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Data de Nascimento</label>
                    <input
                      type="date"
                      name="birth_date"
                      value={formData.birth_date}
                      onChange={handleChange}
                      className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f59e0b] transition-colors"
                    />
                  </div>

                  {/* Avatar URL */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">URL do Avatar</label>
                    <input
                      type="url"
                      name="avatar_url"
                      value={formData.avatar_url}
                      onChange={handleChange}
                      className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f59e0b] transition-colors"
                      placeholder="https://exemplo.com/foto.jpg"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Biografia</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f59e0b] transition-colors resize-none"
                    placeholder="Fale um pouco sobre você..."
                  />
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-4 border-t border-[#2a2a2a]">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold py-3.5 px-6 rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {saving ? 'Salvando...' : '💾 Salvar Perfil'}
                  </button>
                  <button
                    type="button"
                    onClick={loadProfile}
                    disabled={saving}
                    className="flex-1 bg-[#2a2a2a] hover:bg-[#333] text-white font-bold py-3.5 px-6 rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    🔄 Descartar Alterações
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}