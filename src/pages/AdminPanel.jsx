import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { supabase } from '@/lib/supabaseClient';
import { fetchAllProductsAllLanguages, fetchCategoriesForAdmin, fetchLanguages } from '@/lib/catalogQueries';
import { Edit2, Trash2, X, Save, Plus, Loader2, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPanel() {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({ products: 0, users: 0, purchases: 0, favorites: 0 });
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  
  const [filterLang, setFilterLang] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  
  const defaultForm = {
    name: '',
    description: '',
    category_id: '',
    price: 0,
    is_free: false,
    image_url: '',
    stripe_link: '',
    language: 'pt-BR',
    featured: false,
    active: true
  };
  
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    if (user === null) return;
    
    if (!user) {
      navigate('/login');
    } else if (user.email !== 'tejotao@gmail.com') {
      setIsAuthorized(false);
      const timer = setTimeout(() => navigate('/'), 3000);
      return () => clearTimeout(timer);
    } else {
      setIsAuthorized(true);
      loadData();
    }
  }, [user, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, usersRes, purchasesRes, favoritesRes, allProds, cats, langs] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('purchases').select('id', { count: 'exact', head: true }),
        supabase.from('favorites').select('id', { count: 'exact', head: true }),
        fetchAllProductsAllLanguages(),
        fetchCategoriesForAdmin(),
        Promise.resolve(fetchLanguages())
      ]);
      
      setStats({
        products: productsRes.count || 0,
        users: usersRes.count || 0,
        purchases: purchasesRes.count || 0,
        favorites: favoritesRes.count || 0,
      });
      setAllProducts(allProds || []);
      setCategories(cats || []);
      setLanguages(langs || []);
    } catch (e) {
      console.error('Admin loadData error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterLanguageChange = (e) => setFilterLang(e.target.value);
  const handleFilterCategoryChange = (e) => setFilterCategory(e.target.value);

  const filteredProducts = allProducts.filter(p => {
    if (filterLang !== 'all' && p.language !== filterLang) return false;
    if (filterCategory !== 'all' && p.category_id !== filterCategory) return false;
    return true;
  });

  const handleAddNew = () => {
    setFormError('');
    setFormSuccess('');
    setEditingId(null);
    setFormData({ ...defaultForm, category_id: categories.length > 0 ? categories[0].id : '' });
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setFormError('');
    setFormSuccess('');
    setEditingId(product.id);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      category_id: product.category_id || '',
      price: product.price || 0,
      is_free: product.isFree || product.is_free || false,
      image_url: product.imageUrl || product.image_url || '',
      stripe_link: product.stripeLink || product.stripe_link || '',
      language: product.language || 'pt-BR',
      featured: product.featured || false,
      active: product.active ?? true
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(defaultForm);
    setFormError('');
    setFormSuccess('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    
    if (!formData.name || !formData.description || !formData.category_id) {
      setFormError('Nome, Descrição e Categoria são obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const slug = formData.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const priceToSave = formData.is_free ? 0 : parseFloat(formData.price) || 0;

      const productPayload = {
        category_id: formData.category_id,
        price: priceToSave,
        is_free: formData.is_free,
        image_url: formData.image_url,
        stripe_link: formData.stripe_link,
        stripe_payment_link: formData.stripe_link,
        featured: formData.featured,
        active: formData.active
      };

      let productId = editingId;

      if (editingId) {
        // Update product
        const { error: pError } = await supabase.from('products').update(productPayload).eq('id', editingId);
        if (pError) throw pError;
      } else {
        // Insert product
        productPayload.slug = slug;
        const { data: newProd, error: pError } = await supabase.from('products').insert([productPayload]).select().single();
        if (pError) throw pError;
        productId = newProd.id;
      }

      // Upsert translation
      const translationPayload = {
        product_id: productId,
        language: formData.language,
        name: formData.name,
        description: formData.description
      };
      
      const { error: tError } = await supabase.from('product_translations').upsert([translationPayload], { onConflict: 'product_id, language' });
      if (tError) throw tError;

      setFormSuccess(`Produto ${editingId ? 'atualizado' : 'criado'} com sucesso!`);
      
      setTimeout(() => {
        handleCloseForm();
        loadData();
      }, 1500);

    } catch (err) {
      console.error(err);
      setFormError('Erro ao salvar: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Tem certeza que deseja deletar o curso "${name}"? Esta ação não pode ser desfeita.`)) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      
      setTimeout(() => loadData(), 1000);
    } catch (err) {
      console.error(err);
      alert('Erro ao deletar: ' + err.message);
      setLoading(false);
    }
  };

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-[#141414] border border-red-500/30 p-10 rounded-2xl text-center max-w-md w-full">
          <h1 className="text-3xl font-black text-red-500 mb-4">Acesso Negado</h1>
          <p className="text-gray-400 mb-6">Você não tem permissão para acessar esta área.</p>
          <p className="text-sm text-gray-500">Redirecionando para a página inicial...</p>
        </div>
      </div>
    );
  }

  if (isAuthorized === null) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white font-sans">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-[#1c1c1c] pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">⚙️</span>
              <h1 className="text-3xl md:text-4xl font-black text-white m-0 tracking-tight">Painel Administrativo</h1>
            </div>
            <p className="text-gray-400">Gerenciar cursos e produtos</p>
          </div>
          <button 
            onClick={handleAddNew}
            className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-[0_4px_14px_rgba(245,158,11,0.2)] hover:scale-105"
          >
            <Plus size={20} /> Adicionar Novo Curso
          </button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Produtos', value: stats.products, icon: '📚' },
            { label: 'Usuários', value: stats.users, icon: '👥' },
            { label: 'Compras', value: stats.purchases, icon: '💳' },
            { label: 'Favoritos', value: stats.favorites, icon: '❤️' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6 relative overflow-hidden group hover:border-[#f59e0b]/50 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#f59e0b]/5 rounded-full -mr-8 -mt-8 pointer-events-none group-hover:bg-[#f59e0b]/10 transition-colors" />
              <div className="text-3xl mb-3">{stat.icon}</div>
              <div className="text-3xl font-black text-[#f59e0b] mb-1">
                {loading ? <Loader2 className="animate-spin w-8 h-8 text-[#f59e0b]" /> : stat.value}
              </div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters and Table Section */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-5 border-b border-[#2a2a2a] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1a1a1a]">
            <h2 className="text-xl font-bold text-white tracking-tight">Cursos Disponíveis</h2>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="flex items-center bg-[#111] border border-[#333] rounded-lg px-3 py-1.5 gap-2">
                <Filter size={16} className="text-gray-400" />
                <select 
                  value={filterLang} 
                  onChange={handleFilterLanguageChange}
                  className="bg-transparent text-sm text-white focus:outline-none appearance-none min-w-[100px]"
                >
                  <option value="all">Todos Idiomas</option>
                  {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                </select>
              </div>
              <div className="flex items-center bg-[#111] border border-[#333] rounded-lg px-3 py-1.5 gap-2">
                <Filter size={16} className="text-gray-400" />
                <select 
                  value={filterCategory} 
                  onChange={handleFilterCategoryChange}
                  className="bg-transparent text-sm text-white focus:outline-none appearance-none min-w-[140px]"
                >
                  <option value="all">Todas Categorias</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-[#2a2a2a] text-gray-400 text-xs bg-[#111]">
                  <th className="px-6 py-4 font-bold uppercase tracking-wider">Produto</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider">Idioma</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider">Preço</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {loading && allProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="animate-spin w-8 h-8 text-[#f59e0b]" />
                        <span className="font-medium text-sm">Carregando produtos...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="text-4xl mb-3">📭</div>
                      <p className="text-gray-400 font-medium">Nenhum curso encontrado com estes filtros.</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={`${p.id}-${p.language}`} className="hover:bg-[#1c1c1c] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {p.imageUrl || p.image_url ? (
                            <img src={p.imageUrl || p.image_url} alt={p.name} className="w-10 h-10 rounded-md object-cover border border-[#333]" />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-[#222] border border-[#333] flex items-center justify-center text-lg">{p.categoryIcon || '📚'}</div>
                          )}
                          <div>
                            <div className="font-bold text-white mb-0.5 line-clamp-1 max-w-[200px]">{p.name}</div>
                            <div className="text-xs text-gray-500 max-w-[200px] truncate">{p.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-300 uppercase">{p.language}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#222] text-gray-300 border border-[#333]">
                          {p.categoryIcon || '📦'} {p.categoryName || 'Sem Categoria'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-black ${p.isFree || p.is_free || p.price === 0 ? 'text-green-400' : 'text-[#f59e0b]'}`}>
                          {p.isFree || p.is_free || p.price === 0 ? 'Grátis' : `£${p.price}`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {p.featured && <span className="text-xs font-bold text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 px-2 py-1 rounded">Destaque</span>}
                          {!p.active && <span className="text-xs font-bold text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-1 rounded">Inativo</span>}
                          {p.active && !p.featured && <span className="text-xs font-bold text-gray-400 bg-[#222] px-2 py-1 rounded">Normal</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(p)}
                            className="p-2.5 bg-[#222] text-gray-300 hover:text-white hover:bg-[#333] rounded-lg transition-colors border border-[#333]"
                            title="Editar Curso"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-2.5 bg-[#222] text-red-500 hover:text-white hover:bg-red-600 rounded-lg transition-colors border border-[#333]"
                            title="Deletar Curso"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Form Modal (Create/Edit) */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-2xl shadow-2xl my-8 relative flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a] shrink-0 bg-[#1a1a1a] rounded-t-2xl">
                <h3 className="text-2xl font-black text-white m-0 tracking-tight flex items-center gap-2">
                  {editingId ? '✏️ Editar Curso' : '➕ Novo Curso'}
                </h3>
                <button 
                  onClick={handleCloseForm}
                  className="p-2 text-gray-400 hover:text-white hover:bg-[#333] rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar">
                
                {formError && (
                  <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm font-medium">
                    ⚠️ {formError}
                  </div>
                )}
                
                {formSuccess && (
                  <div className="mb-6 bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl text-sm font-medium">
                    ✅ {formSuccess}
                  </div>
                )}

                <form id="productForm" onSubmit={handleSave} className="space-y-6">
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-300">Nome do Curso *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] transition-all"
                      placeholder="Ex: Guia Definitivo de Importação"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-300">Descrição Completa *</label>
                    <textarea 
                      required
                      rows="4"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] transition-all resize-none"
                      placeholder="Descreva o conteúdo do curso detalhadamente..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-300">Categoria *</label>
                      <select 
                        required
                        value={formData.category_id}
                        onChange={e => setFormData({...formData, category_id: e.target.value})}
                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] transition-all appearance-none"
                      >
                        <option value="" disabled>Selecione uma categoria</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-300">Idioma *</label>
                      <select 
                        required
                        value={formData.language}
                        onChange={e => setFormData({...formData, language: e.target.value})}
                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] transition-all appearance-none"
                      >
                        {languages.map(lang => (
                          <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end border p-5 rounded-xl border-[#2a2a2a] bg-[#1a1a1a]">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-300">Preço (£)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        min="0"
                        disabled={formData.is_free}
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: e.target.value})}
                        className="w-full bg-[#141414] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f59e0b] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="pb-3">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={formData.is_free}
                          onChange={e => setFormData({...formData, is_free: e.target.checked, price: e.target.checked ? 0 : formData.price})}
                          className="w-5 h-5 rounded border-[#444] text-[#f59e0b] focus:ring-[#f59e0b] bg-[#141414] cursor-pointer"
                        />
                        <span className="font-bold text-white">Curso Gratuito</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-300">URL da Imagem de Capa</label>
                    <input 
                      type="url" 
                      value={formData.image_url}
                      onChange={e => setFormData({...formData, image_url: e.target.value})}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#f59e0b] transition-all"
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-300">Link de Acesso / Checkout (Stripe)</label>
                    <input 
                      type="url" 
                      value={formData.stripe_link}
                      onChange={e => setFormData({...formData, stripe_link: e.target.value})}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#f59e0b] transition-all"
                      placeholder="https://buy.stripe.com/..."
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6 pt-4 border-t border-[#2a2a2a] mt-6">
                    <label className="flex items-center gap-3 cursor-pointer select-none bg-[#1a1a1a] px-4 py-3 rounded-xl border border-[#333] flex-1">
                      <input 
                        type="checkbox"
                        checked={formData.featured}
                        onChange={e => setFormData({...formData, featured: e.target.checked})}
                        className="w-5 h-5 rounded border-[#444] text-[#f59e0b] focus:ring-[#f59e0b] bg-[#141414] cursor-pointer"
                      />
                      <span className="font-bold text-[#f59e0b]">⭐ Marcar como Destaque</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer select-none bg-[#1a1a1a] px-4 py-3 rounded-xl border border-[#333] flex-1">
                      <input 
                        type="checkbox"
                        checked={formData.active}
                        onChange={e => setFormData({...formData, active: e.target.checked})}
                        className="w-5 h-5 rounded border-[#444] text-green-500 focus:ring-green-500 bg-[#141414] cursor-pointer"
                      />
                      <span className="font-bold text-white">Ativo (Visível no catálogo)</span>
                    </label>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-[#2a2a2a] shrink-0 bg-[#1a1a1a] rounded-b-2xl flex flex-col-reverse sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="w-full sm:w-auto py-3.5 px-8 bg-[#222] hover:bg-[#333] text-white font-bold rounded-xl transition-colors border border-[#333]"
                >
                  ✕ Cancelar
                </button>
                <button
                  type="submit"
                  form="productForm"
                  disabled={loading}
                  className="w-full sm:flex-1 py-3.5 px-8 bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_rgba(245,158,11,0.2)] disabled:opacity-70"
                >
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save size={20} />} 
                  {loading ? 'Salvando...' : '💾 Salvar Curso'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}