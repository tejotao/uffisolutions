import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const Pricing = () => {
  const { t, getTranslationObject } = useLanguage();
  const plans = getTranslationObject('pricing.plans') || [];

  return (
    <section id="pricing" className="py-24 px-4 bg-gray-50 dark:bg-gray-950/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-gray-900 dark:text-white">
            {t('pricing.title_prefix')} <span className="text-blue-600">{t('pricing.title_highlight')}</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('pricing.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`relative rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 ${
                plan.popular 
                  ? 'bg-white dark:bg-gray-900 border-2 border-blue-600 shadow-2xl shadow-blue-600/20 z-10 scale-105' 
                  : 'bg-white dark:bg-black border border-gray-200 dark:border-gray-800 hover:border-blue-500/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 h-10">{plan.desc}</p>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-black text-gray-900 dark:text-white">{plan.price}</span>
                {plan.price !== 'Custom' && <span className="text-gray-500">/project</span>}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                    <div className="mt-1 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-blue-600" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className={`w-full py-6 text-lg font-bold shadow-lg transition-all ${
                  plan.popular 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25' 
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                }`}
                onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;