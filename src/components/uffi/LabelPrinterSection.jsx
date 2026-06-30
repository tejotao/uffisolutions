import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Printer, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const LabelPrinterSection = () => {
  const { t } = useLanguage();

  const features = [
    t('printer_section.features.f1'),
    t('printer_section.features.f2'),
    t('printer_section.features.f3'),
    t('printer_section.features.f4'),
  ];

  return (
    <section id="print-hub" className="py-24 px-4 bg-gray-50 dark:bg-black scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative rounded-[2.5rem] overflow-hidden bg-gray-900 dark:bg-[#0a0a0a] shadow-2xl shadow-amber-500/10 border border-gray-800 dark:border-gray-800"
        >
          {/* Decorative Glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-600/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-20 p-8 md:p-16 items-center">
            
            {/* Content Column */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold uppercase tracking-wider border border-amber-500/20">
                <Printer className="w-3 h-3" />
                {t('printer_section.label')}
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {t('printer_section.title')}
              </h2>
              
              <p className="text-lg text-gray-400 leading-relaxed max-w-lg">
                {t('printer_section.subtitle')}
              </p>

              <div className="grid gap-4">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-amber-500" />
                    </div>
                    <span className="text-gray-300 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link to="/print">
                  <Button 
                    size="lg"
                    className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-lg px-8 py-6 rounded-full shadow-lg shadow-amber-500/20 transition-all hover:scale-105 flex items-center gap-2 group"
                  >
                    {t('printer_section.cta')} 
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <p className="mt-4 text-xs text-gray-500">
                  Inspired by the simplicity of hubukbox.com
                </p>
              </div>
            </div>

            {/* Visual Column */}
            <div className="relative">
              <div className="relative z-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 group">
                {/* Mock UI for printer interface */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="text-gray-500 text-xs font-mono">print_job_01.pdf</div>
                </div>
                
                <div className="bg-white rounded-lg p-8 flex items-center justify-center min-h-[300px] shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-gray-100 opacity-50" />
                  
                  {/* Label Mockup */}
                  <div className="relative bg-white w-[200px] h-[300px] shadow-md border border-gray-200 p-4 flex flex-col justify-between transform group-hover:scale-105 transition-transform duration-500">
                     <div className="space-y-4">
                        <div className="h-20 bg-black w-full" /> {/* Barcode placeholder */}
                        <div className="space-y-2">
                          <div className="h-2 bg-gray-200 w-3/4" />
                          <div className="h-2 bg-gray-200 w-1/2" />
                          <div className="h-2 bg-gray-200 w-full" />
                        </div>
                     </div>
                     <div className="h-16 border-2 border-black w-16 self-end flex items-center justify-center font-bold text-2xl">
                       QR
                     </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-center">
                   <div className="text-gray-400 text-sm">Status: <span className="text-green-400">Ready to print</span></div>
                   <div className="bg-blue-600 px-4 py-2 rounded-lg text-white text-xs font-bold">PRINT</div>
                </div>
              </div>

              {/* Decorative elements behind */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LabelPrinterSection;