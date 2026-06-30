import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';
import ContentItem from '@/components/ContentItem';
import { getCategoryColor, getCategoryIcon, getCategoryLabel } from '@/lib/categoryColors';
import { toast } from '@/components/ui/use-toast';
import { Share2, ArrowLeft, PlayCircle, FileText, Lock, CheckCircle } from 'lucide-react';

export default function CourseDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCourseData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch course
        const { data: courseData, error: courseError } = await supabase
          .from('products')
          .select('*')
          .or(`slug.eq.${slug},id.eq.${slug}`)
          .single();

        if (courseError || !courseData) throw new Error('Curso não encontrado');
        setCourse(courseData);

        const isFreeCourse = courseData.isFree || courseData.is_free || courseData.price === 0;
        let userHasAccess = isFreeCourse;

        // Check purchase using buyer_email
        if (user && courseData && !isFreeCourse) {
          const { data: purchaseData } = await supabase
            .from('purchases')
            .select('*')
            .eq('buyer_email', user.email)
            .eq('product_id', courseData.id)
            .single();

          if (purchaseData) {
            userHasAccess = true;
          }
        }
        
        setHasAccess(userHasAccess);

        // Load course content (mocking db read with local for now, as DB table might not exist yet)
        const allContent = JSON.parse(localStorage.getItem('course_content') || '[]');
        const courseContent = allContent
          .filter(c => c.course_id === courseData.id)
          .sort((a, b) => a.order_index - b.order_index);
        
        setContent(courseContent);
        
      } catch (err) {
        console.error(err);
        setError('O curso não foi encontrado ou ocorreu um erro.');
        toast({
          title: "Erro ao carregar",
          description: "O curso não foi encontrado ou ocorreu um erro.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
  }, [slug, user]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copiado!",
      description: "O link do curso foi copiado para a área de transferência.",
    });
  };

  const handlePurchase = () => {
    if (!user) {
      toast({
        title: "Acesso restrito",
        description: "Faça login para continuar.",
      });
      navigate('/login');
      return;
    }

    const checkoutLink = course?.stripe_payment_link || course?.stripeLink || course?.stripe_link;
    if (checkoutLink) {
      window.open(checkoutLink, '_blank');
    } else {
      toast({
        title: "Em breve",
        description: "As inscrições abrirão em breve.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f59e0b] mb-4"></div>
        <p className="text-gray-400">Carregando informações do curso...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-bold mb-4">{error || 'Curso não encontrado'}</h2>
        <button onClick={() => navigate('/catalog')} className="bg-[#f59e0b] text-black px-6 py-2 rounded-xl font-bold">
          Voltar ao Catálogo
        </button>
      </div>
    );
  }

  const catSlug = course.categorySlug || course.category;
  const colors = getCategoryColor(catSlug);
  const icon = getCategoryIcon(catSlug);
  const label = getCategoryLabel(catSlug);
  const isFree = course.isFree || course.is_free || course.price === 0;

  const tabs = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'video', label: 'Vídeos' },
    { id: 'audio', label: 'Áudios' },
    { id: 'pdf', label: 'Documentos' },
    { id: 'exercise', label: 'Exercícios' },
    { id: 'link', label: 'Links & Notebooks' }
  ];

  const getFilteredContent = () => {
    if (activeTab === 'overview') return [];
    if (activeTab === 'link') return content.filter(c => c.type === 'link' || c.type === 'notebook');
    return content.filter(c => c.type === activeTab);
  };

  const filteredContent = getFilteredContent();
  const showContentLock = !hasAccess && activeTab !== 'overview' && filteredContent.some(c => !c.is_preview);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white font-sans">
      <Header />
      
      <main className="flex-grow pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Link to="/catalog" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors font-medium">
            <ArrowLeft size={20} className="mr-2" />
            Voltar ao Catálogo
          </Link>
        </motion.div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#141414] border border-[#2a2a2a] rounded-3xl overflow-hidden flex flex-col lg:flex-row shadow-2xl relative mb-12"
        >
          <div className={`absolute top-0 left-0 w-full h-1 ${colors.bg}`} />
          
          <div className="w-full lg:w-1/2 relative aspect-video lg:aspect-auto">
            {course.image_url || course.imageUrl ? (
              <img 
                src={course.image_url || course.imageUrl} 
                alt={course.title || course.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center text-7xl ${colors.bg}`}>
                {icon}
              </div>
            )}
            {hasAccess && (
              <div className="absolute top-4 right-4 bg-green-500 text-black px-4 py-2 rounded-full font-black text-sm shadow-lg flex items-center gap-1">
                <CheckCircle size={16} /> Liberado
              </div>
            )}
          </div>

          <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black mb-6 w-max ${colors.bg} ${colors.text} border ${colors.border}`}>
              <span>{icon}</span>
              <span>{label}</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-black text-white mb-4 leading-tight">
              {course.title || course.name}
            </h1>

            <p className="text-gray-400 text-lg mb-8 leading-relaxed line-clamp-4">
              {course.description}
            </p>

            <div className="mt-auto">
              <div className="flex items-end justify-between mb-8 pb-8 border-b border-[#2a2a2a]">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Investimento</p>
                  <span className={`text-4xl font-black ${isFree ? 'text-green-500' : colors.text}`}>
                    {isFree ? 'Gratuito' : `£${course.price || '0.00'}`}
                  </span>
                </div>
                
                <button onClick={handleShare} className="p-3 bg-[#1c1c1c] hover:bg-[#2a2a2a] rounded-full text-gray-400 transition-colors">
                  <Share2 size={24} />
                </button>
              </div>

              {!hasAccess ? (
                <button
                  onClick={handlePurchase}
                  className={`w-full py-4 rounded-xl text-lg font-black transition-transform hover:scale-[1.02] shadow-xl ${colors.btnText}`}
                >
                  {isFree ? 'Obter Acesso Grátis' : (course.stripe_payment_link || course.stripeLink || course.stripe_link) ? 'Comprar Agora' : 'Em breve'}
                </button>
              ) : (
                <div className="w-full py-4 rounded-xl text-lg font-black bg-green-500/10 text-green-500 border border-green-500/20 text-center flex items-center justify-center gap-2">
                  <CheckCircle size={24} />
                  Você já tem acesso a este curso
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Content Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#141414] border border-[#2a2a2a] rounded-3xl overflow-hidden"
        >
          <div className="flex overflow-x-auto border-b border-[#2a2a2a] hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-bold text-sm whitespace-nowrap transition-colors outline-none ${
                  activeTab === tab.id 
                    ? `text-[#f59e0b] border-b-2 border-[#f59e0b] bg-[#1c1c1c]` 
                    : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8 min-h-[300px]">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' ? (
                <motion.div 
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="prose prose-invert max-w-none text-gray-300"
                >
                  <h3 className="text-2xl font-bold text-white mb-4">Sobre o Curso</h3>
                  <p className="whitespace-pre-wrap">{course.description}</p>
                  {catSlug === 'importacao-hubukbox' && (
                    <div className="mt-8 p-6 bg-blue-600/10 border border-blue-600/30 rounded-xl">
                      <h4 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
                        📦 Parceria HubUKBox
                      </h4>
                      <p className="text-gray-300 text-sm mb-4">
                        Este conteúdo é integrado com a HubUKBox. Para começar a importar com as melhores taxas, acesse a plataforma.
                      </p>
                      <a href="https://hubukbox.com" target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                        Acessar HubUKBox
                      </a>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="content-list"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {filteredContent.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText size={48} className="mx-auto text-gray-600 mb-4" />
                      <h4 className="text-xl font-bold text-white mb-2">Nenhum conteúdo encontrado</h4>
                      <p className="text-gray-400">Não há materiais nesta seção ainda.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {filteredContent.map(item => {
                        if (!hasAccess && !item.is_preview) return null;
                        return <ContentItem key={item.id} item={item} />;
                      })}

                      {showContentLock && (
                        <div className="text-center py-16 bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] relative overflow-hidden mt-6">
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0a] opacity-50"></div>
                          <Lock size={48} className="mx-auto text-gray-500 mb-4 relative z-10" />
                          <h4 className="text-2xl font-bold text-white mb-2 relative z-10">Conteúdo Exclusivo</h4>
                          <p className="text-gray-400 max-w-md mx-auto mb-6 relative z-10">
                            Este material é reservado apenas para alunos matriculados. Adquira o curso para desbloquear tudo.
                          </p>
                          <button onClick={handlePurchase} className={`relative z-10 font-bold py-3 px-8 rounded-xl transition-transform hover:scale-105 ${colors.btnText}`}>
                            Desbloquear Acesso
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

      </main>
      <Footer />
    </div>
  );
}