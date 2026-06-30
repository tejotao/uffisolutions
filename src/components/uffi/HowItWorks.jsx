import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, ShoppingCart, PackageCheck, Send } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const HowItWorks = () => {
  const { t, getTranslationObject } = useLanguage();
  
  const steps = [
    { icon: UserPlus, ...getTranslationObject('how.step1') },
    { icon: ShoppingCart, ...getTranslationObject('how.step2') },
    { icon: PackageCheck, ...getTranslationObject('how.step3') },
    { icon: Send, ...getTranslationObject('how.step4') }
  ];

  return (
    <section id="how-it-works" className="py-24 px-4 bg-black relative border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
           <span className="text-[#d4af37] font-bold tracking-widest uppercase text-sm mb-2 block">Process</span>
           <h2 className="text-4xl md:text-5xl font-bold text-white">{t('how.title')}</h2>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-[#d4af37]/0 via-[#d4af37]/30 to-[#d4af37]/0" />

          <div className="grid md:grid-cols-4 gap-12 relative z-10">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-24 h-24 bg-[#0f0f0f] border-2 border-[#d4af37]/20 rounded-full flex items-center justify-center mb-8 group-hover:border-[#d4af37] group-hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all duration-500">
                   <step.icon className="w-10 h-10 text-white group-hover:text-[#d4af37] transition-colors" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                
                <div className="mt-6 text-[#d4af37] font-mono text-xs opacity-50">0{idx + 1}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;