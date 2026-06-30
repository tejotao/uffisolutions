import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, ShoppingBag, Box, Warehouse, ArrowRight, X, MessageCircle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

const Services = () => {
  const { t, getTranslationObject } = useLanguage();
  const [activeModal, setActiveModal] = useState(null);
  
  const services = [
    { id: 'redirection', icon: Plane, ...getTranslationObject('services.redirection') },
    { id: 'shopper', icon: ShoppingBag, ...getTranslationObject('services.shopper') },
    { id: 'fba', icon: Box, ...getTranslationObject('services.fba') },
    { id: 'storage', icon: Warehouse, ...getTranslationObject('services.storage') }
  ];

  const handleOpenModal = (service) => {
    setActiveModal(service);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    document.body.style.overflow = 'unset';
  };

  return (
    <section id="services" className="py-24 px-4 bg-[#0f0f0f] relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[#d4af37] font-bold tracking-widest uppercase text-sm mb-2 block">What We Do</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('services.title')}</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">{t('services.subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-[#151515] border border-white/5 p-8 rounded-2xl hover:border-[#d4af37]/30 hover:bg-[#1a1a1a] transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <service.icon className="w-32 h-32 text-white" />
              </div>
              
              <div className="relative z-10">
                <div className="w-14 h-14 bg-[#d4af37]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#d4af37] transition-colors duration-300">
                  <service.icon className="w-7 h-7 text-[#d4af37] group-hover:text-black transition-colors duration-300" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3">{service.title}</h3>
                <p className="text-gray-400 leading-relaxed mb-6">{service.desc}</p>
                
                <button 
                  onClick={() => handleOpenModal(service)}
                  className="flex items-center text-[#d4af37] font-bold text-sm uppercase tracking-wider hover:text-white transition-colors"
                >
                  Learn More <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Service Detail Modal */}
      <AnimatePresence>
        {activeModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] p-4 flex items-center justify-center"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 m-auto w-full max-w-2xl h-fit max-h-[90vh] overflow-y-auto bg-[#1a1a1a] border border-[#d4af37]/20 rounded-3xl z-[70] shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-6 md:p-8 border-b border-white/10 flex justify-between items-start sticky top-0 bg-[#1a1a1a] z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#d4af37]/10 rounded-xl flex items-center justify-center">
                     <activeModal.icon className="w-6 h-6 text-[#d4af37]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{activeModal.title}</h3>
                </div>
                <button 
                  onClick={handleCloseModal}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8 space-y-8 overflow-y-auto">
                 <div>
                    <p className="text-gray-300 text-lg leading-relaxed">
                       {activeModal.details}
                    </p>
                 </div>

                 <div className="bg-black/30 rounded-2xl p-6 border border-white/5">
                    <h4 className="text-[#d4af37] font-bold uppercase tracking-wider text-sm mb-4">
                       {t('modals.benefits_title')}
                    </h4>
                    <ul className="space-y-3">
                       {activeModal.benefits && activeModal.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-3 text-gray-300">
                             <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                             <span>{benefit}</span>
                          </li>
                       ))}
                    </ul>
                 </div>
              </div>

              {/* Footer / CTA */}
              <div className="p-6 md:p-8 border-t border-white/10 bg-[#151515] mt-auto sticky bottom-0">
                 <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                       className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold h-12 text-lg rounded-xl flex items-center justify-center gap-2"
                       onClick={() => window.open('https://wa.me/447714171978', '_blank')}
                    >
                       <MessageCircle className="w-5 h-5" />
                       {t('modals.whatsapp_btn')}
                    </Button>
                    <Button 
                       variant="outline"
                       className="flex-1 border-white/10 hover:bg-white/5 text-white font-medium h-12 rounded-xl"
                       onClick={handleCloseModal}
                    >
                       {t('modals.close')}
                    </Button>
                 </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Services;