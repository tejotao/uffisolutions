
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Logo = ({ size = 'md', clickable = false, className }) => {
  const navigate = useNavigate();
  
  const sizeMap = {
    sm: 'w-8 h-8',    // 32px
    md: 'w-12 h-12',  // 48px
    lg: 'w-16 h-16',  // 64px
    xl: 'w-20 h-20'   // 80px
  };
  
  const dimensions = sizeMap[size] || sizeMap.md;
  
  const handleClick = () => {
    if (clickable) {
      navigate('/');
    }
  };

  const Container = clickable ? motion.button : motion.div;
  const motionProps = clickable ? { whileHover: { scale: 1.05, rotate: 10 } } : {};

  return (
    <Container
      onClick={handleClick}
      className={cn("flex-shrink-0 focus:outline-none flex items-center justify-center", dimensions, className)}
      {...motionProps}
    >
      <img 
        src="https://horizons-cdn.hostinger.com/1db78d05-91f5-4455-8f8f-f031a8b68532/57e87afb0356e1c00547152607556f48.png" 
        alt="UffiSolutions Logo"
        className="w-full h-full object-contain"
      />
    </Container>
  );
};

export default Logo;
