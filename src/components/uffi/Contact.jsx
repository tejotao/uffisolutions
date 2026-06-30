import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const Contact = () => {
  const { t } = useLanguage();

  return (
    <section id="contact" className="py-24 px-4 bg-gradient-to-b from-black to-[#0f0f0f] relative overflow-hidden">
      {/* Gold Sphere Background Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d4af37] rounded-full blur-[150px] opacity-5 pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-[#d4af37] font-bold tracking-widest uppercase text-sm mb-4 block">{t('fees.title')}</span>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">{t('contact.title')}</h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">{t('fees.subtitle')}</p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button 
              size="lg" 
              className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-8 py-8 text-lg font-bold rounded-xl shadow-lg flex items-center gap-3 w-full sm:w-auto"
              onClick={() => window.open('https://wa.me/447714171978', '_blank')}
            >
              <MessageCircle className="w-6 h-6" />
              {t('contact.whatsapp')}
            </Button>
            
            <Button 
              size="lg" 
              className="bg-white text-black hover:bg-gray-200 px-8 py-8 text-lg font-bold rounded-xl shadow-lg flex items-center gap-3 w-full sm:w-auto"
              onClick={() => window.location.href = 'mailto:uffisolutions@gmail.com'}
            >
              <Mail className="w-6 h-6" />
              {t('contact.email')}
            </Button>
          </div>

          <div className="mt-16 p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
            <h3 className="text-2xl font-bold text-white mb-4">{t('about.title')}</h3>
            <p className="text-gray-400 leading-relaxed max-w-2xl mx-auto">
              {t('about.desc')}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;