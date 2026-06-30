import React from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/contexts/I18nContext';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';

export default function CookiePolicy() {
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
            {t('legal.cookies.title') || 'Política de Cookies'}
          </h1>
          
          <div className="prose prose-invert max-w-none text-gray-300 text-base sm:text-lg leading-relaxed space-y-6">
            <p>
              {t('legal.cookies.content') || 'Utilizamos cookies para melhorar a sua experiência em nossa plataforma.'}
            </p>
            
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-8 mb-4">O que são Cookies?</h3>
            <p>
              Como é prática comum em quase todos os sites profissionais, este site usa cookies, que são pequenos arquivos baixados no seu computador, para melhorar sua experiência. Esta página descreve quais informações eles coletam e por que às vezes precisamos armazená-los.
            </p>
            
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-8 mb-4">Como Usamos os Cookies</h3>
            <p>
              Utilizamos cookies por vários motivos, detalhados abaixo. Infelizmente, na maioria dos casos, não existem opções padrão do setor para desativar os cookies sem desativar completamente a funcionalidade e os recursos que eles adicionam a este site.
            </p>
            
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-8 mb-4">Cookies Essenciais</h3>
            <p>
              Alguns cookies são essenciais para que você possa experimentar a funcionalidade completa do nosso site. Eles nos permitem manter as sessões do usuário e evitar ameaças à segurança. Eles não coletam ou armazenam nenhuma informação pessoal.
            </p>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}