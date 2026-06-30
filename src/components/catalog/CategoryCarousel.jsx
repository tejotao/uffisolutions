import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { getCategoryColor } from '@/lib/categoryColors';

const CategoryCarousel = ({ category, products, categoryLabel }) => {
  const scrollRef = useRef(null);

  if (!products || products.length === 0) return null;

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
    }
  };

  const colors = getCategoryColor(category);

  return (
    <div className="mb-16 relative group/carousel">
      <div className="flex items-center justify-between mb-8 px-2">
        <h3 
          className="text-2xl md:text-3xl font-black m-0 flex items-center gap-3 drop-shadow-md"
          style={{ color: colors.lineColor }}
        >
          <span className="text-3xl drop-shadow-lg">{colors.icon}</span>
          {categoryLabel}
          <span className={`bg-[#1c1c1c] text-sm px-3 py-1 rounded-full font-bold ml-2 ${colors.textColor}`}>
            {products.length}
          </span>
        </h3>
      </div>
      
      <div className="relative">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => scroll(-1)}
          className="hidden md:flex absolute -left-6 top-[45%] -translate-y-1/2 bg-[#141414] border-2 text-[#f59e0b] hover:bg-[#f59e0b] hover:text-black rounded-full w-14 h-14 items-center justify-center cursor-pointer z-10 shadow-[0_0_20px_rgba(0,0,0,0.8)] opacity-0 group-hover/carousel:opacity-100 transition-all duration-300"
          style={{ borderColor: colors.lineColor, color: colors.lineColor }}
        >
          <ChevronLeft className="w-8 h-8" />
        </motion.button>
        
        <div 
          ref={scrollRef} 
          className="flex gap-6 overflow-x-auto pb-8 px-2 scrollbar-hide snap-x"
        >
          {products.map(p => (
            <div key={p.id} className="snap-start">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => scroll(1)}
          className="hidden md:flex absolute -right-6 top-[45%] -translate-y-1/2 bg-[#141414] border-2 text-[#f59e0b] hover:bg-[#f59e0b] hover:text-black rounded-full w-14 h-14 items-center justify-center cursor-pointer z-10 shadow-[0_0_20px_rgba(0,0,0,0.8)] opacity-0 group-hover/carousel:opacity-100 transition-all duration-300"
          style={{ borderColor: colors.lineColor, color: colors.lineColor }}
        >
          <ChevronRight className="w-8 h-8" />
        </motion.button>
      </div>
    </div>
  );
};

export default CategoryCarousel;