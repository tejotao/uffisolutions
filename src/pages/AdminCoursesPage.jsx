import React, { useState, useEffect } from 'react';
import { Plus, Layout, BookOpen, Video, FileText, File, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';
import { toast } from '@/components/ui/use-toast';
import { getCategoryLabel, getCategoryIcon } from '@/lib/categoryColors';

const LANGUAGES = [
  { id: 'pt', label: '🇵🇹 PT' },
  { id: 'en', label: '🇬🇧 EN' },
  { id: 'es', label: '🇪🇸 ES' },
  { id: 'it', label: '🇮🇹 IT' }
];

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [newModule, setNewModule] = useState({ title: '', description: '' });

  const [lessons, setLessons] = useState([]);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: '', description: '', content_type: 'video', content_url: '', content_text: '', duration_minutes: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadModules(selectedCourse.id);
      setSelectedModule(null);
      setLessons([]);
      setShowModuleForm(false);
      setShowLessonForm(false);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedModule) {
      loadLessons(selectedModule.id);
      setShowLessonForm(false);
    }
  }, [selectedModule]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({ title: 'Erro', description: 'Não foi possível carregar os cursos.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadModules = (courseId) => {
    const allModules = JSON.parse(localStorage.getItem('course_modules') || '[]');
    const courseModules = allModules.filter(m => m.product_id === courseId).sort((a, b) => a.order_index - b.order_index);
    setModules(courseModules);
  };

  const loadLessons = (moduleId) => {
    const allLessons = JSON.parse(localStorage.getItem('course_lessons') || '[]');
    const moduleLessons = allLessons.filter(l => l.module_id === moduleId).sort((a, b) => a.order_index - b.order_index);
    setLessons(moduleLessons);
  };

  const handleAddModule = (e) => {
    e.preventDefault();
    if (!newModule.title) return;
    
    const allModules = JSON.parse(localStorage.getItem('course_modules') || '[]');
    const module = {
      id: crypto.randomUUID(),
      product_id: selectedCourse.id,
      title: newModule.title,
      description: newModule.description,
      order_index: modules.length,
      created_at: new Date().toISOString()
    };
    
    localStorage.setItem('course_modules', JSON.stringify([...allModules, module]));
    setNewModule({ title: '', description: '' });
    setShowModuleForm(false);
    loadModules(selectedCourse.id);
    toast({ title: 'Sucesso', description: 'Módulo adicionado.' });
  };

  const handleAddLesson = (e) => {
    e.preventDefault();
    if (!newLesson.title) return;
    
    const allLessons = JSON.parse(localStorage.getItem('course_lessons') || '[]');
    const lesson = {
      id: crypto.randomUUID(),
      module_id: selectedModule.id,
      ...newLesson,
      order_index: lessons.length,
      created_at: new Date().toISOString()
    };
    
    localStorage.setItem('course_lessons', JSON.stringify([...allLessons, lesson]));
    setNewLesson({ title: '', description: '', content_type: 'video', content_url: '', content_text: '', duration_minutes: 0 });
    setShowLessonForm(false);
    loadLessons(selectedModule.id);
    toast({ title: 'Sucesso', description: 'Aula adicionada.' });
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Video size={14} />;
      case 'pdf': return <File size={14} />;
      case 'text': return <FileText size={14} />;
      case 'embed': return <LinkIcon size={14} />;
      default: return <File size={14} />;
    }
  };

  const getLanguageLabel = (lang) => {
    const found = LANGUAGES.find(l => l.id === lang);
    return found ? found.label : lang || 'N/A';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">📚 Gerenciar Cursos</h1>
          <p className="text-gray-400">Adicione módulos, aulas e conteúdos aos seus cursos.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f59e0b]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[70vh] min-h-[600px]">
            {/* Courses Column */}
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl flex flex-col overflow-hidden">
              <div className="p-4 border-b border-[#2a2a2a] bg-[#1c1c1c]">
                <h2 className="font-bold flex items-center gap-2"><BookOpen size={18} /> Cursos</h2>
              </div>
              <div className="overflow-y-auto flex-grow p-3 space-y-2">
                {courses.map(course => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourse(course)}
                    className={`w-full text-left p-3 rounded-xl transition-colors border ${
                      selectedCourse?.id === course.id 
                        ? 'bg-[#2a2a2a] border-[#f59e0b] text-white' 
                        : 'bg-[#1c1c1c] border-transparent text-gray-300 hover:bg-[#222]'
                    }`}
                  >
                    <div className={`font-bold text-sm line-clamp-1 ${selectedCourse?.id === course.id ? 'text-white' : 'text-gray-300'}`}>
                      {course.title || course.name}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1 uppercase flex gap-2 items-center">
                      <span>{getLanguageLabel(course.language)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        {getCategoryIcon(course.category)} {getCategoryLabel(course.category)}
                      </span>
                    </div>
                  </button>
                ))}
                {courses.length === 0 && <p className="text-sm text-gray-500 text-center p-4">Nenhum curso encontrado.</p>}
              </div>
              <div className="p-3 border-t border-[#333] bg-[#1c1c1c] text-xs text-center text-gray-500 font-bold uppercase tracking-wider">
                Total de {courses.length} cursos
              </div>
            </div>

            {/* Modules Column */}
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl flex flex-col overflow-hidden">
              <div className="p-4 border-b border-[#2a2a2a] bg-[#1c1c1c] flex justify-between items-center">
                <h2 className="font-bold flex items-center gap-2"><Layout size={18} /> Módulos</h2>
                {selectedCourse && (
                  <button 
                    onClick={() => setShowModuleForm(!showModuleForm)}
                    className="p-1.5 bg-[#2a2a2a] hover:bg-[#333] rounded-lg text-white transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>
              <div className="overflow-y-auto flex-grow p-3 space-y-2">
                {!selectedCourse ? (
                  <p className="text-sm text-gray-500 text-center p-4">Selecione um curso primeiro.</p>
                ) : (
                  <>
                    {showModuleForm && (
                      <form onSubmit={handleAddModule} className="bg-[#1c1c1c] p-4 rounded-xl border border-[#2a2a2a] mb-4">
                        <input
                          type="text"
                          placeholder="Título do Módulo"
                          value={newModule.title}
                          onChange={e => setNewModule({...newModule, title: e.target.value})}
                          className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white mb-3 outline-none focus:border-[#f59e0b]"
                          required
                        />
                        <textarea
                          placeholder="Descrição (opcional)"
                          value={newModule.description}
                          onChange={e => setNewModule({...newModule, description: e.target.value})}
                          className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white mb-3 outline-none focus:border-[#f59e0b]"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button type="submit" className="flex-1 bg-[#f59e0b] text-black text-sm font-bold py-2 rounded-lg">Salvar</button>
                          <button type="button" onClick={() => setShowModuleForm(false)} className="flex-1 bg-[#333] text-white text-sm font-bold py-2 rounded-lg">Cancelar</button>
                        </div>
                      </form>
                    )}
                    
                    {modules.map(module => (
                      <button
                        key={module.id}
                        onClick={() => setSelectedModule(module)}
                        className={`w-full text-left p-3 rounded-xl transition-colors border ${
                          selectedModule?.id === module.id 
                            ? 'bg-[#2a2a2a] border-[#f59e0b] text-white' 
                            : 'bg-[#1c1c1c] border-transparent text-gray-300 hover:bg-[#222]'
                        }`}
                      >
                        <div className="font-bold text-sm mb-1">{module.title}</div>
                        {module.description && <div className="text-xs text-gray-500 line-clamp-1">{module.description}</div>}
                      </button>
                    ))}
                    {modules.length === 0 && !showModuleForm && <p className="text-sm text-gray-500 text-center p-4">Nenhum módulo cadastrado.</p>}
                  </>
                )}
              </div>
            </div>

            {/* Lessons Column */}
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl flex flex-col overflow-hidden">
              <div className="p-4 border-b border-[#2a2a2a] bg-[#1c1c1c] flex justify-between items-center">
                <h2 className="font-bold flex items-center gap-2"><Video size={18} /> Aulas</h2>
                {selectedModule && (
                  <button 
                    onClick={() => setShowLessonForm(!showLessonForm)}
                    className="p-1.5 bg-[#2a2a2a] hover:bg-[#333] rounded-lg text-white transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>
              <div className="overflow-y-auto flex-grow p-3 space-y-2">
                {!selectedModule ? (
                  <p className="text-sm text-gray-500 text-center p-4">Selecione um módulo primeiro.</p>
                ) : (
                  <>
                    {showLessonForm && (
                      <form onSubmit={handleAddLesson} className="bg-[#1c1c1c] p-4 rounded-xl border border-[#2a2a2a] mb-4 space-y-3">
                        <input
                          type="text"
                          placeholder="Título da Aula"
                          value={newLesson.title}
                          onChange={e => setNewLesson({...newLesson, title: e.target.value})}
                          className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#f59e0b]"
                          required
                        />
                        <select
                          value={newLesson.content_type}
                          onChange={e => setNewLesson({...newLesson, content_type: e.target.value})}
                          className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#f59e0b]"
                        >
                          <option value="video">Vídeo</option>
                          <option value="pdf">PDF</option>
                          <option value="text">Texto</option>
                          <option value="embed">Embed</option>
                        </select>
                        
                        {newLesson.content_type === 'text' ? (
                          <textarea
                            placeholder="Conteúdo em Texto/HTML"
                            value={newLesson.content_text}
                            onChange={e => setNewLesson({...newLesson, content_text: e.target.value})}
                            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#f59e0b]"
                            rows={4}
                          />
                        ) : (
                          <input
                            type="text"
                            placeholder="URL do Conteúdo"
                            value={newLesson.content_url}
                            onChange={e => setNewLesson({...newLesson, content_url: e.target.value})}
                            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#f59e0b]"
                          />
                        )}
                        
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-400">Duração (min):</label>
                          <input
                            type="number"
                            min="0"
                            value={newLesson.duration_minutes}
                            onChange={e => setNewLesson({...newLesson, duration_minutes: parseInt(e.target.value) || 0})}
                            className="w-20 bg-[#0a0a0a] border border-[#333] rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-[#f59e0b]"
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button type="submit" className="flex-1 bg-[#f59e0b] text-black text-sm font-bold py-2 rounded-lg">Salvar</button>
                          <button type="button" onClick={() => setShowLessonForm(false)} className="flex-1 bg-[#333] text-white text-sm font-bold py-2 rounded-lg">Cancelar</button>
                        </div>
                      </form>
                    )}
                    
                    {lessons.map(lesson => (
                      <div key={lesson.id} className="bg-[#1c1c1c] p-3 rounded-xl border border-[#2a2a2a]">
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-bold text-sm text-white">{lesson.title}</div>
                          <div className="bg-[#2a2a2a] text-gray-300 p-1 rounded text-xs">
                            {getContentTypeIcon(lesson.content_type)}
                          </div>
                        </div>
                        {lesson.duration_minutes > 0 && (
                          <div className="text-xs text-gray-500">{lesson.duration_minutes} min</div>
                        )}
                      </div>
                    ))}
                    {lessons.length === 0 && !showLessonForm && <p className="text-sm text-gray-500 text-center p-4">Nenhuma aula cadastrada.</p>}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}