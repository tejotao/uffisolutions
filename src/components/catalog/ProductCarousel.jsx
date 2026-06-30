import React, { useRef } from 'react';
import ProductCard from './ProductCard';
import SkeletonCard from './SkeletonCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

const ProductCarousel = ({ title, products, loading }) => {
  const scrollRef = useRef(null);
  const { t } = useI18n();

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
    }
  };

  if (!loading && (!products || products.length === 0)) return null;

  return (
    <div className="mb-14 relative group/carousel">
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="text-white text-xl md:text-2xl font-bold m-0 border-l-4 border-[#f59e0b] pl-4 tracking-wide drop-shadow-sm">
          {title}
        </h2>
        <span className="text-[#f59e0b] text-sm font-bold cursor-pointer hover:text-amber-400 transition-colors">
          {t('products.viewAll')}
        </span>
      </div>
      
      <div className="relative">
        <button 
          onClick={() => scroll(-1)}
          className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 bg-[#1c1c1c] border border-[#f59e0b] hover:bg-[#f59e0b] text-[#f59e0b] hover:text-black rounded-full w-12 h-12 items-center justify-center cursor-pointer z-10 shadow-[0_0_15px_rgba(0,0,0,0.5)] opacity-0 group-hover/carousel:opacity-100 transition-all duration-300"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div 
          ref={scrollRef} 
          className="flex gap-4 md:gap-6 overflow-x-auto pb-8 px-2 scrollbar-hide snap-x"
        >
          {loading 
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="snap-start"><SkeletonCard /></div>
              ))
            : products.map(p => (
                <div key={p.id} className="snap-start"><ProductCard product={p} /></div>
              ))
          }
        </div>
        
        <button 
          onClick={() => scroll(1)}
          className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 bg-[#1c1c1c] border border-[#f59e0b] hover:bg-[#f59e0b] text-[#f59e0b] hover:text-black rounded-full w-12 h-12 items-center justify-center cursor-pointer z-10 shadow-[0_0_15px_rgba(0,0,0,0.5)] opacity-0 group-hover/carousel:opacity-100 transition-all duration-300"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ProductCarousel;