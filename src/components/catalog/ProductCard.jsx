import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ProductCard({ product, onPurchase }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, t, translateCategory } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);

  const numericPrice = Number(product.price) || 0;
  const isFree = product.is_free === true || product.isFree === true || numericPrice <= 0;
  const isPaid = !isFree && numericPrice > 0;

  const categoryColor = product.category?.color || '#666';
  const productIcon = product.category?.icon || '📁';
  const categorySlug = product.category?.slug || product.categorySlug || 'others';
  const categoryName = translateCategory(categorySlug);

  const formatPrice = (price) => {
    const val = Number(price);
    if (!val || val <= 0) return null;

    if (val > 1000) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(val / 100);
    }

    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(val);
  };

  const handleActionClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPaid) {
      const checkoutUrl = product.stripeLink || product.stripe_payment_link;
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank');
      } else if (onPurchase) {
        onPurchase(product);
      } else {
        alert('Link de checkout não configurado para este produto.');
      }
    } else {
      navigate(`/course/${product.slug || product.id}`);
    }
  };

  const getProductName = () => {
    if (product.product_translations && Array.isArray(product.product_translations) && product.product_translations.length > 0) {
      const trans = product.product_translations.find(tr => tr.language === language || tr.language.startsWith(language));
      if (trans && trans.name) return trans.name;
      return product.product_translations[0].name || product.title || product.name;
    }
    return product.title || product.name || 'Sem Título';
  };

  const getProductDescription = () => {
    if (product.product_translations && Array.isArray(product.product_translations) && product.product_translations.length > 0) {
      const trans = product.product_translations.find(tr => tr.language === language || tr.language.startsWith(language));
      if (trans && trans.description) return trans.description;
      return product.product_translations[0].description || product.description;
    }
    return product.description || t('text.noDescription');
  };

  const productName = getProductName();
  const productDescription = getProductDescription();

  return (
    <div
      className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 flex flex-col justify-between h-full relative overflow-hidden transition-all duration-300 hover:border-gray-700"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div>
        {/* Category Badge */}
        <div className="flex justify-between items-center mb-4">
          <span
            className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 bg-opacity-10"
            style={{ backgroundColor: `${categoryColor}20`, color: categoryColor, border: `1px solid ${categoryColor}40` }}
          >
            <span>{productIcon}</span>
            <span>{categoryName}</span>
          </span>
        </div>

        {/* Icon */}
        <div className="flex justify-center my-6">
          <div className="text-6xl text-gray-400 opacity-80 transition-transform duration-300 transform hover:scale-110">
            {productIcon}
          </div>
        </div>

        {/* Free Badge */}
        {isFree && (
          <div className="mb-3">
            <span className="bg-[#ffaa00] text-black text-xs font-bold px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
              {t('badge.free')}
            </span>
          </div>
        )}

        {/* Text */}
        <h3 className="text-white font-bold text-xl mb-2 line-clamp-2" title={productName}>
          {productName}
        </h3>
        <p className="text-gray-400 text-sm mb-6 line-clamp-3">
          {productDescription}
        </p>
      </div>

      {/* Price & Actions */}
      <div>
        <div className="mb-4">
          {isPaid ? (
            <span className="text-white font-bold text-2xl">
              {formatPrice(numericPrice)}
            </span>
          ) : (
            <span className="text-green-500 font-bold text-xl">
              {t('text.free')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate(`/course/${product.slug || product.id}`)}
            className="text-white border border-gray-700 hover:bg-gray-800 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1"
          >
            {t('button.viewMore')}
          </button>

          <button
            onClick={handleActionClick}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1 ${isPaid
                ? 'bg-[#ffaa00] hover:bg-yellow-600 text-black'
                : 'bg-transparent text-white border border-gray-700 hover:bg-gray-800'
              }`}
          >
            {isPaid ? t('text.buyCart') : t('text.accessBook')}
          </button>
        </div>
      </div>
    </div>
  );
}