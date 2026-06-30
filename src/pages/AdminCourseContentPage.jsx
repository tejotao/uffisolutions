import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, BookOpen, Lock, Globe, FileText, PlayCircle, Link as LinkIcon, PenTool } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';
import { getAllCategories, getCategoryColor, getCategoryLabel, getCategoryIcon } from '@/lib/categoryColors';

const CONTENT_TYPES = [
  { id: 'text', label: 'Texto / Artigo' },
  { id: 'video', label: 'Vídeo' },
  { id: 'audio', label: 'Áudio' },
  { id: 'pdf', label: 'PDF / Documento' },
  { id: 'notebook', label: 'NotebookLM / Ferramenta' },
  { id: 'exercise', label: 'Exercício Prático' },
  { id: 'link', label: 'Link Externo' }
];

const LANGUAGES = [
  { id: 'all', label: 'Todos os Idiomas' },
  { id: 'pt', label: '🇵🇹 Português' },
  { id: 'en', label: '🇬🇧 English' },
  { id: 'es', label: '🇪🇸 Español' },
  { id: 'it', label: '🇮🇹 Italiano' }
];

export default function AdminCourseContentPage() {
  const { user } = useAuth();
  
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'video',
    url: '',
    is_preview: false
  });

  const categories = getAllCategories();

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadContent(selectedCourse.id);
      setShowForm(false);
    }
  }, [selectedCourse]);

  useEffect(() => {
    applyFilters();
  }, [courses, filterLanguage, filterCategory]);

  const loadCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('id, title, slug, language, category')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setCourses(data || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Não foi possível carregar os cursos. Verifique sua conexão e permissões.');
      toast({ title: 'Erro de Conexão', description: 'Não foi possível carregar os cursos.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...courses];
    
    if (filterLanguage !== 'all') {
      filtered = filtered.filter(c => c.language === filterLanguage);
    }
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(c => c.category === filterCategory);
    }
    
    setFilteredCourses(filtered);
  };

  const loadContent = async (courseId) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('course_content')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (fetchError) throw fetchError;
      setContent(data || []);
    } catch (err) {
      console.error('Error fetching content:', err);
      toast({ title: 'Erro de Leitura', description: 'Falha ao carregar conteúdos deste curso.', variant: 'destructive' });
    }
  };

  const handleAddContent = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast({ title: 'Campo Obrigatório', description: 'O título do conteúdo é obrigatório.', variant: 'destructive' });
      return;
    }

    try {
      const newItem = {
        course_id: selectedCourse.id,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        url: formData.url,
        is_preview: formData.is_preview,
        order_index: content.length,
      };

      const { data, error: insertError } = await supabase
        .from('course_content')
        .insert([newItem])
        .select()
        .single();

      if (insertError) throw insertError;

      setContent([...content, data]);
      setFormData({ title: '', description: '', type: 'video', url: '', is_preview: false });
      setShowForm(false);
      toast({ title: 'Sucesso', description: 'Conteúdo adicionado com sucesso!' });
      
    } catch (err) {
      console.error('Error adding content:', err);
      toast({ title: 'Erro ao Salvar', description: 'Ocorreu um erro ao salvar o conteúdo.', variant: 'destructive' });
    }
  };

  const handleDeleteContent = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este conteúdo permanentemente?')) return;
    
    try {
      const { error: deleteError } = await supabase
        .from('course_content')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setContent(content.filter(c => c.id !== id));
      toast({ title: 'Removido', description: 'Conteúdo excluído com sucesso.' });
    } catch (err) {
      console.error('Error deleting content:', err);
      toast({ title: 'Erro de Exclusão', description: 'Não foi possível excluir o conteúdo.', variant: 'destructive' });
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'video': return <PlayCircle size={16} />;
      case 'audio': return <PlayCircle size={16} />;
      case 'text': return <FileText size={16} />;
      case 'pdf': return <FileText size={16} />;
      case 'exercise': return <PenTool size={16} />;
      case 'link': 
      case 'notebook': return <LinkIcon size={16} />;
      default: return <FileText size={16} />;
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
          <h1 className="text-3xl font-black text-white mb-2">📄 Gerenciar Conteúdo</h1>
          <p className="text-gray-400">Adicione materiais de apoio, aulas, PDFs e links para seus cursos.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f59e0b]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[75vh] min-h-[600px]">
            {/* Left Column: Courses Sidebar */}
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl flex flex-col overflow-hidden md:col-span-1">
              <div className="p-4 border-b border-[#2a2a2a] bg-[#1c1c1c]">
                <h2 className="font-bold flex items-center gap-2 mb-4"><BookOpen size={18} /> Cursos</h2>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 block">Idioma</label>
                    <select 
                      value={filterLanguage} 
                      onChange={(e) => setFilterLanguage(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-[#333] text-sm rounded-lg px-3 py-2 text-gray-300 outline-none focus:border-[#f59e0b]"
                    >
                      {LANGUAGES.map(lang => (
                        <option key={lang.id} value={lang.id}>{lang.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 block">Categoria</label>
                    <select 
                      value={filterCategory} 
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-[#333] text-sm rounded-lg px-3 py-2 text-gray-300 outline-none focus:border-[#f59e0b]"
                    >
                      <option value="all">Todas as Categorias</option>
                      {categories.map(cat => (
                        <option key={cat.slug} value={cat.slug}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="overflow-y-auto flex-grow p-3 space-y-2">
                {filteredCourses.map(course => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourse(course)}
                    className={`w-full text-left p-3 rounded-xl transition-colors border ${
                      selectedCourse?.id === course.id 
                        ? 'bg-[#2a2a2a] border-[#f59e0b] text-white' 
                        : 'bg-[#1c1c1c] border-transparent text-gray-400 hover:bg-[#222]'
                    }`}
                  >
                    <div className="font-bold text-sm line-clamp-1">{course.title}</div>
                    <div className="text-[10px] text-gray-500 mt-1 uppercase flex gap-2 items-center">
                      <span>{getLanguageLabel(course.language)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        {getCategoryIcon(course.category)} {getCategoryLabel(course.category)}
                      </span>
                    </div>
                  </button>
                ))}
                {filteredCourses.length === 0 && !error && (
                  <div className="text-gray-500 text-sm text-center p-4 border border-dashed border-[#333] rounded-xl mt-2">
                    Nenhum curso atende aos filtros.
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-[#333] bg-[#1c1c1c] text-xs text-center text-gray-500 font-bold uppercase tracking-wider">
                {filteredCourses.length} de {courses.length} cursos
              </div>
            </div>

            {/* Right Column: Content Area (Spans 2 columns) */}
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl flex flex-col overflow-hidden md:col-span-2">
              <div className="p-4 border-b border-[#2a2a2a] bg-[#1c1c1c] flex justify-between items-center">
                <div>
                  {selectedCourse ? (
                    <>
                      <h2 className="font-bold text-white flex items-center gap-2">
                        Conteúdos: {selectedCourse.title}
                      </h2>
                      <p className="text-xs text-[#f59e0b] mt-1 font-medium tracking-wide uppercase flex items-center gap-2">
                        <span>{getLanguageLabel(selectedCourse.language)}</span>
                        <span>•</span>
                        <span>{getCategoryIcon(selectedCourse.category)} {getCategoryLabel(selectedCourse.category)}</span>
                      </p>
                    </>
                  ) : (
                    <h2 className="font-bold text-gray-400">Selecione um curso</h2>
                  )}
                </div>
                {selectedCourse && (
                  <button 
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#f59e0b] text-black hover:bg-[#d97706] rounded-lg font-bold text-sm transition-colors shadow-lg"
                  >
                    <Plus size={16} /> Adicionar Conteúdo
                  </button>
                )}
              </div>
              
              <div className="overflow-y-auto flex-grow p-6">
                {!selectedCourse ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <BookOpen size={48} className="mb-4 opacity-50 text-[#f59e0b]" />
                    <p className="text-lg">Selecione um curso na lista lateral para gerenciar seus conteúdos.</p>
                  </div>
                ) : (
                  <>
                    <AnimatePresence>
                      {showForm && (
                        <motion.form 
                          initial={{ opacity: 0, y: -20, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: -20, height: 0 }}
                          onSubmit={handleAddContent} 
                          className="bg-[#1c1c1c] p-6 rounded-xl border border-[#2a2a2a] mb-8 space-y-4 shadow-lg overflow-hidden"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-1">Título do Conteúdo</label>
                              <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#f59e0b] transition-colors"
                                placeholder="Ex: Aula 01 - Introdução"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-1">Tipo de Conteúdo</label>
                              <select
                                value={formData.type}
                                onChange={e => setFormData({...formData, type: e.target.value})}
                                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#f59e0b] transition-colors"
                              >
                                {CONTENT_TYPES.map(type => (
                                  <option key={type.id} value={type.id}>{type.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Descrição Curta (Opcional)</label>
                            <textarea
                              value={formData.description}
                              onChange={e => setFormData({...formData, description: e.target.value})}
                              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#f59e0b] transition-colors resize-none"
                              rows={2}
                              placeholder="Breve resumo do que será ensinado ou disponibilizado..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                              {formData.type === 'text' ? 'Conteúdo (HTML/Texto)' : 'URL do Arquivo / Link'}
                            </label>
                            {formData.type === 'text' ? (
                              <textarea
                                value={formData.url}
                                onChange={e => setFormData({...formData, url: e.target.value})}
                                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#f59e0b] font-mono text-sm transition-colors"
                                rows={6}
                                placeholder="<p>Escreva ou cole seu conteúdo HTML aqui...</p>"
                              />
                            ) : (
                              <input
                                type="text"
                                value={formData.url}
                                onChange={e => setFormData({...formData, url: e.target.value})}
                                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#f59e0b] transition-colors"
                                placeholder="https://drive.google.com/... ou https://youtube.com/..."
                              />
                            )}
                          </div>

                          <div className="flex items-start gap-3 bg-[#0a0a0a] p-4 rounded-lg border border-[#333]">
                            <div className="pt-0.5">
                              <input
                                type="checkbox"
                                id="is_preview"
                                checked={formData.is_preview}
                                onChange={e => setFormData({...formData, is_preview: e.target.checked})}
                                className="w-5 h-5 accent-[#f59e0b] cursor-pointer rounded border-[#333]"
                              />
                            </div>
                            <label htmlFor="is_preview" className="text-sm text-gray-300 cursor-pointer select-none leading-tight">
                              <span className="font-bold text-white block mb-1">Liberar como Preview / Aula Gratuita?</span>
                              Marcando esta opção, usuários não matriculados poderão ver este conteúdo gratuitamente na página de vendas.
                            </label>
                          </div>

                          <div className="flex gap-3 pt-4">
                            <button type="submit" className="bg-[#f59e0b] text-black px-6 py-2.5 rounded-lg font-bold hover:bg-[#d97706] transition-colors shadow-lg">
                              Salvar Conteúdo
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="bg-[#2a2a2a] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#333] transition-colors">
                              Cancelar
                            </button>
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>

                    <div className="space-y-4">
                      {content.map((item, idx) => (
                        <div key={item.id} className="bg-[#1c1c1c] p-4 rounded-xl border border-[#2a2a2a] flex items-center justify-between group hover:border-[#f59e0b]/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="text-gray-500 font-mono text-sm w-6 text-center">{idx + 1}</div>
                            <div className="bg-[#2a2a2a] p-3 rounded-lg text-gray-300 group-hover:text-[#f59e0b] transition-colors">
                              {getTypeIcon(item.type)}
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center gap-3">
                                {item.title}
                                {item.is_preview ? (
                                  <span className="text-[10px] font-black uppercase bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full flex items-center gap-1"><Globe size={10}/> Preview Livre</span>
                                ) : (
                                  <span className="text-[10px] font-black uppercase bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full flex items-center gap-1"><Lock size={10}/> Fechado</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-400 mt-0.5 capitalize">
                                {CONTENT_TYPES.find(t => t.id === item.type)?.label || item.type}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => toast({ title: 'Em breve', description: 'Edição será liberada em atualizações futuras.' })} className="p-2 text-gray-400 hover:text-white bg-[#2a2a2a] hover:bg-[#333] rounded-lg transition-colors">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDeleteContent(item.id)} className="p-2 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/80 rounded-lg transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {content.length === 0 && !showForm && (
                        <div className="text-center py-16 px-4 bg-[#0a0a0a] border-2 border-dashed border-[#2a2a2a] rounded-xl">
                          <FileText size={48} className="mx-auto text-gray-600 mb-4" />
                          <h3 className="text-lg font-bold text-white mb-2">Nenhum conteúdo cadastrado</h3>
                          <p className="text-gray-400 text-sm max-w-sm mx-auto">
                            Clique em "Adicionar Conteúdo" para começar a inserir materiais neste curso.
                          </p>
                        </div>
                      )}
                    </div>
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