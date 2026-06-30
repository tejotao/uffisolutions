import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/contexts/I18nContext';

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, description, price, stripeLink, stripe_payment_link, image_url, product_translations(language, title, description)')
          .eq('slug', slug)
          .eq('is_free', false)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!data) {
          setErrorMsg("Produto não encontrado");
          setProduct(null);
        } else {
          setProduct(data);
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        setErrorMsg("Erro ao carregar produto");
      } finally {
        setLoading(false);
      }
    };
    
    if (slug) fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col text-white">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f59e0b]"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (errorMsg || !product) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col text-white">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center px-4 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-bold mb-4">{errorMsg || "Produto não encontrado"}</h2>
          <button onClick={() => navigate('/#catalogo')} className="text-[#f59e0b] font-medium hover:underline flex items-center gap-2">
            <ArrowLeft size={16} /> Voltar ao Catálogo
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const normLang = lang === 'pt-br' ? 'pt-BR' : (lang || 'pt-BR');
  const translation = product.product_translations?.find(t => t.language === normLang) || product.product_translations?.[0];
  
  const displayTitle = translation?.title || product.name || 'Produto sem nome';
  const displayDesc = translation?.description || product.description || 'Sem descrição';
  const stripeUrl = product.stripeLink || product.stripe_payment_link || '#';

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white font-sans">
      <Header />
      
      <main className="flex-grow pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <button 
          onClick={() => navigate('/#catalogo')} 
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 font-medium"
        >
          <ArrowLeft size={20} /> Voltar
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"
        >
          {/* Image Side */}
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-3xl overflow-hidden shadow-2xl relative aspect-square lg:aspect-auto lg:h-[500px] flex items-center justify-center group">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={displayTitle} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="text-8xl opacity-50 group-hover:scale-110 transition-transform duration-700">
                📦
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          </div>

          {/* Content Side */}
          <div className="flex flex-col h-full">
            <div className="mb-6">
              <h1 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
                {displayTitle}
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed mb-8 whitespace-pre-wrap">
                {displayDesc}
              </p>
            </div>

            <div className="mt-auto bg-[#141414] p-6 rounded-2xl border border-[#2a2a2a]">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wider block mb-1">Investimento</span>
                  <span className="text-4xl font-black text-[#f59e0b]">
                    £{product.price}
                  </span>
                </div>
              </div>

              <a
                href={stripeUrl}
                target={stripeUrl !== '#' ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="w-full py-4 px-8 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-xl text-white bg-gradient-to-r from-[#f59e0b] to-[#ef4444]"
              >
                <ExternalLink size={24} />
                Comprar Agora
              </a>

              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500 font-medium">
                <ShieldCheck size={16} className="text-green-500" /> Pagamento seguro via Stripe
              </div>
            </div>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}