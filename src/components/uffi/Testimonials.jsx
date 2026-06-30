import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Testimonials = () => {
  const { t, getTranslationObject } = useLanguage();
  const reviews = getTranslationObject('testimonials.reviews') || [];

  return (
    <section id="testimonials" className="py-24 px-4 bg-white dark:bg-black relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gray-50 dark:from-gray-900/20 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-gray-900 dark:text-white">
            {t('testimonials.title')}
          </h2>
          <div className="w-20 h-2 bg-blue-600 rounded-full" />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900 transition-all group"
            >
              <Quote className="w-10 h-10 text-blue-200 dark:text-blue-900 mb-6 group-hover:text-blue-500 transition-colors" />
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed italic">
                "{review.text}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {review.author.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{review.author}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-500">{review.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;