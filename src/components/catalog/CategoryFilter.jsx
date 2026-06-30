
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchAllCategories } from '@/lib/catalogQueries';

export default function CategoryFilter({ categories: propsCategories, selectedCategory, onSelectCategory }) {
  const [isOpen, setIsOpen] = useState(false);
  const [fetchedCategories, setFetchedCategories] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const loadCategories = async () => {
      if (!propsCategories || propsCategories.length === 0) {
        try {
          const cats = await fetchAllCategories('all');
          if (cats) setFetchedCategories(cats);
        } catch (error) {
          console.error("Failed to load categories", error);
        }
      }
    };
    loadCategories();
  }, [propsCategories]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categoriesToUse = propsCategories?.length > 0 ? propsCategories : fetchedCategories;

  const currentCategoryObj = selectedCategory && selectedCategory !== 'all' 
    ? categoriesToUse.find(c => c.slug?.toLowerCase() === selectedCategory.toLowerCase())
    : null;

  return (
    <div className="relative w-full max-w-xs" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-left transition-all duration-200 border",
          isOpen 
            ? "bg-[#1f1f1f] border-[#f59e0b] text-white shadow-[0_0_15px_rgba(245,158,11,0.15)]" 
            : "bg-[#1a1a1a] border-gray-800 text-gray-300 hover:bg-[#1f1f1f] hover:border-gray-700"
        )}
      >
        <div className="flex items-center gap-3">
          {currentCategoryObj ? (
            <>
              <div 
                className="w-3 h-3 rounded-full shrink-0 shadow-sm" 
                style={{ backgroundColor: currentCategoryObj.color || '#f59e0b' }}
              />
              <span className="text-lg sm:text-xl">
                {currentCategoryObj.icon || '📁'}
              </span>
              <span className="font-semibold text-sm sm:text-base truncate">
                {currentCategoryObj.name}
              </span>
            </>
          ) : (
            <>
              <div className="w-3 h-3 rounded-full bg-[#f59e0b] shrink-0 shadow-sm" />
              <span className="text-lg sm:text-xl text-white">🌍</span>
              <span className="font-semibold text-white text-sm sm:text-base truncate">Todas as Categorias</span>
            </>
          )}
        </div>
        <ChevronDown 
          className={cn("w-5 h-5 shrink-0 transition-transform duration-300", isOpen && "rotate-180 text-[#f59e0b]")} 
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 py-2 bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl overflow-hidden">
          <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
            
            <button
              onClick={() => {
                onSelectCategory(null);
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 text-left transition-colors",
                !selectedCategory || selectedCategory === 'all'
                  ? "text-white font-bold"
                  : "text-gray-300 hover:bg-[#222] hover:text-white"
              )}
              style={!selectedCategory || selectedCategory === 'all' ? { backgroundColor: '#f59e0b40' } : {}}
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#f59e0b] shrink-0 shadow-sm" />
                <span className="text-lg sm:text-xl opacity-90">🌍</span>
                <span className="text-sm sm:text-base">Todas as Categorias</span>
              </div>
              {(!selectedCategory || selectedCategory === 'all') && (
                <Check className="w-4 h-4 text-white shrink-0" />
              )}
            </button>
            
            {categoriesToUse?.map((category) => {
              const isActive = selectedCategory && category.slug && 
                selectedCategory.toLowerCase() === category.slug.toLowerCase();
              const catColor = category.color || '#f59e0b';
                
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    onSelectCategory(category.slug);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 text-left transition-colors",
                    isActive
                      ? "text-white font-bold shadow-inner"
                      : "text-gray-300 hover:bg-[#222] hover:text-white"
                  )}
                  style={isActive ? { backgroundColor: `${catColor}40` } : {}}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm" 
                      style={{ backgroundColor: catColor }}
                    />
                    <span className="text-lg sm:text-xl opacity-90">
                      {category.icon || '📁'}
                    </span>
                    <span className="text-sm sm:text-base">{category.name}</span>
                  </div>
                  {isActive && (
                    <Check className="w-4 h-4 text-white shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
