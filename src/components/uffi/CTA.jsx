import React from 'react';
import { motion } from 'framer-motion';
import { Zap, MessageCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const CTA = () => {
  const { t } = useLanguage();
  return (
    <section className="py-24 px-4 bg-gradient-to-br from-blue-600 to-cyan-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-20" />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
            <Zap className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">
            {t('cta.title')}
          </h2>
          <p className="text-xl mb-10 text-blue-50">
            {t('cta.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-blue-50 hover:scale-105 transition-all duration-300 px-8 py-7 text-lg font-bold shadow-xl rounded-full"
              onClick={() => window.open('https://wa.me/447714171978', '_blank')}
            >
              <MessageCircle className="mr-2 w-6 h-6" />
              {t('cta.whatsapp')}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white/30 bg-transparent text-white hover:bg-white/10 px-8 py-7 text-lg font-bold rounded-full backdrop-blur-sm"
              onClick={() => window.location.href = 'mailto:uffisolutions@gmail.com'}
            >
              <Mail className="mr-2 w-6 h-6" />
              {t('cta.email')}
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;