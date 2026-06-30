import React from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/contexts/I18nContext';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';

export default function TermsOfService() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col">
      <Header />
      
      <main className="flex-grow pt-32 pb-16 sm:pb-24 lg:pb-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#141414] to-[#0a0a0a]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto bg-[#0f0f0f] border border-[#2a2a2a] p-8 sm:p-12 lg:p-16 rounded-3xl shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent opacity-50"></div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-8 tracking-tight text-white">
            {t('legal.terms.title') || 'Termos de Serviço'}
          </h1>
          
          <div className="prose prose-invert max-w-none text-gray-300 text-base sm:text-lg leading-relaxed space-y-6">
            <p>
              {t('legal.terms.content') || 'Bem-vindo à UffiSolutions. Ao acessar nossos serviços, você concorda com nossos termos.'}
            </p>
            {/* Adding some placeholder structure to make it look professional */}
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-8 mb-4">1. Aceitação dos Termos</h3>
            <p>
              Ao aceder e utilizar a plataforma UffiSolutions, concorda expressamente com as condições e termos aqui apresentados. Caso não concorde com algum destes termos, está proibido de utilizar ou aceder a este site.
            </p>
            
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-8 mb-4">2. Licença de Uso</h3>
            <p>
              É concedida permissão para o download temporário de uma cópia dos materiais (informações ou software) no site UffiSolutions, apenas para visualização transitória pessoal e não comercial.
            </p>
            
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-8 mb-4">3. Isenção de Responsabilidade</h3>
            <p>
              Os materiais no site da UffiSolutions são fornecidos "como estão". A UffiSolutions não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias.
            </p>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}