import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { supabase } from '@/lib/supabase';

export default function MyProducts() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [meusProdutos, setMeusProdutos] = useState([]);
  const [vitrine, setVitrine] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchProducts = async () => {
      let purchasesList = [];
      
      // Fetch purchases
      try {
        const { data: purchases, error: purchasesError } = await supabase
          .from('purchases')
          .select(`
            product_id, 
            products(
              id, name, description, price, is_free, stripeLink, stripe_payment_link, 
              product_translations(language, title, description),
              categories(id, name, color, slug, icon, category_translations(name, language))
            )
          `)
          .eq('user_id', user.id);
        
        if (purchasesError) throw purchasesError;
        purchasesList = purchases || [];
      } catch (error) {
        console.error('Erro ao buscar compras:', error);
      }

      // Fetch free products
      let freeProducts = [];
      try {
        const { data: free, error: freeError } = await supabase
          .from('products')
          .select(`
            id, name, description, price, is_free, stripeLink, stripe_payment_link, 
            product_translations(language, title, description),
            categories(id, name, color, slug, icon, category_translations(name, language))
          `)
          .eq('is_free', true);
        
        if (freeError) throw freeError;
        freeProducts = free || [];
      } catch (error) {
        console.error('Erro ao buscar produtos gratuitos:', error);
      }

      // Fetch paid products not purchased
      try {
        const { data: allPaidProducts, error: paidError } = await supabase
          .from('products')
          .select(`
            id, name, description, price, is_free, stripeLink, stripe_payment_link, 
            product_translations(language, title, description),
            categories(id, name, color, slug, icon, category_translations(name, language))
          `)
          .eq('is_free', false);
        
        if (paidError) throw paidError;
        
        const purchasedProductIds = purchasesList.map(p => p.product_id);
        const vitrineProducts = (allPaidProducts || [])
          .filter(p => !purchasedProductIds.includes(p.id))
          .map(p => ({ ...p, isPurchased: false }));
        
        setVitrine(vitrineProducts);
      } catch (error) {
        console.error('Erro ao buscar vitrine:', error);
        setVitrine([]);
      }

      // Combine purchased and free products for "Meus Produtos"
      const extractedPurchases = purchasesList.map(p => p.products).filter(Boolean);
      const combinedMeusProdutos = [...extractedPurchases, ...freeProducts];
      
      // Deduplicate by ID
      const uniqueMeusProdutos = Array.from(new Map(combinedMeusProdutos.map(item => [item.id, item])).values());
      setMeusProdutos(uniqueMeusProdutos);
    };

    fetchProducts();
  }, [user]);

  if (!user) {
    return (
      <section className="py-20 px-6 bg-[#0a0a0a] border-y border-[#1c1c1c] text-center">
        <h2 className="text-3xl font-black text-white mb-4">{t('profile.myProducts')}</h2>
        <p className="text-gray-400 mb-8">{t('profile.loginRequired')}</p>
        <a href="/login" className="inline-block bg-[#f59e0b] text-black font-bold px-8 py-3 rounded-xl hover:bg-[#d97706] transition-colors">
          {t('auth.loginBtn')}
        </a>
      </section>
    );
  }

  const renderTable = (productsList, isVitrine = false) => {
    if (productsList.length === 0) {
      return (
        <div className="text-center py-16 bg-[#121212] rounded-2xl border border-[#2a2a2a]">
          <p className="text-xl text-gray-400 mb-6">{isVitrine ? 'Nenhuma novidade no momento.' : t('profile.noProducts')}</p>
          {!isVitrine && (
            <a href="#catalogo" className="inline-block bg-[#1c1c1c] border border-white/10 text-white font-bold px-8 py-3 rounded-xl hover:bg-[#2a2a2a] transition-colors">
              {t('profile.explore')}
            </a>
          )}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto rounded-2xl border border-[#2a2a2a] bg-[#121212] shadow-xl">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-[#2a2a2a] bg-[#0a0a0a]">
              <th className="py-5 px-6 font-semibold text-gray-400 text-sm tracking-wider uppercase w-[15%]">Categoria</th>
              <th className="py-5 px-6 font-semibold text-gray-400 text-sm tracking-wider uppercase w-[45%]">Curso/Produto</th>
              <th className="py-5 px-6 font-semibold text-gray-400 text-sm tracking-wider uppercase w-[15%]">Investimento</th>
              <th className="py-5 px-6 font-semibold text-gray-400 text-sm tracking-wider uppercase w-[25%] text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1c1c1c]">
            {productsList.map(p => {
              const title = p.name || (p.product_translations && p.product_translations[0]?.title) || p.product_title || 'Produto sem nome';
              const description = (p.product_translations && p.product_translations[0]?.description) || p.description || '';
              
              const cat = p.categories || {};
              const catColor = cat.color || '#3b82f6';
              const catName = (cat.category_translations && cat.category_translations[0]?.name) || cat.name || cat.slug || 'Outros';
              
              const isFree = p.is_free === true || p.isFree === true || p.price === 0;
              const formattedPrice = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(p.price || 0);
              
              const link = isVitrine 
                ? (p.stripeLink || p.stripe_payment_link || '#') 
                : (p.product_link || `/dashboard?product_id=${p.id}`);

              const buttonActionText = isVitrine || !isFree ? 'Comprar' : 'Acessar';

              return (
                <motion.tr 
                  key={p.id}
                  whileHover={{ backgroundColor: '#1a1a1a' }}
                  className="transition-colors duration-200 group bg-[#121212]"
                  style={{ borderLeft: `4px solid ${catColor}` }}
                >
                  {/* Category */}
                  <td className="py-5 px-6 align-middle">
                    <div 
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: `${catColor}33`, color: catColor }}
                    >
                      {cat.icon && <span className="mr-1.5">{cat.icon}</span>}
                      {catName}
                    </div>
                  </td>
                  
                  {/* Product Info */}
                  <td className="py-5 px-6 align-middle">
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-base mb-1 group-hover:text-gray-200 transition-colors">
                        {title}
                      </span>
                      <span className="text-gray-400 text-sm line-clamp-1 max-w-[400px]">
                        {description}
                      </span>
                    </div>
                  </td>
                  
                  {/* Price */}
                  <td className="py-5 px-6 align-middle">
                    <span className={`font-semibold ${isFree ? 'text-green-500' : 'text-gray-300'}`}>
                      {isFree ? 'Gratuito' : formattedPrice}
                    </span>
                  </td>
                  
                  {/* Actions */}
                  <td className="py-5 px-6 align-middle text-right">
                    <div className="flex items-center justify-end gap-3">
                      <a 
                        href={`/curso/${p.id}`}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white transition-all border border-zinc-700 hover:border-zinc-500"
                      >
                        Ver mais
                      </a>
                      
                      <a 
                        href={link}
                        target={isVitrine && link !== '#' ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                        className="px-5 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 hover:scale-105"
                        style={{ backgroundColor: catColor }}
                      >
                        {isVitrine ? 'Comprar' : 'Acessar'}
                      </a>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <section id="meus-produtos" className="py-20 px-6 max-w-7xl mx-auto w-full">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-white border-l-4 border-[#f59e0b] pl-4">
          {t('profile.myProducts')}
        </h2>
        <p className="text-gray-400 mt-2 pl-5">Acesse todos os materiais e cursos que você já adquiriu.</p>
      </div>

      {renderTable(meusProdutos, false)}

      {vitrine.length > 0 && (
        <div className="mt-20 pt-10 border-t border-[#1c1c1c]">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-white border-l-4 border-[#3b82f6] pl-4">
              Descubra Mais
            </h2>
            <p className="text-gray-400 mt-2 pl-5">Expanda seus conhecimentos com nossos outros produtos premium.</p>
          </div>
          
          {renderTable(vitrine, true)}
        </div>
      )}
    </section>
  );
}