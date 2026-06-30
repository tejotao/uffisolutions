import React from 'react';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';
import { useI18n } from '@/contexts/I18nContext';

export default function TermsPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white font-sans">
      <Header />
      
      <main className="flex-grow pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
          {t('footer.links.terms') || 'Termos de Serviço'}
        </h1>
        <p className="text-gray-400 mb-10">Última atualização: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-[#f59e0b] mb-4">1. Termos Gerais</h2>
            <p>Ao acessar e utilizar a plataforma UffiSolutions, você concorda em cumprir e estar vinculado a estes Termos de Serviço. Se você não concordar com qualquer parte destes termos, não deverá acessar o serviço.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#f59e0b] mb-4">2. Uso da Plataforma</h2>
            <p>A UffiSolutions fornece cursos online, ferramentas e infoprodutos focados no seu desenvolvimento. O acesso ao conteúdo é pessoal e intransferível. É estritamente proibido compartilhar credenciais de acesso ou distribuir os materiais exclusivos protegidos por direitos autorais.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#f59e0b] mb-4">3. Conteúdo</h2>
            <p>Todo o conteúdo, logotipos, vídeos, textos e materiais disponibilizados na plataforma são de propriedade exclusiva da UffiSolutions e são protegidos pelas leis de direitos autorais nacionais e internacionais.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#f59e0b] mb-4">4. Limitação de Responsabilidade</h2>
            <p>O conhecimento e as estratégias ensinados em nossos infoprodutos exigem aplicação prática por parte do aluno. A UffiSolutions não garante resultados financeiros exatos, mas fornece as melhores ferramentas e suporte para auxiliar no seu aprendizado.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#f59e0b] mb-4">5. Modificações dos Termos</h2>
            <p>A UffiSolutions reserva-se o direito de atualizar ou modificar estes Termos de Serviço a qualquer momento. Quaisquer alterações entrarão em vigor imediatamente após a publicação na plataforma, sendo recomendada a revisão periódica por parte dos usuários.</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}