import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Logo({ 
  variant = 'full', 
  size = 'medium', 
  showText = true,
  className = '' 
}) {
  const sizeMap = {
    small: 'w-[32px] h-[32px]',
    medium: 'w-[48px] h-[48px]',
    large: 'w-[64px] h-[64px]'
  };

  const isWhite = variant === 'white';
  const isIcon = variant === 'icon';

  return (
    <Link to="/">
      <motion.div 
        className={`flex items-center gap-3 cursor-pointer group ${className}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        whileHover={{ scale: 1.05 }}
      >
        <img 
          src="https://horizons-cdn.hostinger.com/1db78d05-91f5-4455-8f8f-f031a8b68532/bec317f85eae1e9026cea33b42e08b4b.png" 
          alt="UffiSolutions Logo"
          className={`
            ${sizeMap[size] || sizeMap.medium} 
            object-contain drop-shadow-lg transition-all duration-300
            group-hover:drop-shadow-[0_8px_16px_rgba(245,158,11,0.4)]
            ${isWhite ? 'brightness-0 invert' : ''}
          `}
        />
        
        {showText && !isIcon && (
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-bold tracking-tight text-white leading-none">
              Uffi<span className="text-[#f59e0b]">Solutions</span>
            </span>
          </div>
        )}
      </motion.div>
    </Link>
  );
}