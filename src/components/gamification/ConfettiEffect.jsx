import React from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const ConfettiEffect = () => {
  const { width, height } = useWindowSize();
  
  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <Confetti
        width={width}
        height={height}
        numberOfPieces={150}
        gravity={0.15}
        recycle={false}
        colors={['#f59e0b', '#8b5cf6', '#3b82f6', '#10b981', '#ef4444']}
      />
    </div>
  );
};

export default ConfettiEffect;