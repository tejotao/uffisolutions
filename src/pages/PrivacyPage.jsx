import React from 'react';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';
import { useI18n } from '@/contexts/I18nContext';

export default function PrivacyPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white font-sans">
      <Header />
      
      <main className="flex-grow pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
          {t('footer.links.privacy') || 'Política de Privacidade'}
        </h1>
        <p className="text-gray-400 mb-10">Última atualização: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-[#f59e0b] mb-4">1. Coleta de Dados</h2>
            <p>Coletamos informações essenciais que você nos fornece diretamente, como nome, endereço de e-mail e número de telefone ao criar uma conta. Também podemos coletar dados de navegação para aprimorar sua experiência de uso na UffiSolutions.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#f59e0b] mb-4">2. Uso de Dados</h2>
            <p>Utilizamos suas informações para fornecer e melhorar nossos serviços, processar transações com segurança, enviar comunicações técnicas, fornecer suporte ao cliente de qualidade e recomendar conteúdos relevantes ao seu perfil.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#f59e0b] mb-4">3. Proteção de Dados</h2>
            <p>A UffiSolutions implementa as melhores medidas de segurança técnicas e organizacionais para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição. Seus dados estão seguros conosco.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#f59e0b] mb-4">4. Cookies</h2>
            <p>Utilizamos cookies e tecnologias semelhantes para garantir o funcionamento correto da plataforma, manter sua sessão ativa e analisar o tráfego de maneira anônima, permitindo-nos otimizar o conteúdo que oferecemos.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#f59e0b] mb-4">5. Contato</h2>
            <p>Se você tiver qualquer dúvida ou solicitação relacionada aos seus dados pessoais e nossa Política de Privacidade, não hesite em entrar em contato com nossa equipe de suporte. Estamos à disposição para ajudar.</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}