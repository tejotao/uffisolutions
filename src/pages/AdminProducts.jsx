
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { generateProductCode } from '@/lib/productCodeGenerator';
import { Plus, Edit, Trash, AlertCircle, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const LANGUAGE_OPTIONS = [
  { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' }
];

const getLanguageFlag = (lang) => {
  if (!lang) return '🌐';
  const l = lang.toLowerCase();
  if (l.includes('pt')) return '🇧🇷';
  if (l.includes('en')) return '🇬🇧';
  if (l.includes('es')) return '🇪🇸';
  if (l.includes('it')) return '🇮🇹';
  return '🌐';
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    language: 'pt-BR',
    is_free: false,
    active: true,
    featured: false,
    image_url: '',
    product_code: ''
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Falha ao carregar produtos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        title: product.title || product.name || '',
        description: product.description || '',
        price: product.price || 0,
        language: product.language || 'pt-BR',
        is_free: product.is_free || false,
        active: product.active || product.is_active || false,
        featured: product.featured || false,
        image_url: product.image_url || product.imageUrl || '',
        product_code: product.product_code || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        price: 0,
        language: 'pt-BR',
        is_free: false,
        active: true,
        featured: false,
        image_url: '',
        product_code: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      let finalCode = formData.product_code;
      
      if (!editingId) {
        finalCode = await generateProductCode(formData.language);
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        language: formData.language,
        is_free: formData.is_free,
        active: formData.active,
        featured: formData.featured,
        image_url: formData.image_url,
        product_code: finalCode,
        updated_at: new Date().toISOString()
      };

      if (editingId) {
        const { error: updateError } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingId);
        if (updateError) throw updateError;
        toast({ title: 'Produto atualizado com sucesso!' });
      } else {
        const { error: insertError } = await supabase
          .from('products')
          .insert([payload]);
        if (insertError) throw insertError;
        toast({ title: 'Produto criado com sucesso!' });
      }

      handleCloseModal();
      fetchProducts();
    } catch (err) {
      console.error('Save error:', err);
      toast({
        title: 'Erro ao salvar',
        description: 'Verifique o console para mais detalhes.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (deleteError) throw deleteError;
      toast({ title: 'Produto excluído com sucesso!' });
      fetchProducts();
    } catch (err) {
      console.error('Delete error:', err);
      toast({
        title: 'Erro ao excluir',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 sm:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">Gerenciar Produtos</h1>
            <p className="text-gray-400 mt-1">Adicione, edite ou remova produtos do catálogo</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-colors shadow-lg"
          >
            <Plus size={20} /> Novo Produto
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#f59e0b]" size={48} />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-center text-red-400">
            <AlertCircle size={40} className="mx-auto mb-4" />
            <p className="text-lg font-bold">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden flex flex-col group relative">
                <div className="aspect-video bg-[#0a0a0a] relative flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <ImageIcon size={48} className="text-gray-700" />
                  )}
                  
                  <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                    <span className="text-2xl drop-shadow-md">{getLanguageFlag(product.language)}</span>
                    <div className="flex flex-col gap-1 items-end">
                      {product.featured && <span className="bg-[#f59e0b] text-black text-[10px] font-black px-2 py-0.5 rounded shadow-lg uppercase">Destaque</span>}
                      {!product.active && <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-lg uppercase">Inativo</span>}
                    </div>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  {product.product_code && (
                    <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b] font-bold text-center py-1.5 px-3 rounded-lg text-sm mb-3 shadow-sm">
                      {product.product_code}
                    </div>
                  )}
                  
                  <h3 className="font-bold text-white text-lg line-clamp-1 mb-1">{product.title || product.name}</h3>
                  <div className="flex items-center justify-between mb-4 mt-auto pt-4">
                    <span className={cn("text-xs font-bold px-2 py-1 rounded", product.is_free ? "bg-green-500/20 text-green-400" : "bg-[#f59e0b]/20 text-[#f59e0b]")}>
                      {product.is_free ? 'Gratuito' : `R$ ${parseFloat(product.price || 0).toFixed(2)}`}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenModal(product)} className="p-2 bg-[#2a2a2a] hover:bg-[#f59e0b] hover:text-black text-gray-300 rounded-lg transition-colors">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 bg-[#2a2a2a] hover:bg-red-500 hover:text-white text-gray-300 rounded-lg transition-colors">
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="col-span-full py-16 text-center border-2 border-dashed border-[#2a2a2a] rounded-2xl">
                <p className="text-gray-400 text-lg">Nenhum produto cadastrado.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="sticky top-0 bg-[#141414] border-b border-[#2a2a2a] px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-black text-white">{editingId ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {editingId && (
                <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-xl p-4">
                  <label className="block text-sm font-medium text-[#f59e0b] mb-1">Código do Produto</label>
                  <input 
                    type="text" 
                    value={formData.product_code} 
                    readOnly 
                    className="w-full bg-transparent text-white font-bold text-lg focus:outline-none"
                  />
                  <p className="text-xs text-[#f59e0b]/70 mt-1">Código gerado automaticamente (não pode ser alterado)</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Título do Produto</label>
                  <input 
                    required
                    type="text" 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f59e0b]"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Descrição</label>
                  <textarea 
                    rows="3"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f59e0b]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Idioma</label>
                  <select 
                    value={formData.language}
                    onChange={e => setFormData({...formData, language: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f59e0b]"
                  >
                    {LANGUAGE_OPTIONS.map(opt => (
                      <option key={opt.code} value={opt.code}>{opt.flag} {opt.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">URL da Imagem</label>
                  <input 
                    type="url" 
                    value={formData.image_url}
                    onChange={e => setFormData({...formData, image_url: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f59e0b]"
                    placeholder="https://"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Preço (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    disabled={formData.is_free}
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f59e0b] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-4 pt-8">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.is_free}
                      onChange={e => setFormData({...formData, is_free: e.target.checked, price: e.target.checked ? 0 : formData.price})}
                      className="w-5 h-5 rounded border-[#2a2a2a] bg-[#0a0a0a] text-[#f59e0b] focus:ring-[#f59e0b]"
                    />
                    <span className="text-white font-medium">Produto Gratuito</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.active}
                      onChange={e => setFormData({...formData, active: e.target.checked})}
                      className="w-5 h-5 rounded border-[#2a2a2a] bg-[#0a0a0a] text-[#f59e0b] focus:ring-[#f59e0b]"
                    />
                    <span className="text-white font-medium">Ativo no Catálogo</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.featured}
                      onChange={e => setFormData({...formData, featured: e.target.checked})}
                      className="w-5 h-5 rounded border-[#2a2a2a] bg-[#0a0a0a] text-[#f59e0b] focus:ring-[#f59e0b]"
                    />
                    <span className="text-white font-medium">Destacar Produto</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-[#2a2a2a]">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-6 py-3 rounded-xl text-white hover:bg-[#2a2a2a] transition-colors font-bold"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-70 text-black px-8 py-3 rounded-xl font-bold transition-colors flex items-center gap-2"
                >
                  {isSaving ? <><Loader2 size={18} className="animate-spin"/> Salvando...</> : 'Salvar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
