
import React, { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';
import { fetchAllProducts } from '@/lib/catalogQueries';
import { getUserPurchases } from '@/lib/purchaseQueries';
import { getMyActiveAccesses } from '@/lib/accessQueries';
import { useLanguage } from '@/contexts/LanguageContext';
import { buildCollectionPageSchema } from '@/lib/siteSchema';
import ProductGridCard from '@/components/catalog/ProductGridCard';

const SITE_URL = 'https://www.uffisolutions.com';

export default function ProductsPage({ user }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllProducts, setShowAllProducts] = useState(true);
  const [accessibleIds, setAccessibleIds] = useState(new Set());
  
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

        if (user) {
          const [purchases, accesses] = await Promise.all([
            getUserPurchases(user.email),
            getMyActiveAccesses(user.id),
          ]);
          const ids = new Set([
            ...(purchases || []).map(p => p.product_id),
            ...(accesses  || []).map(a => a.id),
          ]);
          setAccessibleIds(ids);
        }
      } catch (err) {
        console.error('❌ Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [user]);

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
      
      const name = product.title || product.name || '';
      const desc = product.description || '';
      const matchSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          desc.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;
      return true;
    });
  }, [products, searchQuery, language, showAllProducts]);

  const pageTitle = `${t('products.title')} — UffiSolutions`;
  const collectionSchema = buildCollectionPageSchema({
    name: t('products.title'),
    description: t('products.subtitle'),
    url: `${SITE_URL}/products`,
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={t('products.subtitle')} />
        <link rel="canonical" href={`${SITE_URL}/products`} />
        <script type="application/ld+json">{JSON.stringify(collectionSchema)}</script>
      </Helmet>
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
                  const isFree    = product.is_free || parseFloat(product.price) === 0 || !product.price;
                  const inLibrary = accessibleIds.has(product.id);

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
                        inLibrary={inLibrary}
                        learnMoreLabel={t('product.learn_more')}
                        onClick={() => navigate(`/products/${product.slug || product.id}`)}
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
