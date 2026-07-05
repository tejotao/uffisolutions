
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Tags, Check, Search, Filter, AlertTriangle } from 'lucide-react';
import { fetchAllCategories, createCategory, updateCategory, deleteCategory, upsertCategoryTranslations } from '@/lib/catalogQueries';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { canAccess } from '@/lib/rolePermissions';

const EMOJI_ICONS = ['📁', '🎯', '💼', '🎨', '📱', '🚀', '🎓', '💡', '🎬', '🎵', '🎮', '📚'];

const DIACRITICS_RE = new RegExp('[̀-ͯ]', 'g');
const slugify = (value) => (value || '')
  .toLowerCase()
  .normalize("NFD")
  .replace(DIACRITICS_RE, "")
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)+/g, '');

export default function AdminCategories({ user }) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    name_pt: '',
    name_it: '',
    name_es: '',
    slug: '',
    description: '',
    icon: '📁',
    color: '#f59e0b',
    active: true
  });

  const { toast } = useToast();

  const permissions = {
    canRead: canAccess(user, 'categories', 'read'),
    canCreate: canAccess(user, 'categories', 'create'),
    canUpdate: canAccess(user, 'categories', 'update'),
    canDelete: canAccess(user, 'categories', 'delete'),
  };

  useEffect(() => {
    if (permissions.canRead) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [permissions.canRead]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const cats = await fetchAllCategories('all');
      setCategories(cats || []);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load categories.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!permissions.canRead) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center">
        <AlertTriangle size={64} className="text-red-500 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-400">You do not have permission to view categories.</p>
      </div>
    );
  }

  const handleOpenModal = (category = null) => {
    if (category && !permissions.canUpdate) {
      toast({ title: "Access Denied", description: "You do not have permission to edit categories.", variant: "destructive" });
      return;
    }
    if (!category && !permissions.canCreate) {
      toast({ title: "Access Denied", description: "You do not have permission to create categories.", variant: "destructive" });
      return;
    }

    if (category) {
      setEditingId(category.id);
      setFormData({
        name: category.name_en || '',
        name_pt: category.name_pt || '',
        name_it: category.name_it || '',
        name_es: category.name_es || '',
        slug: category.slug || '',
        description: category.description_raw || '',
        icon: category.icon || '📁',
        color: category.color || '#f59e0b',
        active: category.active ?? true
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        name_pt: '',
        name_it: '',
        name_es: '',
        slug: '',
        description: '',
        icon: '📁',
        color: '#f59e0b',
        active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, name: value, slug: slugify(value) }));
  };

  const handleIconSelect = (icon) => setFormData(prev => ({ ...prev, icon }));
  const handleColorSelect = (color) => setFormData(prev => ({ ...prev, color }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      toast({ title: "Error", description: "Name and Slug are required", variant: "destructive" });
      return;
    }

    if (editingId && !permissions.canUpdate) {
      toast({ title: "Access Denied", description: "You do not have permission to edit.", variant: "destructive" });
      return;
    }
    if (!editingId && !permissions.canCreate) {
      toast({ title: "Access Denied", description: "You do not have permission to create.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        name_pt: formData.name_pt || null,
        name_it: formData.name_it || null,
        name_es: formData.name_es || null,
        slug: formData.slug,
        description: formData.description,
        icon: formData.icon,
        color: formData.color,
        active: formData.active
      };

      let result;
      if (editingId) {
        result = await updateCategory(editingId, payload);
      } else {
        result = await createCategory(payload);
      }

      if (result.error) throw result.error;

      // The flat columns above are admin-form-only — every public display
      // reads the name/description from category_translations, so keep it
      // in sync here for all 4 languages (same shared description text,
      // matching this form's single description field).
      const categoryId = editingId || result.data.id;
      const { error: translationsError } = await upsertCategoryTranslations(
        categoryId,
        { en: formData.name, pt: formData.name_pt, it: formData.name_it, es: formData.name_es },
        formData.description
      );
      if (translationsError) throw translationsError;

      toast({ title: "Success", description: "Category saved successfully!" });
      loadData();
      handleCloseModal();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save category", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!permissions.canDelete) {
      toast({ title: "Access Denied", description: "You do not have permission to delete categories.", variant: "destructive" });
      return;
    }

    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const { error } = await deleteCategory(id);
        if (error) throw error;
        toast({ title: "Success", description: "Category removed." });
        setCategories(categories.filter(c => c.id !== id));
      } catch (error) {
        toast({ title: "Error", description: "Failed to remove category", variant: "destructive" });
      }
    }
  };

  const filteredCategories = categories.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' 
      ? true 
      : statusFilter === 'active' ? c.active : !c.active;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout user={user}>
      <div className="px-6 sm:px-8 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 py-8 border-b border-[#2a2a2a]">
          <div>
            <h1 className="text-4xl font-black flex items-center gap-3">
              <Tags className="text-[#f59e0b] w-10 h-10" />
              Manage Categories
            </h1>
            <p className="text-gray-400 text-base mt-2">Create, edit and organise your catalogue structure</p>
          </div>

          {permissions.canCreate && (
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center justify-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-black px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
            >
              <Plus size={20} />
              New Category
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search category by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#f59e0b] transition-colors"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[#f59e0b] transition-colors appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        <div className="mb-4 text-sm font-medium text-gray-400">
          Showing <span className="text-[#f59e0b]">{filteredCategories.length}</span> categories
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading categories...</div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No categories found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredCategories.map((category) => {
                const isActive = category.active ?? true;
                const catColor = category.color || '#f59e0b';
                
                return (
                  <motion.div
                    key={category.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 relative overflow-hidden group hover:border-gray-600 transition-colors shadow-lg"
                    style={{ borderLeft: `6px solid ${catColor}` }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-inner"
                          style={{ backgroundColor: `${catColor}20`, color: catColor }}
                        >
                          {category.icon || '📁'}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white leading-tight">{category.name}</h3>
                          <p className="text-sm text-gray-500 font-mono">/{category.slug}</p>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-400 line-clamp-2 min-h-[40px] mb-6">
                      {category.description || 'No description set for this category.'}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-[#2a2a2a]">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${isActive ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-600/30'}`}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>

                      <div className="flex gap-2">
                        {permissions.canUpdate && (
                          <button
                            onClick={() => handleOpenModal(category)}
                            className="p-2.5 text-gray-400 hover:text-white bg-[#222] hover:bg-[#333] rounded-xl transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                        )}
                        {permissions.canDelete && (
                          <button
                            onClick={(e) => handleDelete(category.id, e)}
                            className="p-2.5 text-gray-400 hover:text-red-500 bg-[#222] hover:bg-[#333] rounded-xl transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-4 sm:p-8">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={handleCloseModal}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-[#2a2a2a] flex justify-between items-center bg-[#141414]">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Tags className="text-[#f59e0b] w-6 h-6" />
                  {editingId ? 'Edit Category' : 'New Category'}
                </h2>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-white transition-colors">
                  <X size={28} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar">
                <form id="categoryForm" onSubmit={handleSave} className="space-y-6">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Name (EN) *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleNameChange}
                        className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f59e0b] transition-colors"
                        placeholder="E.g. Digital Marketing"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Slug (URL) *</label>
                      <input
                        type="text"
                        name="slug"
                        required
                        value={formData.slug}
                        onChange={handleInputChange}
                        className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f59e0b] transition-colors"
                        placeholder="Auto-generated from Name (EN)"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Name (PT)</label>
                      <input
                        type="text"
                        name="name_pt"
                        value={formData.name_pt}
                        onChange={handleInputChange}
                        className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f59e0b] transition-colors"
                        placeholder="E.g. Marketing Digital"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Name (IT)</label>
                      <input
                        type="text"
                        name="name_it"
                        value={formData.name_it}
                        onChange={handleInputChange}
                        className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f59e0b] transition-colors"
                        placeholder="E.g. Marketing Digitale"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Name (ES)</label>
                      <input
                        type="text"
                        name="name_es"
                        value={formData.name_es}
                        onChange={handleInputChange}
                        className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f59e0b] transition-colors"
                        placeholder="E.g. Marketing Digital"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
                    <textarea
                      name="description"
                      rows="2"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f59e0b] transition-colors resize-none"
                      placeholder="Category description..."
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Icon</label>
                    <div className="grid grid-cols-6 sm:grid-cols-12 gap-3">
                      {EMOJI_ICONS.map(icon => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => handleIconSelect(icon)}
                          className={`w-12 h-12 flex items-center justify-center text-2xl rounded-xl transition-all ${
                            formData.icon === icon 
                              ? 'bg-[#f59e0b] scale-110 shadow-lg z-10' 
                              : 'bg-[#0f0f0f] hover:bg-[#2a2a2a] border border-[#2a2a2a]'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Accent Colour</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="color"
                        value={/^#[0-9A-Fa-f]{6}$/.test(formData.color) ? formData.color : '#f59e0b'}
                        onChange={(e) => handleColorSelect(e.target.value)}
                        className="w-14 h-14 rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] cursor-pointer p-1"
                        title="Choose colour"
                      />
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => handleColorSelect(e.target.value)}
                        maxLength={7}
                        className="flex-grow bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-[#f59e0b] transition-colors"
                        placeholder="#f59e0b"
                      />
                      <div
                        className="w-10 h-10 rounded-full border-2 border-white/20 shrink-0"
                        style={{ backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(formData.color) ? formData.color : 'transparent' }}
                        title="Preview"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] hover:border-[#f59e0b]/50 transition-colors w-fit">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.active ? 'bg-[#f59e0b] border-[#f59e0b]' : 'bg-[#1a1a1a] border-gray-600'}`}>
                      {formData.active && <Check size={14} className="text-black font-bold" />}
                    </div>
                    <input 
                      type="checkbox" 
                      name="active" 
                      checked={formData.active} 
                      onChange={handleInputChange} 
                      className="hidden" 
                    />
                    <div className="flex flex-col">
                      <span className="text-white font-medium flex items-center gap-1">Active Category</span>
                    </div>
                  </label>

                </form>
              </div>

              <div className="p-8 border-t border-[#2a2a2a] bg-[#141414] flex justify-end gap-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                  className="px-6 py-3 rounded-xl font-medium text-gray-300 hover:text-white hover:bg-[#222] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="categoryForm"
                  disabled={isSaving}
                  className="px-8 py-3 rounded-xl font-bold bg-[#f59e0b] hover:bg-[#d97706] text-black transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
