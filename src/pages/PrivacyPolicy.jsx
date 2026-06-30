import React from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/contexts/I18nContext';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';

export default function PrivacyPolicy() {
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
            {t('legal.privacy.title') || 'Política de Privacidade'}
          </h1>
          
          <div className="prose prose-invert max-w-none text-gray-300 text-base sm:text-lg leading-relaxed space-y-6">
            <p>
              {t('legal.privacy.content') || 'A sua privacidade é importante para nós. Respeitamos os seus dados e informações pessoais.'}
            </p>
            
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-8 mb-4">Informações que Coletamos</h3>
            <p>
              O nosso serviço pode solicitar informações pessoais, tais como nome, e-mail e outras informações relevantes apenas quando estritamente necessário para lhe fornecer um serviço, fazendo-o por meios justos e legais, com o seu conhecimento e consentimento.
            </p>
            
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-8 mb-4">Como Utilizamos as Suas Informações</h3>
            <p>
              Apenas retemos as informações recolhidas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis ​​para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.
            </p>
            
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-8 mb-4">Partilha de Dados</h3>
            <p>
              Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei.
            </p>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}