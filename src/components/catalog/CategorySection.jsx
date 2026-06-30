import React, { useRef } from 'react';
import ProductCard from './ProductCard';
import { useI18n } from '@/contexts/I18nContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CategorySection = ({ category, products }) => {
  const { t } = useI18n();
  const scrollRef = useRef(null);
  
  // Try mapping translation if it exists, otherwise use context translation
  const catName = t(`categories.${category.slug}`) !== `categories.${category.slug}` 
                  ? t(`categories.${category.slug}`)
                  : (category.category_translations?.[0]?.name || category.slug || category.key || category);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="mb-12 relative group/section">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-white text-xl font-bold m-0 border-l-4 border-[#f59e0b] pl-3 tracking-wide">
          {catName}
        </h2>
        <span className="text-[#f59e0b] text-sm font-semibold cursor-pointer hover:text-amber-400 transition-colors">
          {t('products.viewAll')}
        </span>
      </div>
      
      <div className="relative">
        <button 
          onClick={() => scroll(-1)}
          className="absolute -left-4 top-1/2 -translate-y-1/2 bg-[#f59e0b]/90 hover:bg-[#f59e0b] border-none text-black rounded-full w-9 h-9 flex items-center justify-center cursor-pointer z-10 shadow-lg opacity-0 group-hover/section:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div 
          ref={scrollRef} 
          className="flex gap-4 overflow-x-auto pb-4 px-1 scrollbar-hide snap-x"
        >
          {products.map(p => (
            <div key={p.id} className="snap-start">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
        
        <button 
          onClick={() => scroll(1)}
          className="absolute -right-4 top-1/2 -translate-y-1/2 bg-[#f59e0b]/90 hover:bg-[#f59e0b] border-none text-black rounded-full w-9 h-9 flex items-center justify-center cursor-pointer z-10 shadow-lg opacity-0 group-hover/section:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CategorySection;