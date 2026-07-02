import React, { useState } from 'react';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';
import { useI18n } from '@/contexts/I18nContext';
import { Mail, MessageCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function ContactPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Mensagem enviada com sucesso!",
        description: "Agradecemos o seu contato. Retornaremos em breve!",
      });
      e.target.reset();
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white font-sans">
      <Header />
      
      <main className="flex-grow pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            {t('footer.links.contact') || 'Entre em Contato'}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Tem alguma dúvida ou precisa de suporte? Nossa equipe está pronta para ajudar você a evoluir.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Contact Info */}
          <div className="space-y-8">
            <div className="bg-[#141414] border border-[#2a2a2a] p-8 rounded-2xl h-full flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-white mb-8">Informações de Contato</h3>
              
              <div className="space-y-8">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center text-[#f59e0b] shrink-0 border border-[#f59e0b]/20">
                    <Mail size={28} />
                  </div>
                  <div>
                    <h4 className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wider">E-mail de Suporte</h4>
                    <a href="mailto:us@uffisolutions.com" className="text-white font-bold text-lg hover:text-[#f59e0b] transition-colors block">
                      us@uffisolutions.com
                    </a>
                    <p className="text-gray-500 text-sm mt-1">Geralmente respondemos em até 24 horas.</p>
                  </div>
                </div>

                <div className="w-full h-px bg-[#1c1c1c]"></div>

                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366] shrink-0 border border-[#25D366]/20">
                    <MessageCircle size={28} />
                  </div>
                  <div>
                    <h4 className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wider">WhatsApp</h4>
                    <a href="https://api.whatsapp.com/send/?phone=447714171978" target="_blank" rel="noopener noreferrer" className="text-white font-bold text-lg hover:text-[#25D366] transition-colors block">
                      +44 7714 171978
                    </a>
                    <p className="text-gray-500 text-sm mt-1">Disponível para contato direto e rápido.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-8 rounded-2xl shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6">Envie uma Mensagem</h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Nome</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] transition-all"
                  placeholder="Seu nome completo"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">E-mail</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] transition-all"
                  placeholder="seu@email.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Mensagem</label>
                <textarea 
                  required
                  rows="5"
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] transition-all resize-none"
                  placeholder="Como podemos ajudar você hoje?"
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-black font-black py-4 rounded-xl transition-all disabled:opacity-70 mt-4 shadow-[0_4px_14px_rgba(245,158,11,0.2)]"
              >
                {loading ? 'Enviando...' : 'Enviar Mensagem'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}