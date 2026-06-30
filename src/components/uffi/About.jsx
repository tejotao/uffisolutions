import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Target, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const icons = [Sparkles, Target, Users];

const About = () => {
  const { t, getTranslationObject } = useLanguage();
  const cards = getTranslationObject('about.cards') || [];

  return (
    <section id="about" className="py-24 px-4 bg-gradient-to-b from-black to-gray-950">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">
            {t('about.title_prefix')} <span className="text-blue-500">{t('about.title_highlight')}</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            {t('about.description')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((item, idx) => {
            const Icon = icons[idx % icons.length];
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.2, duration: 0.5 }}
                className="group bg-gray-900/50 border border-gray-800 rounded-3xl p-10 hover:border-blue-500/50 hover:bg-gray-900 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10"
              >
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                  <Icon className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-blue-400 transition-colors">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default About;