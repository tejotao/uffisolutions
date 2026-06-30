import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useI18n } from '@/contexts/I18nContext';
import ProductCard from '@/components/catalog/ProductCard';
import Logo from '@/components/Logo';

export default function FavoritesPage() {
  const { favorites, loading } = useFavorites();
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 flex flex-col relative">
      <Header />
      
      <main className="flex-grow max-w-[1400px] mx-auto w-full px-4 md:px-8 pt-8">
        <div className="flex items-center gap-4 mb-10">
          <Logo variant="icon" size="medium" />
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
            <Heart size={24} className="fill-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black">{t('favorites.title') || 'Meus Favoritos'}</h1>
            <p className="text-gray-400 text-sm">Tens {favorites.length} produtos guardados</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : favorites.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#141414] border border-[#2a2a2a] rounded-3xl p-16 text-center max-w-2xl mx-auto shadow-2xl"
          >
            <div className="w-24 h-24 bg-[#1c1c1c] rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart size={40} className="text-gray-500" />
            </div>
            <h2 className="text-2xl font-black mb-4">{t('favorites.empty') || 'Ainda não tens favoritos'}</h2>
            <p className="text-gray-400 mb-8">{t('favorites.emptyDesc') || 'Navega pelo catálogo e guarda os infoprodutos que mais gostares para acederes mais tarde.'}</p>
            <Link 
              to="/#catalogo" 
              className="inline-flex items-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold px-8 py-4 rounded-xl transition-transform hover:scale-105"
            >
              <ShoppingBag size={20} />
              {t('profile.explore') || 'Explorar Catálogo'}
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
          >
            <AnimatePresence>
              {favorites.map((fav) => (
                <motion.div
                  key={fav.id}
                  variants={{
                    hidden: { opacity: 0, scale: 0.9 },
                    show: { opacity: 1, scale: 1 }
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  layout
                  className="flex justify-center"
                >
                  <ProductCard product={fav.product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}