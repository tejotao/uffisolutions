import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CloseButton({ 
  onClick, 
  size = 'medium', 
  variant = 'default',
  className 
}) {
  const sizeClasses = {
    small: 'p-1.5',
    medium: 'p-2',
    large: 'p-3'
  };

  const iconSizes = {
    small: 16,
    medium: 20,
    large: 24
  };

  const variantClasses = {
    default: 'text-gray-400 hover:text-white hover:bg-white/10 rounded-full',
    modal: 'text-gray-400 hover:text-white bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-full shadow-sm',
    page: 'text-gray-400 hover:text-white hover:bg-white/5 rounded-xl'
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50 flex items-center justify-center',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      aria-label="Fechar"
      title="Fechar"
    >
      <X size={iconSizes[size]} />
    </button>
  );
}