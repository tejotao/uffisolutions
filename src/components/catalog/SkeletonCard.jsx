import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="w-[200px] md:w-[240px] lg:w-[280px] h-[360px] md:h-[400px] rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] overflow-hidden flex flex-col shrink-0">
      <div className="h-[50%] md:h-[55%] animate-shimmer w-full"></div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="h-4 w-24 rounded bg-[#2a2a2a] animate-shimmer mb-3"></div>
        <div className="h-5 w-full rounded bg-[#2a2a2a] animate-shimmer mb-2"></div>
        <div className="h-4 w-3/4 rounded bg-[#2a2a2a] animate-shimmer mb-4"></div>
        
        <div className="mt-auto flex justify-between items-center">
          <div className="h-6 w-16 rounded bg-[#2a2a2a] animate-shimmer"></div>
          <div className="h-8 w-20 rounded bg-[#2a2a2a] animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;