import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Store, Building2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const TargetAudience = () => {
  const { t, getTranslationObject } = useLanguage();
  
  const audience = [
    { id: 'brazil', icon: Globe, ...getTranslationObject('audience.brazil') },
    { id: 'sellers', icon: Store, ...getTranslationObject('audience.sellers') },
    { id: 'companies', icon: Building2, ...getTranslationObject('audience.companies') }
  ];

  return (
    <section id="audience" className="py-24 px-4 bg-[#0f0f0f]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">{t('audience.title')}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {audience.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-[#151515] p-8 rounded-2xl border border-white/5 hover:border-[#d4af37]/50 transition-all text-center group"
            >
              <item.icon className="w-12 h-12 text-[#d4af37] mx-auto mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
              <p className="text-gray-400">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TargetAudience;