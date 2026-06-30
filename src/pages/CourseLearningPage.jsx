import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';
import { ChevronLeft, ChevronRight, CheckCircle, Circle, PlayCircle, FileText, File, Link as LinkIcon, Menu, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function CourseLearningPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState([]);
  
  const [activeLesson, setActiveLesson] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadCourseData();
  }, [slug, user]);

  const loadCourseData = async () => {
    setLoading(true);
    try {
      // 1. Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from('products')
        .select('*')
        .or(`slug.eq.${slug},id.eq.${slug}`)
        .single();
      
      if (courseError || !courseData) throw new Error('Curso não encontrado');
      setCourse(courseData);

      // 2. Load modules from localStorage (Supabase integration pending)
      const allModules = JSON.parse(localStorage.getItem('course_modules') || '[]');
      const courseModules = allModules.filter(m => m.product_id === courseData.id).sort((a, b) => a.order_index - b.order_index);
      setModules(courseModules);

      // 3. Load lessons from localStorage
      const allLessons = JSON.parse(localStorage.getItem('course_lessons') || '[]');
      const courseLessons = allLessons.filter(l => courseModules.some(m => m.id === l.module_id)).sort((a, b) => a.order_index - b.order_index);
      setLessons(courseLessons);

      // 4. Load progress from localStorage
      const allProgress = JSON.parse(localStorage.getItem('user_progress') || '[]');
      const userProgress = allProgress.filter(p => p.user_id === user.id);
      setProgress(userProgress);

      // Set initial active lesson
      if (courseLessons.length > 0) {
        // Find first incomplete lesson
        const firstIncomplete = courseLessons.find(l => !userProgress.some(p => p.lesson_id === l.id && p.completed));
        setActiveLesson(firstIncomplete || courseLessons[0]);
      }

    } catch (err) {
      console.error(err);
      toast({ title: 'Erro', description: 'Não foi possível carregar o curso.', variant: 'destructive' });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const toggleLessonCompletion = () => {
    if (!activeLesson || !user) return;
    
    const allProgress = JSON.parse(localStorage.getItem('user_progress') || '[]');
    const existingIndex = allProgress.findIndex(p => p.user_id === user.id && p.lesson_id === activeLesson.id);
    
    let isCompleted = true;
    if (existingIndex >= 0) {
      isCompleted = !allProgress[existingIndex].completed;
      allProgress[existingIndex].completed = isCompleted;
      allProgress[existingIndex].updated_at = new Date().toISOString();
    } else {
      allProgress.push({
        id: crypto.randomUUID(),
        user_id: user.id,
        lesson_id: activeLesson.id,
        completed: true,
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });
    }

    localStorage.setItem('user_progress', JSON.stringify(allProgress));
    setProgress(allProgress.filter(p => p.user_id === user.id));
    
    toast({
      title: isCompleted ? "Aula concluída! 🎉" : "Status removido",
      description: isCompleted ? "Progresso salvo com sucesso." : "A aula foi marcada como não concluída."
    });
  };

  const isLessonCompleted = (lessonId) => {
    return progress.some(p => p.lesson_id === lessonId && p.completed);
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'video': return <PlayCircle size={16} />;
      case 'pdf': return <File size={16} />;
      case 'text': return <FileText size={16} />;
      case 'embed': return <LinkIcon size={16} />;
      default: return <File size={16} />;
    }
  };

  const renderContent = () => {
    if (!activeLesson) return null;

    if (!activeLesson.content_url && !activeLesson.content_text) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-[#141414] rounded-2xl border border-[#2a2a2a] mt-6">
          <FileText size={48} className="text-gray-500 mb-4" />
          <p className="text-gray-400 font-medium text-lg">Conteúdo em breve...</p>
        </div>
      );
    }

    switch (activeLesson.content_type) {
      case 'video':
      case 'pdf':
      case 'embed':
        return (
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-[#2a2a2a] mt-6 shadow-2xl">
            <iframe 
              src={activeLesson.content_url} 
              className="absolute top-0 left-0 w-full h-full"
              allowFullScreen
              title={activeLesson.title}
            ></iframe>
          </div>
        );
      case 'text':
        return (
          <div 
            className="prose prose-invert max-w-none mt-6 bg-[#141414] p-8 rounded-2xl border border-[#2a2a2a]"
            dangerouslySetInnerHTML={{ __html: activeLesson.content_text }}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f59e0b]"></div>
      </div>
    );
  }

  const completedLessonsCount = lessons.filter(l => isLessonCompleted(l.id)).length;
  const progressPercentage = lessons.length > 0 ? Math.round((completedLessonsCount / lessons.length) * 100) : 0;
  const isCurrentLessonCompleted = activeLesson ? isLessonCompleted(activeLesson.id) : false;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans overflow-hidden">
      <Header />
      
      <main className="flex-grow pt-20 sm:pt-24 flex h-screen">
        
        {/* Mobile Toggle Button */}
        {isMobile && (
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="fixed bottom-6 right-6 z-50 bg-[#f59e0b] text-black p-4 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.4)]"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}

        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || !isMobile) && (
            <motion.div
              initial={{ x: -350, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -350, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`w-full lg:w-[350px] bg-[#141414] border-r border-[#2a2a2a] flex flex-col z-40 ${isMobile ? 'fixed inset-y-0 left-0 pt-24 pb-20' : ''} h-full`}
            >
              <div className="p-6 border-b border-[#2a2a2a]">
                <h2 className="text-xl font-black mb-4 line-clamp-2">{course?.title || course?.name}</h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progresso</span>
                    <span className="font-bold text-[#f59e0b]">{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-[#2a2a2a] h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#f59e0b] h-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 text-right">
                    {completedLessonsCount} de {lessons.length} aulas
                  </div>
                </div>
              </div>

              <div className="overflow-y-auto flex-grow pb-10">
                {modules.map((module, mIdx) => {
                  const moduleLessons = lessons.filter(l => l.module_id === module.id);
                  return (
                    <div key={module.id} className="border-b border-[#2a2a2a]/50">
                      <div className="px-6 py-4 bg-[#1a1a1a]">
                        <h3 className="font-bold text-sm text-gray-300">
                          Módulo {mIdx + 1}: {module.title}
                        </h3>
                      </div>
                      <div className="flex flex-col">
                        {moduleLessons.map((lesson, lIdx) => {
                          const isActive = activeLesson?.id === lesson.id;
                          const isCompleted = isLessonCompleted(lesson.id);
                          return (
                            <button
                              key={lesson.id}
                              onClick={() => {
                                setActiveLesson(lesson);
                                if (isMobile) setSidebarOpen(false);
                              }}
                              className={`px-6 py-4 flex items-start gap-3 transition-colors text-left ${
                                isActive ? 'bg-[#f59e0b]/10 border-l-4 border-[#f59e0b]' : 'hover:bg-[#1c1c1c] border-l-4 border-transparent'
                              }`}
                            >
                              <div className={`mt-0.5 ${isCompleted ? 'text-green-500' : 'text-gray-500'}`}>
                                {isCompleted ? <CheckCircle size={18} /> : <Circle size={18} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className={`font-medium text-sm line-clamp-2 ${isActive ? 'text-[#f59e0b]' : 'text-gray-300'}`}>
                                  {lIdx + 1}. {lesson.title}
                                </div>
                                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    {getContentTypeIcon(lesson.content_type)}
                                    <span className="capitalize">{lesson.content_type}</span>
                                  </span>
                                  {lesson.duration_minutes > 0 && (
                                    <span>{lesson.duration_minutes} min</span>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                        {moduleLessons.length === 0 && (
                          <div className="px-6 py-4 text-xs text-gray-500 italic">Em breve...</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col overflow-y-auto bg-[#0a0a0a] ${isMobile ? 'w-full' : ''}`}>
          {activeLesson ? (
            <div className="max-w-5xl mx-auto w-full p-4 sm:p-8 pb-32">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-tight">
                    {activeLesson.title}
                  </h1>
                  {activeLesson.description && (
                    <p className="text-gray-400 text-sm sm:text-base">{activeLesson.description}</p>
                  )}
                </div>
                <button
                  onClick={toggleLessonCompletion}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                    isCurrentLessonCompleted 
                      ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20' 
                      : 'bg-[#f59e0b] text-black hover:bg-[#d97706] shadow-lg'
                  }`}
                >
                  <CheckCircle size={18} />
                  {isCurrentLessonCompleted ? 'Concluída' : 'Marcar como Concluída'}
                </button>
              </div>

              {renderContent()}

              <div className="mt-12 flex justify-between">
                <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <ChevronLeft size={20} /> Aula Anterior
                </button>
                <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  Próxima Aula <ChevronRight size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <span className="text-6xl mb-6 grayscale opacity-20">📚</span>
              <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo ao Curso</h2>
              <p className="text-gray-400 max-w-md">Selecione uma aula no menu lateral para começar seu aprendizado.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}