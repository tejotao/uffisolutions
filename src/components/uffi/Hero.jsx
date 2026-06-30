import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Globe2, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const Hero = () => {
  const { t } = useLanguage();

  return (
    <section id="home" className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden pt-20 bg-black">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08),transparent_70%)]" />
      <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Logo Animation */}
          <div className="mb-8 flex justify-center">
             <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center bg-gradient-to-br from-white/5 to-white/0 border border-white/10 shadow-[0_0_40px_rgba(212,175,55,0.15)] backdrop-blur-sm">
                <img 
                   src="https://horizons-cdn.hostinger.com/1db78d05-91f5-4455-8f8f-f031a8b68532/57ad90b43bad7c28578281f506f996bd.png" 
                   alt="Gold Sphere Logo" 
                   className="w-16 h-16 md:w-24 md:h-24 object-contain animate-pulse-slow"
                />
             </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
             <span className="block">{t('hero.title')}</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Button 
              className="w-full sm:w-auto px-10 py-7 text-lg font-bold bg-[#d4af37] hover:bg-[#b5952f] text-black rounded-full shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all hover:scale-105"
              onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
            >
              {t('hero.cta_primary')} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <Link to="/catalog" className="w-full sm:w-auto">
              <Button 
                className="w-full sm:w-auto px-10 py-7 text-lg font-bold bg-[#b8860b] hover:bg-[#9a700a] text-white rounded-full shadow-[0_0_20px_rgba(184,134,11,0.3)] transition-all hover:scale-105"
              >
                🎓 Ver Catálogo
              </Button>
            </Link>
            
            <Button 
              variant="outline"
              className="w-full sm:w-auto px-10 py-7 text-lg font-bold border border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all backdrop-blur-sm"
              onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
            >
              {t('hero.cta_secondary')}
            </Button>
          </div>
          
          <div className="mt-16 flex items-center justify-center gap-8 text-gray-500 text-sm font-medium tracking-widest uppercase">
            <span className="flex items-center gap-2"><Globe2 className="w-4 h-4 text-[#d4af37]" /> Global Shipping</span>
            <span className="w-1 h-1 bg-gray-700 rounded-full" />
            <span>Secure Warehousing</span>
            <span className="w-1 h-1 bg-gray-700 rounded-full" />
            <span>24/7 Support</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;