import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className={`text-lg font-bold transition-colors ${isOpen ? 'text-blue-600' : 'text-gray-900 dark:text-white group-hover:text-blue-600'}`}>
          {question}
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 group-hover:bg-blue-100 dark:group-hover:bg-gray-700'}`}>
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-600 dark:text-gray-400 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  const { t, getTranslationObject } = useLanguage();
  const items = getTranslationObject('faq.items') || [];

  return (
    <section className="py-24 px-4 bg-white dark:bg-black">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-2 block">Support</span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">
            {t('faq.title')}
          </h2>
        </div>
        
        <div className="space-y-2">
          {items.map((item, idx) => (
            <FAQItem key={idx} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;