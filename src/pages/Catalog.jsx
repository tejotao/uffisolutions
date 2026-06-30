
import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';
import CategoryFilter from '@/components/catalog/CategoryFilter';
import CourseCard from '@/components/catalog/CourseCard';
import { fetchAllProducts, fetchAllCategories } from '@/lib/catalogQueries';
import { Search, AlertCircle, Loader2, X } from 'lucide-react';

export default function Catalog() {
  const { language, t, translateCategory } = useLanguage();
  const { user } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Filters
  const [languageFilter, setLanguageFilter] = useState('TODOS');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchasedSet, setPurchasedSet] = useState(new Set());

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [prods, cats] = await Promise.all([
          fetchAllProducts(language),
          fetchAllCategories(language)
        ]);
        setProducts(prods || []);
        
        const translatedCats = (cats || []).map(c => ({
          ...c,
          name: translateCategory(c.slug)
        }));
        setCategories(translatedCats);

        if (user) {
          const { data, error: purchaseErr } = await supabase
            .from('purchases')
            .select('product_id')
            .eq('user_id', user.id);
          
          if (!purchaseErr && data) {
            setPurchasedSet(new Set(data.map(p => p.product_id)));
          }
        }
      } catch (err) {
        console.error('Catalog load error:', err);
        setError(t('text.error') || 'Erro ao carregar catálogo');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user, language, t]);

  const filteredProducts = products.filter(p => {
    // Category Filter
    const matchCat = !categoryFilter || 
                     categoryFilter.toLowerCase() === 'all' || 
                     (p.category?.slug && p.category.slug.toLowerCase() === categoryFilter.toLowerCase());
    
    // Language Filter
    const prodLang = (p.language || 'pt').toLowerCase();
    const filterLang = languageFilter.toLowerCase();
    const matchLang = languageFilter === 'TODOS' || 
                      (filterLang === 'pt-br' && (prodLang === 'pt' || prodLang === 'pt-br')) ||
                      (prodLang === filterLang);

    // Search Filter
    const name = (p.title || p.name || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();
    const matchSearch = !searchQuery || 
                        name.includes(searchQuery.toLowerCase()) || 
                        desc.includes(searchQuery.toLowerCase());
                        
    return matchCat && matchLang && matchSearch;
  });

  const clearFilters = () => {
    setLanguageFilter('TODOS');
    setCategoryFilter(null);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col">
      <Header 
        languageFilter={languageFilter} 
        onLanguageFilterChange={setLanguageFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <main className="flex-1 pt-24 px-4 max-w-7xl mx-auto w-full pb-12">
        <div className="mb-8 mt-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {t('nav.catalog') || 'Catálogo de Produtos'}
          </h1>
          <p className="text-slate-400 text-lg">
            {t('catalog.subtitle') || 'Explore nossos cursos e materiais'}
          </p>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex-1">
            <CategoryFilter 
              categories={categories}
              selectedCategory={categoryFilter}
              onSelectCategory={setCategoryFilter}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {(languageFilter !== 'TODOS' || categoryFilter || searchQuery) && (
              <button 
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <X size={14} /> Limpar Filtros
              </button>
            )}
            <div className="text-sm text-slate-400 px-2 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700">
              {filteredProducts.length} resultados
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-center text-red-400 flex flex-col items-center justify-center gap-3 mb-8">
            <AlertCircle className="w-8 h-8" />
            <p className="text-lg font-medium">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors font-semibold"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {!error && (
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                <p className="text-lg font-medium">{t('text.loading') || 'Carregando...'}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 bg-slate-800/30 rounded-2xl border border-slate-700/30">
                <Search className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-xl font-medium">{t('text.noProducts') || 'Nenhum produto encontrado'}</p>
                <button 
                  onClick={clearFilters}
                  className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-semibold"
                >
                  Limpar Filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <CourseCard 
                    key={product.id} 
                    product={product} 
                    isPurchased={purchasedSet.has(product.id)} 
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
