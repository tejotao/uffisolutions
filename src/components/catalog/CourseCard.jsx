
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getCategoryColor, getCategoryIcon } from '@/lib/categoryColors';
import { useLanguage } from '@/contexts/LanguageContext';
import PremiumContentModal from './PremiumContentModal';

export default function CourseCard({ product, isPurchased }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, t, translateCategory } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [fetchedLang, setFetchedLang] = useState(null);
  
  const safeProduct = product || {};
  const catSlug = safeProduct?.category?.slug || safeProduct?.categorySlug || safeProduct?.category_id || 'others';
  
  const colors = getCategoryColor(catSlug);
  const icon = getCategoryIcon(catSlug);
  const label = translateCategory(catSlug);
  
  const numericPrice = parseFloat(safeProduct?.price) || 0;
  const isFree = safeProduct?.is_free === true || safeProduct?.isFree === true || numericPrice === 0;
  const isPaid = !isFree && numericPrice > 0;

  const activeColor = safeProduct?.category?.color || colors.primary || '#ffaa00';

  useEffect(() => {
    const fetchCategoriaTranslator = async () => {
      if (!safeProduct.category_id) return;
      try {
        const response = await fetch(`/api/categoria_translator?category_id=${safeProduct.category_id}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.language) {
            setFetchedLang(data.language);
          }
        }
      } catch (error) {
        // Fallback silently
      }
    };
    fetchCategoriaTranslator();
  }, [safeProduct.category_id]);

  const getProductName = () => {
    if (safeProduct.product_translations && Array.isArray(safeProduct.product_translations) && safeProduct.product_translations.length > 0) {
      const trans = safeProduct.product_translations.find(tr => tr.language === language || tr.language.startsWith(language));
      if (trans && trans.name) return trans.name;
      return safeProduct.product_translations[0].name || safeProduct.title || safeProduct.name;
    }
    return safeProduct.title || safeProduct.name || 'Sem Título';
  };

  const getProductDescription = () => {
    if (safeProduct.product_translations && Array.isArray(safeProduct.product_translations) && safeProduct.product_translations.length > 0) {
      const trans = safeProduct.product_translations.find(tr => tr.language === language || tr.language.startsWith(language));
      if (trans && trans.description) return trans.description;
      return safeProduct.product_translations[0].description || safeProduct.description;
    }
    return safeProduct.description || t('text.noDescription') || 'Sem descrição';
  };

  const getLanguageFlag = (lang) => {
    if (!lang) return '🌐';
    const l = lang.toLowerCase();
    if (l.includes('pt-br')) return '🇧🇷';
    if (l.includes('pt')) return '🇧🇷';
    if (l.includes('en-us')) return '🇬🇧';
    if (l.includes('en')) return '🇬🇧';
    if (l.includes('es')) return '🇪🇸';
    if (l.includes('it')) return '🇮🇹';
    return '🌐';
  };

  const productName = getProductName();
  const productDescription = getProductDescription();
  const imageUrl = safeProduct.image_url || safeProduct.imageUrl;
  
  const displayLang = fetchedLang || safeProduct.language;

  const handleAccessClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isPaid) {
      const checkoutUrl = safeProduct.stripe_payment_link || safeProduct.stripe_link || safeProduct.stripeLink;
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank');
      } else {
        alert('Link de checkout não configurado para este produto.');
      }
    } else {
      if (!user) {
        navigate('/login');
        return;
      }
      setIsModalOpen(true);
    }
  };

  const onVerMaisClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (safeProduct.slug) {
      navigate(`/produto/${safeProduct.slug}`);
    } else if (safeProduct.id) {
      navigate(`/produto/${safeProduct.id}`);
    }
  };

  const modalProduct = {
    name: productName,
    content_url: safeProduct.content_url,
    drive_link: safeProduct.drive_link,
    stripe_link: safeProduct.stripe_payment_link || safeProduct.stripe_link
  };

  const productIdPreview = safeProduct.id ? safeProduct.id.substring(0, 8) : '';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ 
          y: -6,
          boxShadow: `0 12px 30px -4px ${activeColor}25, 0 4px 12px -2px ${activeColor}15`
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="bg-[#121212] rounded-2xl overflow-hidden flex flex-col h-full group relative transition-all duration-300"
        style={{ 
          border: isHovered ? `1px solid ${activeColor}` : '1px solid #1f2937',
          borderLeft: `6px solid ${activeColor}`
        }}
      >
        <div onClick={onVerMaisClick} className="block h-full outline-none flex flex-col flex-grow cursor-pointer relative">
          
          <div 
            className="absolute top-3 left-3 z-20 text-3xl sm:text-4xl drop-shadow-md pointer-events-none"
            title={`Idioma: ${displayLang || 'Desconhecido'}`}
          >
            {getLanguageFlag(displayLang)}
          </div>

          <div className="relative aspect-video overflow-hidden bg-[#181818] flex items-center justify-center">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={productName}
                className="w-full h-full object-cover transition-transform duration-700 ease-out"
                style={{ transform: isHovered ? 'scale(1.06)' : 'scale(1)' }}
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            
            <div 
              className={`w-full h-full flex items-center justify-center text-5xl bg-opacity-5 transition-transform duration-700 ease-out ${imageUrl ? 'hidden' : 'flex'}`}
              style={{ transform: isHovered ? 'scale(1.12)' : 'scale(1)' }}
            >
              {safeProduct?.category?.icon || icon}
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
            
            <div 
              className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black shadow-sm backdrop-blur-md border transition-all duration-300 z-10"
              style={{ 
                backgroundColor: `${activeColor}15`, 
                color: activeColor, 
                borderColor: `${activeColor}40` 
              }}
            >
              <span>{safeProduct?.category?.icon || icon}</span>
              <span>{safeProduct?.category?.name || label}</span>
            </div>
          </div>

          <div 
            className="p-5 flex flex-col flex-grow bg-[#161616] relative"
            style={{ background: `linear-gradient(to right, ${activeColor}08, transparent)` }}
          >
            <h3 
              className="text-white text-base sm:text-lg font-bold mb-2 line-clamp-2 leading-tight transition-colors duration-300"
              style={{ color: isHovered ? activeColor : '#ffffff' }}
              title={productName}
            >
              {productName}
            </h3>
            
            <p className="text-gray-400 text-xs sm:text-sm line-clamp-2 mb-5 flex-grow font-light">
              {productDescription}
            </p>

            <div className="flex justify-between items-center mb-5 pt-2 border-t border-gray-800/50">
              {isPaid ? (
                <span className="text-white font-black text-lg sm:text-xl tracking-tight">
                  {new Intl.NumberFormat('en-GB', {
                    style: 'currency',
                    currency: 'GBP'
                  }).format(numericPrice)}
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20 tracking-wide flex items-center gap-1.5">
                  🎁 Gratuito
                </span>
              )}
            </div>

            <div className="mt-auto flex gap-2.5 w-full">
              <button
                onClick={onVerMaisClick}
                className="flex items-center justify-center px-3 py-2.5 text-xs font-bold text-gray-400 bg-transparent border border-gray-800 rounded-xl hover:bg-[#1f1f1f] hover:text-white transition-all duration-200 whitespace-nowrap"
              >
                Saber mais
              </button>
              
              <button
                onClick={handleAccessClick}
                className="flex-grow px-4 py-2.5 text-xs font-black rounded-xl border transition-all duration-200 transform active:scale-95 shadow-sm uppercase"
                style={{ 
                  backgroundColor: isPaid ? activeColor : 'transparent', 
                  color: isPaid ? '#000000' : '#ffffff', 
                  borderColor: isPaid ? activeColor : '#2e2e2e',
                  boxShadow: (isPaid && isHovered) ? `0 4px 14px ${activeColor}40` : 'none'
                }}
              >
                {isPaid ? 'Comprar' : 'Acessar'}
              </button>
            </div>

            {productIdPreview && (
              <div className="absolute bottom-1 right-2 text-[10px] text-gray-600 opacity-50 select-none">
                ID: {productIdPreview}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <PremiumContentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={modalProduct} 
      />
    </>
  );
}
