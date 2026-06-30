
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';
import { fetchAllProducts } from '@/lib/catalogQueries';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ProductsPage({ user }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllProducts, setShowAllProducts] = useState(true);
  
  const navigate = useNavigate();
  const { language, t, userChangedLanguage } = useLanguage();

  const handleShowAllProducts = () => {
    setShowAllProducts(true);
  };

  useEffect(() => {
    if (userChangedLanguage) {
      setShowAllProducts(false);
    }
  }, [language, userChangedLanguage]);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const prods = await fetchAllProducts('all');
        setProducts(prods || []);
      } catch (err) {
        console.error('❌ Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const pLang = (product.language || 'en').toLowerCase();
      
      // Filter logic: show all if globe is active, otherwise filter by language
      if (!showAllProducts && !pLang.includes(language)) {
        return false;
      }
      
      const name = product.title || product.name || '';
      const desc = product.description || '';
      const matchSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          desc.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;
      return true;
    });
  }, [products, searchQuery, language, showAllProducts]);

  const getLanguageFlag = (lang) => {
    if (!lang) return '🌐';
    const l = lang.toLowerCase();
    if (l.includes('pt-br') || l === 'pt') return '🇧🇷';
    if (l.includes('en')) return '🇬🇧';
    if (l.includes('es')) return '🇪🇸';
    if (l.includes('it')) return '🇮🇹';
    return '🌐';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Header 
        user={user}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onShowAllProducts={handleShowAllProducts}
        showAllActive={showAllProducts}
        onLanguageSelect={() => setShowAllProducts(false)}
      />
      
      <main className="flex-grow pt-24 px-4 pb-16">
        <section className="max-w-7xl mx-auto">
          <div className="text-center mb-12 py-10">
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
              {t('products.title')}
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {t('products.subtitle')}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-[#141414] rounded-2xl h-80 animate-pulse border border-[#2a2a2a]" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-[#141414] rounded-2xl border border-[#2a2a2a]">
              <p className="text-gray-400 text-xl font-medium">{t('home.no_products')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, index) => {
                  const isFree = product.is_free || parseFloat(product.price) === 0 || !product.price;

                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div 
                        className={`bg-[#141414] border rounded-2xl overflow-hidden transition-colors group flex flex-col h-full cursor-pointer ${isFree ? 'border-green-500/40 hover:border-green-500/80 shadow-[0_0_15px_rgba(34,197,94,0.05)] hover:shadow-[0_0_20px_rgba(34,197,94,0.15)]' : 'border-[#2a2a2a] hover:border-[#f59e0b]/50'}`}
                        onClick={() => navigate(isFree && !user ? '/login' : `/products/${product.id}`)}
                      >
                        <div className="aspect-video bg-[#0a0a0a] relative overflow-hidden">
                          {isFree && (
                            <div className="absolute top-2 left-2 bg-green-500 text-black px-2 py-1 rounded text-sm font-black z-10 shadow-lg">
                              🎁 Free
                            </div>
                          )}
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
                              <Play size={32} className="text-[#2a2a2a]" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-2xl shadow-sm z-10">
                            {getLanguageFlag(product.language)}
                          </div>
                        </div>
                        <div className="p-5 flex flex-col flex-grow">
                          <h3 className={`font-bold text-white mb-2 line-clamp-2 transition-colors ${isFree ? 'group-hover:text-green-400' : 'group-hover:text-[#f59e0b]'}`}>{product.title || product.name}</h3>
                          <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-grow">{product.description}</p>
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#2a2a2a]">
                            <span className="font-black text-white">
                              {isFree ? <span className="text-green-500">{t('product.free')}</span> : `£${Number(product.price).toFixed(2)}`}
                            </span>
                            <span className={`font-bold text-sm px-3 py-1 rounded-lg ${isFree ? 'text-green-500 bg-green-500/10' : 'text-[#f59e0b] bg-[#f59e0b]/10'}`}>
                              {t('product.learn_more')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
