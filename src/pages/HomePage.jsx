
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Search } from 'lucide-react';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';
import Logo from '@/components/uffi/Logo';
import { fetchAllProducts, fetchAllCategories, getCategoryIdsForProducts, logSearch } from '@/lib/catalogQueries';
import { optimizedImageUrl } from '@/lib/imageUrl';
import { useLanguage } from '@/contexts/LanguageContext';
import ProductGridCard from '@/components/catalog/ProductGridCard';

export default function HomePage({ user }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productCategoryMap, setProductCategoryMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAllProducts, setShowAllProducts] = useState(true);

  const navigate = useNavigate();
  const { language, t, userChangedLanguage } = useLanguage();

  // Categories carry all 4 language names at once (name_en/name_pt/name_it/name_es),
  // so the dropdown label updates instantly when the site language changes —
  // no refetch needed.
  const getCategoryLabel = (cat) => cat[`name_${language}`] || cat.name;

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
        const [prods, cats] = await Promise.all([
          fetchAllProducts('all'),
          fetchAllCategories('en'),
        ]);
        setProducts(prods || []);
        setCategories(cats || []);
        const map = await getCategoryIdsForProducts((prods || []).map((p) => p.id));
        setProductCategoryMap(map);
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
      // Inactive products are only ever discoverable by owners (via their
      // Library) — never shown in browsing/discovery lists.
      if (product.active === false) return false;

      const pLang = (product.language || 'en').toLowerCase();

      // Filter logic: show all if globe is active, otherwise filter by language
      if (!showAllProducts && !pLang.includes(language)) {
        return false;
      }

      if (categoryFilter !== 'all') {
        const productCategoryIds = productCategoryMap.get(product.id) || [];
        if (!productCategoryIds.includes(categoryFilter)) return false;
      }

      const name = product.title || product.name || '';
      const desc = product.description || '';
      const matchSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          desc.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;
      return true;
    });
  }, [products, searchQuery, language, showAllProducts, categoryFilter, productCategoryMap]);

  // Independent of search/category/language filters — a decorative teaser of
  // everything on sale, not the actual filtered catalog below. Shuffled so
  // the order isn't the same every visit.
  const marqueeProducts = useMemo(() => {
    const active = products.filter((p) => p.active !== false);
    const shuffled = [...active];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [products]);

  // Silently logs searches that match nothing — signal for products people
  // want that we don't sell yet. Anonymous, debounced, best-effort.
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) return;
    const timer = setTimeout(() => {
      if (filteredProducts.length === 0) {
        logSearch(query, language);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [searchQuery, filteredProducts.length, language]);

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
          </motion.div>
        </section>

        {!loading && marqueeProducts.length > 0 && (
          <div className="w-full overflow-hidden py-5 border-y border-[#2a2a2a] bg-[#0a0a0a]/60">
            <motion.div
              className="flex gap-4 w-max"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: marqueeProducts.length * 4, repeat: Infinity, ease: 'linear' }}
            >
              {[...marqueeProducts, ...marqueeProducts].map((product, idx) => {
                const isFree = product.is_free || parseFloat(product.price) === 0 || !product.price;
                return (
                  <div
                    key={`${product.id}-${idx}`}
                    onClick={() => navigate(`/products/${product.slug || product.id}`)}
                    className={`flex items-center gap-2.5 bg-[#141414] border rounded-xl pl-2 pr-4 py-2 cursor-pointer transition-colors shrink-0 w-64 ${isFree ? 'border-[#C9A84C] shadow-[0_0_15px_rgba(201,168,76,0.4)] hover:border-[#C9A84C]' : 'border-[#2a2a2a] hover:border-[#f59e0b]/50'}`}
                  >
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-[#1a1a1a] shrink-0">
                      {product.image_url ? (
                        <img src={optimizedImageUrl(product.image_url, { width: 80, height: 80 })} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play size={14} className="text-[#2a2a2a]" />
                        </div>
                      )}
                    </div>
                    <span className="text-base leading-none shrink-0">{getLanguageFlag(product.language)}</span>
                    <span className="text-sm text-white font-semibold truncate">{product.title || product.name}</span>
                  </div>
                );
              })}
            </motion.div>
          </div>
        )}

        <section className="px-4 py-16 max-w-7xl mx-auto border-t border-[#2a2a2a]">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {t('home.our_products')}
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-3xl mx-auto mb-12">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('home.search_placeholder')}
                className="w-full bg-[#141414] border border-[#2a2a2a] rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#f59e0b] transition-colors"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter products by category"
              className="bg-[#141414] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f59e0b] transition-colors appearance-none sm:w-56"
            >
              <option value="all">{t('home.all_categories')}</option>
              {categories.filter((c) => c.active).map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {getCategoryLabel(c)}</option>
              ))}
            </select>
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
                      <ProductGridCard
                        product={product}
                        isFree={isFree}
                        learnMoreLabel={t('product.learn_more')}
                        onClick={() => navigate(isFree && !user ? '/login' : `/products/${product.slug || product.id}`)}
                      />
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
