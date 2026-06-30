import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const Process = () => {
  const { t, getTranslationObject } = useLanguage();
  const steps = getTranslationObject('process.steps') || [];

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-black to-gray-950">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">
            {t('process.title_prefix')} <span className="text-blue-500">{t('process.title_highlight')}</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            {t('process.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          <div className="hidden md:block absolute top-24 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-blue-500/0" />

          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.2, duration: 0.5 }}
              className="relative group"
            >
              <div className="w-12 h-12 rounded-full bg-black border-2 border-gray-800 group-hover:border-blue-500 transition-colors flex items-center justify-center text-gray-500 group-hover:text-blue-500 font-bold mx-auto md:mx-0 mb-6 relative z-10">
                {idx + 1}
              </div>
              
              <div className="text-7xl font-black text-gray-800/30 absolute -top-4 left-4 md:left-0 -z-10 select-none group-hover:text-blue-500/10 transition-colors">
                0{idx + 1}
              </div>
              
              <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors">{step.title}</h3>
              <p className="text-gray-400 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;