import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';
import CourseCard from '@/components/catalog/CourseCard';

export default function DashboardPage() {
  const { user } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError('');

        // Step 1: Clean direct query to get only free products
        let { data: freeProducts, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('is_free', true);

        // Fallback to empty array if supabase fails or is unavailable
        if (productsError) {
          console.warn('Supabase query error:', productsError);
          freeProducts = [];
        }

        if (!freeProducts || freeProducts.length === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }

        // Step 2: Enrich with translations and categories using Promise.all
        const enrichedProducts = await Promise.all(
          freeProducts.map(async (product) => {
            let enriched = { ...product };

            // Fetch translations
            try {
              const { data: translations } = await supabase
                .from('product_translations')
                .select('*')
                .eq('product_id', product.id);
              enriched.product_translations = translations || [];
            } catch (tError) {
              console.warn(`Failed to fetch translations for product ${product.id}`, tError);
              enriched.product_translations = [];
            }

            // Fetch categories
            try {
              if (product.category_id) {
                const { data: categoryData } = await supabase
                  .from('categories')
                  .select('id, slug')
                  .eq('id', product.category_id)
                  .single();
                enriched.category = categoryData || null;
              }
            } catch (cError) {
              console.warn(`Failed to fetch category for product ${product.id}`, cError);
              enriched.category = null;
            }

            return enriched;
          })
        );

        setProducts(enrichedProducts);

      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Ocorreu um erro ao carregar os cursos. Tente novamente mais tarde.');
        
        // Fallback mock data in case of complete failure
        const mockProducts = JSON.parse(localStorage.getItem('mock_free_products') || '[]');
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id]);

  const displayName = user?.email?.split('@')[0] || 'Usuário';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 px-4 max-w-7xl mx-auto pb-12 w-full">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            📚 Meus Cursos
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Bem-vindo, {displayName}! Aqui estão seus cursos gratuitos disponíveis.
          </p>

          {error && products.length === 0 && (
            <div className="p-4 mb-8 bg-red-500/20 border border-red-500 text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#f59e0b]"></div>
            </div>
          ) : (
            <>
              {products.length === 0 ? (
                <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-10 text-center shadow-lg">
                  <div className="text-6xl mb-4">👀</div>
                  <h3 className="text-xl font-bold text-gray-200 mb-2">Nenhum curso gratuito disponível no momento</h3>
                  <p className="text-gray-500 text-sm max-w-md mx-auto">
                    Estamos preparando novos conteúdos exclusivos para você. Volte novamente em breve!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <CourseCard 
                      key={product.id || Math.random().toString()}
                      product={product}
                      isPurchased={true}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}