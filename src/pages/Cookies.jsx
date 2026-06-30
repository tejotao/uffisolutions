import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Cookies = () => {
  const { t, getTranslationObject } = useLanguage();
  const content = getTranslationObject('legal.cookies_content') || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Helmet>
        <title>{t('legal.cookies_title')} - UffiSolutions</title>
      </Helmet>
      <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white flex flex-col transition-colors duration-300">
        <Header />
        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-grow pt-32 px-4 max-w-4xl mx-auto pb-20 w-full"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:hidden">
            <Link to="/">
                <Button variant="ghost" className="text-gray-500 dark:text-gray-400 hover:text-[#d4af37] dark:hover:text-[#d4af37] pl-0 transition-all hover:-translate-x-1">
                <ArrowLeft className="mr-2 w-4 h-4" /> {t('legal.back_home')}
                </Button>
            </Link>
            <Button onClick={handlePrint} variant="outline" className="border-gray-200 dark:border-gray-800">
                <Printer className="mr-2 w-4 h-4" /> {t('legal.print_btn')}
            </Button>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-gray-900 dark:text-white">{t('legal.cookies_title')}</h1>
          <p className="text-gray-500 mb-12 font-medium border-b border-gray-200 dark:border-gray-800 pb-8">{t('legal.last_updated')}</p>

          <div className="space-y-10 text-gray-600 dark:text-gray-300 leading-relaxed font-serif md:font-sans text-lg">
             {content.map((section, idx) => (
              <section key={idx}>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-[#d4af37] mb-4">{section.title}</h2>
                <p className="leading-8 text-justify">{section.text}</p>
              </section>
            ))}
          </div>
        </motion.main>
        <Footer />
      </div>
    </>
  );
};

export default Cookies;