import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient'; // Ensure this matches your supabase setup
import { getCategoryColor, getCategoryIcon, getCategoryLabel } from '@/lib/categoryColors';
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';

export default function CourseCheckoutPage() {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      setError(null);
      try {
        let query = supabase.from('products').select('*');
        
        if (slug) {
          query = query.eq('slug', slug);
        } else if (id) {
          query = query.eq('id', id);
        }
        
        const { data, error } = await query.single();
        
        if (error) throw error;
        if (!data) throw new Error("Course not found");
        
        setCourse(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('O curso não foi encontrado ou não está mais disponível.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourse();
  }, [slug, id]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-32 h-[60vh]">
          <Loader2 className="w-12 h-12 text-[#f59e0b] animate-spin mb-4" />
          <p className="text-gray-400 font-medium">Carregando detalhes...</p>
        </div>
      );
    }

    if (error || !course) {
      return (
        <div className="flex flex-col items-center justify-center py-32 h-[60vh] text-center px-4">
          <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Ops! Algo deu errado.</h2>
          <p className="text-gray-400 mb-8 max-w-md">{error}</p>
          <Link to="/catalog" className="bg-[#2a2a2a] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#333] transition-colors">
            Voltar ao Catálogo
          </Link>
        </div>
      );
    }

    const catSlug = course.categorySlug || course.category;
    const colors = getCategoryColor(catSlug);
    const icon = getCategoryIcon(catSlug);
    const label = getCategoryLabel(catSlug);
    
    const isFree = course.isFree || course.is_free || course.price === 0;
    const checkoutLink = course.stripeLink || course.stripe_payment_link || course.stripe_url || course.purchase_url;

    const handleActionClick = () => {
      if (isFree) {
        navigate(`/courses/${course.slug || course.id}`);
      } else {
        if (checkoutLink) {
          window.open(checkoutLink, '_blank');
        } else {
          alert('Link de compra indisponível no momento.');
        }
      }
    };

    return (
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8 pt-32">
        <Link to="/catalog" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8 font-medium">
          <ArrowLeft size={16} className="mr-2" /> Voltar ao Catálogo
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-[#141414] border-2 ${colors.border} rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row`}
        >
          {/* Left Side: Image/Icon */}
          <div className="w-full md:w-5/12 bg-[#1c1c1c] relative min-h-[300px]">
            {course.image_url || course.imageUrl ? (
              <img 
                src={course.image_url || course.imageUrl} 
                alt={course.title || course.name}
                className="w-full h-full object-cover absolute inset-0"
              />
            ) : (
              <div className={`w-full h-full flex flex-col items-center justify-center text-8xl absolute inset-0 ${colors.bg}`}>
                {icon}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            
            <div className={`absolute top-4 left-4 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black shadow-lg backdrop-blur-md border ${colors.bg} ${colors.text} ${colors.border}`}>
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          </div>

          {/* Right Side: Details & Checkout */}
          <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
              {course.title || course.name}
            </h1>
            
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              {course.description}
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center text-gray-400">
                <CheckCircle2 className={`w-5 h-5 mr-3 ${colors.text}`} />
                <span>Acesso imediato ao conteúdo</span>
              </div>
              <div className="flex items-center text-gray-400">
                <CheckCircle2 className={`w-5 h-5 mr-3 ${colors.text}`} />
                <span>Suporte garantido pela plataforma</span>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-[#2a2a2a] flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Investimento</p>
                <div className={`text-4xl font-black ${isFree ? 'text-green-500' : 'text-white'}`}>
                  {isFree ? 'Gratuito' : `£${course.price || '0.00'}`}
                </div>
              </div>

              <button
                onClick={handleActionClick}
                className={`w-full sm:w-auto px-8 py-4 rounded-xl text-lg font-black shadow-xl transition-all transform hover:-translate-y-1 ${colors.btnText}`}
              >
                {isFree ? '🎁 Acessar Grátis' : '💳 Comprar Agora ↗'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col font-sans text-white">
      <Header />
      <main className="flex-grow">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}