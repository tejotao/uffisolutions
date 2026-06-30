import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const clients = [
  'TechCorp', 'InnovateLab', 'DigitalWave', 'CloudSync', 'DataFlow', 'NexGen'
];

const Clients = () => {
  const { t } = useLanguage();
  return (
    <section className="py-16 px-4 bg-black border-y border-gray-800">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-gray-500 mb-10 text-sm font-semibold uppercase tracking-[0.2em]">{t('clients.title')}</p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
          {clients.map((client, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="text-2xl md:text-3xl font-black text-gray-800 hover:text-gray-600 hover:scale-105 transition-all duration-300 cursor-default select-none"
            >
              {client}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Clients;