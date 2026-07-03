
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';
import Logo from '@/components/uffi/Logo';
import { fetchAllProducts } from '@/lib/catalogQueries';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HomePage({ user }) {
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
      
      <main className="flex-grow">
        <section className="relative pt-32 pb-20 px-4 text-center overflow-hidden flex flex-col items-center justify-center min-h-[50vh]">
          <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.08)_0%,transparent_70%)] pointer-events-none" />
          <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.05)_0%,transparent_70%)] pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative max-w-4xl mx-auto z-10 flex flex-col items-center gap-6"
          >
            <Logo size="xl" />
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-2 leading-[1.1] tracking-tight">
              {t('home.hero.title')}
              <br className="hidden sm:block" />
              <span className="text-[#f59e0b]"> {t('home.hero.title_highlight')}</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl font-medium mb-6 max-w-2xl mx-auto px-4">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => navigate('/products')}
                className="bg-[#f59e0b] hover:bg-[#d97706] text-black px-8 py-4 rounded-xl font-bold transition-all shadow-lg w-full sm:w-auto"
              >
                {t('home.explore')}
              </button>
              {!user && (
                <button 
                  onClick={() => navigate('/login')}
                  className="bg-[#141414] border border-[#2a2a2a] hover:border-[#f59e0b] text-white hover:text-[#f59e0b] px-8 py-4 rounded-xl font-bold transition-all shadow-lg w-full sm:w-auto"
                >
                  Acessar Plataforma
                </button>
              )}
            </div>
          </motion.div>
        </section>

        <section className="px-4 py-16 max-w-7xl mx-auto border-t border-[#2a2a2a]">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {t('home.our_products')}
            </h2>
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
                        onClick={() => navigate(isFree && !user ? '/login' : `/products/${product.slug || product.id}`)}
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
