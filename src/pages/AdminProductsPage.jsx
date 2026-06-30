import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ShieldAlert, Globe, Box, Link as LinkIcon, Image as ImageIcon, Database } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useSuperAdminCheck } from '@/hooks/useSuperAdminCheck';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';
import Modal from '@/components/admin/Modal';
import { getAllCategories } from '@/lib/categoryColors';
import { motion } from 'framer-motion';

const LANGUAGES = [
  { id: 'pt-BR', label: 'Português' },
  { id: 'en-US', label: 'English' },
  { id: 'es-ES', label: 'Español' },
  { id: 'it-IT', label: 'Italiano' }
];

const INITIAL_FORM_STATE = {
  name: '',
  description: '',
  category_id: '',
  language: 'pt-BR',
  price: 0,
  is_free: false,
  slug: '',
  image_url: '',
  stripe_link: '',
  drive_link: '',
  content_url: ''
};

export default function AdminProductsPage() {
  const { isSuperAdmin, loading: adminLoading } = useSuperAdminCheck();
  const { user } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [currentProduct, setCurrentProduct] = useState(null);
  
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!adminLoading && isSuperAdmin) {
      loadData();
    }
  }, [adminLoading, isSuperAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Try to fetch categories from table, fallback to static if fails
      const { data: catData, error: catError } = await supabase.from('categories').select('*');
      if (catError) {
        console.warn('Could not fetch categories from table, using fallback:', catError);
        setCategories(getAllCategories().map(c => ({ id: c.slug, name: c.label })));
      } else {
        setCategories(catData || []);
      }

      // Fetch products with translations
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select('*, product_translations(*)')
        .order('created_at', { ascending: false });

      if (prodError) throw prodError;
      setProducts(prodData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast({ title: 'Erro', description: 'Não foi possível carregar os dados.', variant: 'destructive' });
      setError('Falha ao carregar produtos.');
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (product, lang = 'pt-BR') => {
    if (!product?.product_translations) return 'Sem título';
    const translation = product.product_translations.find(t => t.language === lang) || product.product_translations[0];
    return translation?.name || 'Sem título';
  };

  const getProductLanguage = (product) => {
    if (!product?.product_translations || product.product_translations.length === 0) return 'N/A';
    return product.product_translations.map(t => t.language).join(', ');
  };

  const openAddModal = () => {
    setModalMode('add');
    setCurrentProduct(null);
    setFormData(INITIAL_FORM_STATE);
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setModalMode('edit');
    setCurrentProduct(product);
    
    // Find pt-BR translation first, then fallback to first available
    const translation = product.product_translations?.find(t => t.language === 'pt-BR') 
      || product.product_translations?.[0] 
      || { name: '', description: '', language: 'pt-BR' };

    setFormData({
      name: translation.name || '',
      description: translation.description || '',
      category_id: product.category_id || '',
      language: translation.language || 'pt-BR',
      price: product.price || 0,
      is_free: product.is_free || false,
      slug: product.slug || '',
      image_url: product.image_url || '',
      stripe_link: product.stripe_link || '',
      drive_link: product.drive_link || '',
      content_url: product.content_url || ''
    });
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto permanentemente? Todas as traduções também serão removidas.')) return;
    
    try {
      // Step 1: Delete translations first
      const { error: transError } = await supabase
        .from('product_translations')
        .delete()
        .eq('product_id', id);

      if (transError) throw transError;

      // Step 2: Delete product
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      setProducts(products.filter(p => p.id !== id));
      toast({ title: 'Sucesso', description: 'Produto excluído com sucesso.' });
    } catch (err) {
      console.error('Error deleting product:', err);
      toast({ title: 'Erro', description: 'Falha ao excluir produto.', variant: 'destructive' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!formData.name.trim()) {
      setError('O título é obrigatório.');
      setSaving(false); return;
    }
    if (!formData.category_id) {
      setError('A categoria é obrigatória.');
      setSaving(false); return;
    }
    if (!formData.language) {
      setError('O idioma é obrigatório.');
      setSaving(false); return;
    }

    try {
      const productPayload = {
        category_id: formData.category_id,
        price: formData.is_free ? 0 : parseFloat(formData.price) || 0,
        is_free: Boolean(formData.is_free),
        slug: formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        image_url: formData.image_url.trim(),
        stripe_link: formData.stripe_link.trim(),
        drive_link: formData.drive_link.trim(),
        content_url: formData.content_url.trim()
      };

      const translationPayload = {
        language: formData.language,
        name: formData.name.trim(),
        description: formData.description.trim()
      };

      if (modalMode === 'add') {
        // STEP 1: Insert into products
        const { data: newProduct, error: insertProdError } = await supabase
          .from('products')
          .insert([productPayload])
          .select()
          .single();

        if (insertProdError) throw insertProdError;

        // STEP 2: Insert into product_translations
        translationPayload.product_id = newProduct.id;
        const { error: insertTransError } = await supabase
          .from('product_translations')
          .insert([translationPayload]);

        if (insertTransError) {
          // Rollback product creation if translation fails
          await supabase.from('products').delete().eq('id', newProduct.id);
          throw insertTransError;
        }

        setSuccess('Produto criado com sucesso!');
        toast({ title: 'Sucesso', description: 'Produto criado com sucesso.' });
        loadData(); // Reload to get full relational structure
      } else {
        // STEP 1: Update products table
        const { error: updateProdError } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', currentProduct.id);

        if (updateProdError) throw updateProdError;

        // STEP 2: Check & Update/Insert product_translations
        translationPayload.product_id = currentProduct.id;
        
        const { data: existingTrans, error: checkError } = await supabase
          .from('product_translations')
          .select('id')
          .eq('product_id', currentProduct.id)
          .eq('language', formData.language)
          .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') throw checkError;

        if (existingTrans) {
          // Update existing translation
          const { error: updateTransError } = await supabase
            .from('product_translations')
            .update(translationPayload)
            .eq('id', existingTrans.id);
          
          if (updateTransError) throw updateTransError;
        } else {
          // Insert new translation for this language
          const { error: insertNewTransError } = await supabase
            .from('product_translations')
            .insert([translationPayload]);
            
          if (insertNewTransError) throw insertNewTransError;
        }

        setSuccess('Produto atualizado com sucesso!');
        toast({ title: 'Sucesso', description: 'Produto atualizado com sucesso.' });
        loadData();
      }

      setTimeout(() => {
        setIsModalOpen(false);
      }, 1500);

    } catch (err) {
      console.error('Save error:', err);
      setError(err.message || 'Ocorreu um erro ao salvar o produto.');
    } finally {
      setSaving(false);
    }
  };

  // Access Denied State
  if (!adminLoading && !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
            <p className="text-gray-400">Você não tem permissão para acessar esta página.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-3">
              <Box className="text-[#f59e0b]" /> Gerenciar Produtos (V2)
            </h1>
            <p className="text-gray-400 mt-2">Crie, edite e organize seus cursos e infoprodutos (Múltiplas Traduções).</p>
          </div>
          <button 
            onClick={openAddModal}
            className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-colors shadow-lg"
          >
            <Plus size={18} /> Adicionar Produto
          </button>
        </div>

        {error && !isModalOpen && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading || adminLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f59e0b]"></div>
          </div>
        ) : (
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1c1c1c] border-b border-[#2a2a2a] text-xs uppercase tracking-wider text-gray-400 font-bold">
                    <th className="px-6 py-4">Título (pt-BR)</th>
                    <th className="px-6 py-4">Categoria</th>
                    <th className="px-6 py-4 text-center">Idiomas Disponíveis</th>
                    <th className="px-6 py-4 text-right">Preço</th>
                    <th className="px-6 py-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2a]">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        Nenhum produto cadastrado. Clique em "Adicionar Produto" para começar.
                      </td>
                    </tr>
                  ) : (
                    products.map(product => {
                      const categoryName = categories.find(c => c.id === product.category_id || c.slug === product.category_id)?.name || product.category_id || 'N/A';
                      return (
                        <tr key={product.id} className="hover:bg-[#1c1c1c]/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-white mb-1 line-clamp-1">{getProductName(product)}</div>
                            <div className="text-xs text-gray-500 font-mono">{product.slug}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-xs text-gray-300">
                              <Database size={14} className="text-gray-500"/>
                              <span className="line-clamp-1">{categoryName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#2a2a2a] text-xs font-bold uppercase text-gray-300">
                              <Globe size={12} /> {getProductLanguage(product)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {product.is_free ? (
                              <span className="text-green-500 font-bold text-sm bg-green-500/10 px-2 py-1 rounded-md">Grátis</span>
                            ) : (
                              <span className="font-bold text-white text-sm">£ {product.price?.toFixed(2)}</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => openEditModal(product)}
                                className="p-2 bg-[#2a2a2a] hover:bg-[#f59e0b] hover:text-black text-gray-300 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(product.id)}
                                className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-colors"
                                title="Excluir"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => !saving && setIsModalOpen(false)}
          title={modalMode === 'add' ? 'Adicionar Novo Produto' : 'Editar Produto'}
          size="2xl"
        >
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSaveProduct} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Language Selector for Translation */}
              <div className="md:col-span-2 space-y-1.5 p-4 bg-[#1c1c1c] rounded-xl border border-[#2a2a2a]">
                <label className="text-sm font-bold text-[#f59e0b]">Tradução atual (Idioma) <span className="text-red-500">*</span></label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#f59e0b] transition-colors"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.id} value={lang.id}>{lang.label} ({lang.id})</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Ao editar, altere o idioma para criar/atualizar uma tradução específica.</p>
              </div>

              {/* Title (Name) */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-sm font-bold text-gray-300 flex items-center justify-between">
                  <span>Título do Produto <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Mentoria Importação PRO"
                  required
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#f59e0b] transition-colors"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-sm font-bold text-gray-300">Descrição</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Descrição atrativa sobre o produto..."
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#f59e0b] transition-colors resize-none"
                />
              </div>

              {/* Category ID */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-300">Categoria <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><Database size={16} /></span>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl pl-9 pr-4 py-2.5 text-white outline-none focus:border-[#f59e0b] transition-colors appearance-none"
                  >
                    <option value="" disabled>Selecione uma categoria...</option>
                    {categories.map(cat => (
                      <option key={cat.id || cat.slug} value={cat.id || cat.slug}>{cat.name || cat.label || cat.id}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-300">Preço (£)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">£</span>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    disabled={formData.is_free}
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl pl-8 pr-4 py-2.5 text-white outline-none focus:border-[#f59e0b] transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Is Free Checkbox */}
              <div className="flex items-center bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-2.5 mt-auto h-[46px] md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer w-full">
                  <input
                    type="checkbox"
                    name="is_free"
                    checked={formData.is_free}
                    onChange={handleInputChange}
                    className="w-5 h-5 accent-[#f59e0b] rounded border-gray-600 bg-[#1c1c1c]"
                  />
                  <span className="text-sm font-bold text-white">Produto Gratuito (Ignora o preço acima)</span>
                </label>
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-300">Slug (URL amigável)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><LinkIcon size={16} /></span>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="deixe-vazio-para-gerar"
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl pl-9 pr-4 py-2.5 text-white outline-none focus:border-[#f59e0b] transition-colors font-mono text-sm"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-300">URL da Imagem / Capa</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><ImageIcon size={16} /></span>
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    placeholder="https://exemplo.com/capa.jpg"
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl pl-9 pr-4 py-2.5 text-white outline-none focus:border-[#f59e0b] transition-colors"
                  />
                </div>
              </div>

              {/* Stripe Link */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-bold text-gray-300">Link de Checkout (Stripe)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><LinkIcon size={16} /></span>
                  <input
                    type="url"
                    name="stripe_link"
                    value={formData.stripe_link}
                    onChange={handleInputChange}
                    placeholder="https://buy.stripe.com/..."
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl pl-9 pr-4 py-2.5 text-white outline-none focus:border-[#f59e0b] transition-colors"
                  />
                </div>
              </div>

              {/* Drive Link */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-bold text-gray-300">Link do Drive (Material extra)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><LinkIcon size={16} /></span>
                  <input
                    type="url"
                    name="drive_link"
                    value={formData.drive_link}
                    onChange={handleInputChange}
                    placeholder="https://drive.google.com/..."
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl pl-9 pr-4 py-2.5 text-white outline-none focus:border-[#f59e0b] transition-colors"
                  />
                </div>
              </div>

              {/* Content URL */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-bold text-gray-300">URL do Conteúdo (Área de Membros/Curso)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><LinkIcon size={16} /></span>
                  <input
                    type="url"
                    name="content_url"
                    value={formData.content_url}
                    onChange={handleInputChange}
                    placeholder="https://..."
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl pl-9 pr-4 py-2.5 text-white outline-none focus:border-[#f59e0b] transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#2a2a2a] flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {saving ? (
                  <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div> Salvando...</>
                ) : (
                  modalMode === 'add' ? 'Adicionar Produto' : 'Salvar Alterações'
                )}
              </button>
              <button
                type="button"
                onClick={() => !saving && setIsModalOpen(false)}
                disabled={saving}
                className="flex-1 bg-[#2a2a2a] hover:bg-[#333] text-white font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-70"
              >
                Cancelar
              </button>
            </div>
          </form>
        </Modal>

      </main>
      <Footer />
    </div>
  );
}