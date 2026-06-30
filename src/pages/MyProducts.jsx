import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Lock, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPurchases } from '@/lib/purchaseQueries';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';
import CourseCard from '@/components/catalog/CourseCard';
import { useToast } from '@/components/ui/use-toast';

export default function MyProducts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!user) return;
      try {
        setLoading(true);
        // We use getUserPurchases which hits the products table
        const data = await getUserPurchases(user.email);
        
        // Mocking for frontend environment if data is empty (Supabase unconnected)
        if (!data || data.length === 0) {
          const mock = JSON.parse(localStorage.getItem('mock_courses') || '[]');
          if (mock.length > 0) {
            setPurchases([{ product: mock[0], id: 'mock-1', created_at: new Date().toISOString() }]);
          } else {
            setPurchases([]);
          }
        } else {
          setPurchases(data);
        }
      } catch (err) {
        console.error('Error fetching purchases:', err);
        toast({
          title: "Erro ao carregar",
          description: "Não foi possível carregar os seus produtos.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [user, toast]);

  const handleAccess = (course) => {
    toast({
      title: "Acessar Curso",
      description: `Acessando: ${course.title}. Funcionalidade de player em breve!`,
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col pt-24">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-3">
            <Package className="text-[#f59e0b]" size={32} />
            Meus Produtos
          </h1>
          <p className="text-gray-400 mt-2 text-sm sm:text-base">
            Aqui estão os cursos e materiais que você adquiriu.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#f59e0b]"></div>
          </div>
        ) : purchases.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#141414] border border-[#2a2a2a] rounded-3xl p-12 sm:p-16 text-center shadow-xl"
          >
            <Lock size={48} className="text-gray-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Nenhum produto encontrado</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Você ainda não possui nenhum infoproduto ou curso. Explore o nosso catálogo e comece a sua jornada de aprendizado.
            </p>
            <a 
              href="/#catalogo"
              className="inline-flex items-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold px-8 py-3 rounded-xl transition-colors"
            >
              Explorar Catálogo <ExternalLink size={18} />
            </a>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
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
              {purchases.map((purchase) => (
                <motion.div
                  key={purchase.id}
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    show: { opacity: 1, scale: 1 }
                  }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <CourseCard 
                    course={purchase.product} 
                    onViewDetails={() => handleAccess(purchase.product)}
                  />
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