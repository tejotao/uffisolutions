
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';
import CookieConsent from '@/components/uffi/CookieConsent';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import CourseCard from '@/components/catalog/CourseCard';
import CategoryFilter from '@/components/catalog/CategoryFilter';
import { fetchAllProducts, fetchCategories } from '@/lib/catalogQueries';

export default function UffiSolutions() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [languageFilter, setLanguageFilter] = useState('TODOS');
  
  const [purchasedSet, setPurchasedSet] = useState(new Set());
  
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [prods, cats] = await Promise.all([
          fetchAllProducts('all'), 
          fetchCategories('all')
        ]);
        setProducts(prods || []);
        setCategories(cats || []);

        if (user) {
          const { data } = await supabase
            .from('purchases')
            .select('product_id')
            .eq('user_id', user.id);
          
          if (data) {
            setPurchasedSet(new Set(data.map(p => p.product_id)));
          }
        }
      } catch (err) {
        console.error('Homepage load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  // Cascading filters
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // 1) Language Filter
      if (languageFilter !== 'TODOS') {
        const pLang = (product.language || '').toUpperCase();
        if (!pLang.includes(languageFilter) && languageFilter !== pLang) {
          return false;
        }
      }

      // 2) Search Query
      const name = product.title || product.name || '';
      const desc = product.description || '';
      const matchSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          desc.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;

      // 3) Category Selection
      const matchCat = !selectedCategory || 
                       selectedCategory === 'all' || 
                       product.categorySlug === selectedCategory || 
                       product.category?.slug === selectedCategory;
      if (!matchCat) return false;

      return true;
    });
  }, [products, searchQuery, selectedCategory, languageFilter]);

  const stats = [
    { value: `${products.length}+`, label: 'PRODUTOS' },
    { value: `${categories.length}`, label: 'CATEGORIAS' },
    { value: '100%', label: 'DIGITAL' }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Header 
        languageFilter={languageFilter} 
        onLanguageFilterChange={setLanguageFilter} 
      />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4 text-center overflow-hidden flex flex-col items-center justify-center min-h-[60vh]">
          <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.08)_0%,transparent_70%)] pointer-events-none" />
          <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.05)_0%,transparent_70%)] pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative max-w-4xl mx-auto z-10"
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight">
              Conhecimento que
              <br className="hidden sm:block" />
              <span className="text-[#f59e0b]"> gera resultado</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl font-medium mb-10 max-w-2xl mx-auto px-4">
              Do conhecimento à conquista — aprenda, importe e evolua.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-8 flex flex-wrap justify-center gap-10 z-10"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-[#f59e0b] mb-1">
                  {stat.value}
                </div>
                <div className="text-[11px] sm:text-xs text-gray-500 font-bold uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Catalog Section */}
        <section id="catalogo" className="px-4 py-16 max-w-7xl mx-auto border-t border-gray-800">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
              Explorar Produtos
            </h2>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col md:flex-row items-center gap-4 mb-12">
            {/* Category Dropdown */}
            <div className="w-full md:w-1/3">
              <CategoryFilter 
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-2/3">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl pl-12 pr-4 py-3 sm:py-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#f59e0b] transition-all"
              />
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-[#141414] rounded-2xl h-80 animate-pulse border border-[#2a2a2a]" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-[#141414] rounded-2xl border border-[#2a2a2a]">
              <p className="text-gray-400 text-xl font-medium">Nenhum produto encontrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <CourseCard 
                      product={product} 
                      isPurchased={purchasedSet.has(product.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>

      <div className="mt-20">
        <Footer />
      </div>
      
      <CookieConsent />
    </div>
  );
}
