import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';
import { BookOpen, FileText, Users, CreditCard, BarChart } from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCatalogClick = () => {
    navigate('/admin/catalog');
  };

  const handleContentClick = () => {
    navigate('/admin/course-content');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="inline-block bg-[#f59e0b]/10 text-[#f59e0b] px-4 py-1.5 rounded-full text-sm font-black mb-4 border border-[#f59e0b]/20">
            👑 Área Restrita
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-2 text-white">
            Painel Administrativo
          </h1>
          <p className="text-gray-400 text-lg">
            Bem-vindo, <span className="text-white font-medium">{user?.email || 'Administrador'}</span>.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Clickable Button */}
          <motion.button
            onClick={handleCatalogClick}
            whileHover={{ scale: 1.02 }}
            className="bg-[#141414] border border-[#2a2a2a] p-8 rounded-2xl hover:border-[#f59e0b] transition-colors group relative overflow-hidden h-full text-left outline-none"
          >
            <div className="flex flex-col h-full">
              <div className="p-4 rounded-xl w-fit mb-6 bg-[#f59e0b]/10 text-[#f59e0b] transition-transform group-hover:scale-110">
                <BookOpen size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#f59e0b] transition-colors">Catálogo Principal</h3>
                <p className="text-gray-400">Adicionar, editar e remover produtos ou cursos do sistema.</p>
              </div>
            </div>
          </motion.button>

          {/* Card 2: Clickable Button */}
          <motion.button
            onClick={handleContentClick}
            whileHover={{ scale: 1.02 }}
            className="bg-[#141414] border border-[#2a2a2a] p-8 rounded-2xl hover:border-[#f59e0b] transition-colors group relative overflow-hidden h-full text-left outline-none"
          >
            <div className="flex flex-col h-full">
              <div className="p-4 rounded-xl w-fit mb-6 bg-indigo-500/10 text-indigo-500 transition-transform group-hover:scale-110">
                <FileText size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">Gerenciar Conteúdo</h3>
                <p className="text-gray-400">Adicionar PDFs, Vídeos, e links aos cursos existentes.</p>
              </div>
            </div>
          </motion.button>

          {/* Card 3: Static Div */}
          <div className="bg-[#141414] border border-[#2a2a2a] p-8 rounded-2xl relative overflow-hidden h-full">
            <div className="flex flex-col h-full opacity-60 grayscale">
              <div className="p-4 rounded-xl w-fit mb-6 bg-blue-500/10 text-blue-500">
                <Users size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Usuários</h3>
                <p className="text-gray-400">Visualizar, editar e banir usuários da plataforma. (Em breve)</p>
              </div>
            </div>
          </div>

          {/* Card 4: Static Div */}
          <div className="bg-[#141414] border border-[#2a2a2a] p-8 rounded-2xl relative overflow-hidden h-full">
            <div className="flex flex-col h-full opacity-60 grayscale">
              <div className="p-4 rounded-xl w-fit mb-6 bg-emerald-500/10 text-emerald-500">
                <CreditCard size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Pagamentos</h3>
                <p className="text-gray-400">Relatórios financeiros e gerenciamento de transações. (Em breve)</p>
              </div>
            </div>
          </div>

          {/* Card 5: Static Div */}
          <div className="bg-[#141414] border border-[#2a2a2a] p-8 rounded-2xl relative overflow-hidden h-full">
            <div className="flex flex-col h-full opacity-60 grayscale">
              <div className="p-4 rounded-xl w-fit mb-6 bg-purple-500/10 text-purple-500">
                <BarChart size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Analytics</h3>
                <p className="text-gray-400">Acessar dados detalhados de engajamento. (Em breve)</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}