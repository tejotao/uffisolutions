import React from 'react';
import { motion } from 'framer-motion';
import { getCategoryColor } from '@/lib/categoryColors';
import { getCategoryLabel } from '@/lib/categoryMapping';
import { useI18n } from '@/contexts/I18nContext';

const FeaturedBanner = ({ product, onPurchase }) => {
  const { t } = useI18n();

  if (!product) return null;

  const title = product.title || product.name || '';
  const desc = product.description || '';
  const isFree = product.price === null || product.price === 0;

  const catKey = product.mappedCategory || product.category || 'negocio-online';
  const colors = getCategoryColor(catKey);

  const handleAction = () => {
    if (onPurchase) onPurchase(product);
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        boxShadow: `0 20px 50px -12px ${colors.glowColor}`,
        borderColor: colors.lineColor
      }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full relative rounded-3xl overflow-hidden min-h-[350px] md:min-h-[450px] flex items-center border border-[#2a2a2a] group"
      style={{ borderLeft: `4px solid ${colors.lineColor}` }}
    >
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" 
        style={{ backgroundImage: `url(${product.image_url})` }} 
      />
      
      <div className="absolute inset-0 bg-black/70 md:bg-gradient-to-r md:from-[#0a0a0a] md:via-[#0a0a0a]/80 md:to-transparent" />
      
      <div className="relative z-10 p-8 md:p-16 max-w-3xl">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-block bg-[#f59e0b] text-black text-[10px] md:text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg"
          >
            ⭐ Destaque
          </motion.span>

          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`inline-flex items-center gap-1.5 text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-full border ${colors.bgColor} ${colors.textColor} ${colors.borderColor} shadow-lg`}
          >
            <span className="text-sm">{colors.icon}</span>
            {getCategoryLabel(catKey, t)}
          </motion.span>
        </div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-white text-3xl md:text-5xl lg:text-6xl font-black mb-4 leading-[1.1] drop-shadow-2xl"
        >
          {title}
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-gray-300 text-sm md:text-lg leading-relaxed mb-10 line-clamp-3 md:line-clamp-none max-w-2xl font-medium"
        >
          {desc}
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center gap-6"
        >
          <span className="text-[#f59e0b] text-3xl md:text-4xl font-black drop-shadow-md">
            {isFree ? 'GRÁTIS' : `R$ ${product.price}`}
          </span>
          <motion.button 
            onClick={handleAction}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#f59e0b] text-black px-8 py-4 rounded-xl text-base font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)]"
          >
            {isFree ? t('profile.access') || 'Aceder Agora' : t('hero.ctaPrimary').replace('🎓 ', '') || 'Comprar Agora'}
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FeaturedBanner;