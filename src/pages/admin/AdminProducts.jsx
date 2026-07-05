
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, X, Search, Package, Star, Check, Filter,
  AlertTriangle, Globe, FileText, Video, ExternalLink, HardDrive,
  Lock, ChevronRight, Eye, Loader2, Image, Music,
} from 'lucide-react';
import { fetchAllProductsAllLanguages, fetchAllCategories, createProduct, updateProduct, deleteProduct } from '@/lib/catalogQueries';
import { getDeliverablesForProduct, getDeliverablesForProducts, replaceProductDeliverables, DELIVERABLE_PROVIDERS } from '@/lib/deliverableQueries';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { canAccess } from '@/lib/rolePermissions';
import { cn } from '@/lib/utils';

// ─── Deliverable type config ──────────────────────────────────────────────────

const PRODUCT_TYPES = [
  { value: 'pdf',      label: 'PDF',          icon: FileText,     color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30',    desc: 'Downloadable PDF document' },
  { value: 'video',    label: 'Video',         icon: Video,        color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   desc: 'YouTube, Vimeo or any video URL' },
  { value: 'audio',    label: 'Audio',         icon: Music,        color: 'text-pink-400',   bg: 'bg-pink-500/10',   border: 'border-pink-500/30',   desc: 'Spotify, podcast or audio file' },
  { value: 'external', label: 'External',      icon: ExternalLink, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', desc: 'External platform or page' },
  { value: 'drive',    label: 'Google Drive',  icon: HardDrive,    color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/30',desc: 'Google Drive folder or file' },
  { value: 'other',    label: 'Other',         icon: Globe,        color: 'text-zinc-400',   bg: 'bg-zinc-500/10',   border: 'border-zinc-500/30',   desc: 'Any other content type' },
];

// Slugify + random suffix — guarantees uniqueness without a lookup/round-trip,
// so two products with the same name never collide on the UNIQUE slug column.
const slugify = (str) =>
  (str || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const makeUniqueSlug = (name) => `${slugify(name)}-${Math.random().toString(36).slice(2, 8)}`;

const PROVIDER_OPTIONS = [
  { value: '',         label: '— Auto detect —' },
  { value: 'youtube',  label: '▶ YouTube' },
  { value: 'vimeo',    label: '▶ Vimeo' },
  { value: 'spotify',  label: '🎵 Spotify' },
  { value: 'supabase', label: '☁ Supabase Storage' },
  { value: 'drive',    label: '💾 Google Drive' },
  { value: 'external', label: '🔗 External Link' },
];

const getTypeConfig = (val) => PRODUCT_TYPES.find((t) => t.value === val) || PRODUCT_TYPES[4];
const emptyDeliverable = () => ({ type: 'other', provider: '', label: '', url: '', go_unlisted_at: '' });

const getLanguageFlag = (lang) => {
  if (!lang) return '🌐';
  const l = lang.toLowerCase();
  if (l.includes('pt')) return '🇧🇷';
  if (l.includes('en')) return '🇬🇧';
  if (l.includes('es')) return '🇪🇸';
  if (l.includes('it')) return '🇮🇹';
  return '🌐';
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminProducts({ user }) {
  const [products, setProducts]       = useState([]);
  const [categories, setCategories]   = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [langFilter, setLangFilter]   = useState('all');
  const [catFilter, setCatFilter]     = useState('all');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [isSaving, setIsSaving]       = useState(false);
  const [activeTab, setActiveTab]     = useState('public'); // 'public' | 'content'
  const [deliverablesMap, setDeliverablesMap] = useState(new Map()); // productId -> deliverable[]
  const [loadingDeliverables, setLoadingDeliverables] = useState(false);

  const [formData, setFormData] = useState({
    // ── Tab 1: Public ──
    name: '', description: '', price: '', category_id: '',
    language: 'pt', level: 'beginner', image_url: '',
    is_featured: false, active: true,
    // ── Tab 2: Content ──
    stripe_link: '', access_duration_days: '',
    deliverables: [], // [{ type, label, url }]
  });

  const { toast } = useToast();

  const permissions = {
    canRead:   canAccess(user, 'products', 'read'),
    canCreate: canAccess(user, 'products', 'create'),
    canUpdate: canAccess(user, 'products', 'update'),
    canDelete: canAccess(user, 'products', 'delete'),
    canFeature:canAccess(user, 'products', 'feature'),
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        fetchAllProductsAllLanguages(),
        fetchAllCategories('all'),
      ]);
      setProducts(prods || []);
      setCategories(cats || []);
      const map = await getDeliverablesForProducts((prods || []).map((p) => p.id));
      setDeliverablesMap(map);
    } catch {
      toast({ title: 'Error loading data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (permissions.canRead) loadData(); else setIsLoading(false); }, []);

  if (!permissions.canRead) {
    return (
      <AdminLayout user={user}>
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <AlertTriangle size={48} className="text-red-500" />
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
        </div>
      </AdminLayout>
    );
  }

  const openModal = async (product = null) => {
    setActiveTab('public');
    if (product) {
      setEditingId(product.id);
      setFormData({
        name:         product.title || product.name || '',
        description:  product.description || '',
        price:        product.price || 0,
        category_id:  product.category_id || '',
        language:     product.language || 'pt',
        level:        product.level || 'beginner',
        image_url:    product.image_url || product.imageUrl || '',
        is_featured:  product.featured || product.is_featured || false,
        active:       product.active ?? true,
        stripe_link:  product.stripe_payment_link || product.stripe_link || '',
        access_duration_days: product.access_duration_days ?? '',
        deliverables: (deliverablesMap.get(product.id) || []).map((d) => ({
          id: d.id, type: d.type, provider: d.provider || '', label: d.label || '', url: d.url,
          go_unlisted_at: d.go_unlisted_at || '',
        })),
      });
      setIsModalOpen(true);
      // Refresh in case the cached map is stale
      setLoadingDeliverables(true);
      const fresh = await getDeliverablesForProduct(product.id);
      setFormData((p) => ({
        ...p,
        deliverables: fresh.map((d) => ({
          id: d.id, type: d.type, provider: d.provider || '', label: d.label || '', url: d.url,
          go_unlisted_at: d.go_unlisted_at || '',
        })),
      }));
      setLoadingDeliverables(false);
    } else {
      setEditingId(null);
      setFormData({
        name: '', description: '', price: '',
        category_id: categories[0]?.id || '',
        language: 'pt', level: 'beginner', image_url: '',
        is_featured: false, active: true,
        stripe_link: '', access_duration_days: '', deliverables: [],
      });
      setIsModalOpen(true);
    }
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category_id) {
      toast({ title: 'Name and Category are required', variant: 'destructive' });
      setActiveTab('public');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        name:         formData.name,
        title:        formData.name,
        description:  formData.description,
        price:        parseFloat(formData.price) || 0,
        is_free:      parseFloat(formData.price) === 0,
        category_id:  formData.category_id,
        language:     formData.language,
        level:        formData.level,
        image_url:    formData.image_url,
        featured:     permissions.canFeature ? formData.is_featured : false,
        active:       formData.active,
        stripe_link:  formData.stripe_link || null,
        access_duration_days: formData.access_duration_days ? parseInt(formData.access_duration_days, 10) : null,
      };
      // Slug is only generated on create — editing a product must never change
      // its URL (would break already-shared links / SEO).
      if (!editingId) {
        payload.slug = makeUniqueSlug(formData.name);
      }
      const result = editingId ? await updateProduct(editingId, payload) : await createProduct(payload);
      if (result.error) throw result.error;

      const productId = editingId || result.data?.id;
      if (productId) {
        const { error: delivError } = await replaceProductDeliverables(productId, formData.deliverables);
        if (delivError) throw delivError;
      }

      toast({ title: 'Product saved', className: 'border-amber-500 bg-zinc-900 text-white' });
      loadData();
      setIsModalOpen(false);
      setEditingId(null);
    } catch {
      toast({ title: 'Error saving product', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Deliverable row helpers ──────────────────────────────────────────────
  const addDeliverable = () =>
    setFormData((p) => ({ ...p, deliverables: [...p.deliverables, emptyDeliverable()] }));

  const updateDeliverable = (idx, field, value) =>
    setFormData((p) => ({
      ...p,
      deliverables: p.deliverables.map((d, i) => (i === idx ? { ...d, [field]: value } : d)),
    }));

  const removeDeliverable = (idx) =>
    setFormData((p) => ({ ...p, deliverables: p.deliverables.filter((_, i) => i !== idx) }));

  const handleDelete = async (id) => {
    if (!permissions.canDelete) return;
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      const { error } = await deleteProduct(id);
      if (error) throw error;
      toast({ title: 'Product deleted', className: 'border-zinc-700 bg-zinc-900 text-white' });
      setProducts((p) => p.filter((x) => x.id !== id));
    } catch {
      toast({ title: 'Error deleting product', variant: 'destructive' });
    }
  };

  const handleFeature = async (product) => {
    if (!permissions.canFeature) return;
    const { error } = await updateProduct(product.id, { featured: !product.featured });
    if (!error) loadData();
  };

  const filtered = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      (p.title || p.name || '').toLowerCase().includes(q) &&
      (langFilter === 'all' || p.language === langFilter) &&
      (catFilter === 'all' || p.category_id === catFilter)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, langFilter, catFilter]);

  const getCategoryName = (id) => {
    const c = categories.find((x) => x.id === id);
    return c ? `${c.icon || '📁'} ${c.name}` : '-';
  };

  return (
    <AdminLayout user={user}>
      <div className="px-6 sm:px-8 py-8 max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-800">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-3">
              <Package className="text-amber-400 w-7 h-7" /> Products
            </h1>
            <p className="text-zinc-500 text-sm mt-0.5">{filtered.length} product{filtered.length !== 1 ? 's' : ''} · Manage catalog and content delivery</p>
          </div>
          {permissions.canCreate && (
            <button onClick={() => openModal()}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20 text-sm active:scale-95">
              <Plus size={16} /> New Product
            </button>
          )}
        </div>

        {/* ── Filters ── */}
        <div className="mb-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input type="text" placeholder="Search products..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors" />
          </div>
          <div className="relative">
            <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
            <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 appearance-none">
              <option value="all">All Categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div className="relative">
            <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
            <select value={langFilter} onChange={(e) => setLangFilter(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 appearance-none">
              <option value="all">All Languages</option>
              <option value="pt">🇧🇷 Português</option>
              <option value="en">🇬🇧 English</option>
              <option value="es">🇪🇸 Español</option>
              <option value="it">🇮🇹 Italiano</option>
            </select>
          </div>
        </div>

        {/* ── Product table ── */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950/60 border-b border-zinc-800">
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">Lang</th>
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center hidden sm:table-cell">Type</th>
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="7" className="py-16 text-center text-zinc-600">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2" /> Loading products...
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="7" className="py-16 text-center text-zinc-600">
                    <Package size={32} className="mx-auto mb-2 opacity-20" /> No products found
                  </td></tr>
                ) : paginated.map((product) => {
                  const isActive    = product.active ?? true;
                  const isFree      = parseFloat(product.price) === 0 || !product.price;
                  const deliverables = deliverablesMap.get(product.id) || [];
                  const primaryType = deliverables[0]?.type;
                  const pType       = getTypeConfig(primaryType);
                  const TypeIcon    = pType.icon;
                  const hasLink     = deliverables.length > 0;
                  const extraCount  = deliverables.length - 1;

                  return (
                    <tr key={product.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/30 transition-colors group">
                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {permissions.canFeature && (
                            <button onClick={() => handleFeature(product)}>
                              <Star size={14} className={product.featured ? 'text-amber-400 fill-amber-400' : 'text-zinc-700 hover:text-amber-400'} />
                            </button>
                          )}
                          <div>
                            <p className="font-semibold text-white text-sm truncate max-w-[180px]">
                              {product.title || product.name || '-'}
                            </p>
                            {hasLink && (
                              <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded border', pType.color, pType.bg, pType.border)}>
                                {pType.label}{extraCount > 0 ? ` +${extraCount}` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* Category */}
                      <td className="px-4 py-3 text-zinc-400 text-xs hidden md:table-cell">{getCategoryName(product.category_id)}</td>
                      {/* Price */}
                      <td className="px-4 py-3">
                        {isFree
                          ? <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Free</span>
                          : <span className="text-white text-sm font-bold">£{Number(product.price).toFixed(2)}</span>
                        }
                      </td>
                      {/* Language */}
                      <td className="px-4 py-3 text-center text-xl">{getLanguageFlag(product.language)}</td>
                      {/* Type */}
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        {hasLink ? (
                          <div className="flex items-center justify-center gap-1">
                            <TypeIcon size={15} className={pType.color} title={pType.label} />
                            {extraCount > 0 && <span className="text-[9px] text-zinc-500 font-bold">+{extraCount}</span>}
                          </div>
                        ) : (
                          <span className="text-zinc-700 text-xs">—</span>
                        )}
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold border',
                          isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-500 border-zinc-700')}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {permissions.canUpdate && (
                            <button onClick={() => openModal(product)}
                              className="p-1.5 text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors">
                              <Edit2 size={14} />
                            </button>
                          )}
                          {permissions.canDelete && (
                            <button onClick={() => handleDelete(product.id)}
                              className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-zinc-500">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══ Product Modal ══ */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => { setIsModalOpen(false); setEditingId(null); }} />

            <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl z-10 flex flex-col max-h-[92vh] overflow-hidden">

              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/80 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-500/15 border border-amber-500/30 rounded-lg flex items-center justify-center">
                    <Package size={16} className="text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">{editingId ? 'Edit Product' : 'New Product'}</h2>
                    <p className="text-[10px] text-zinc-600">Fill both tabs before saving</p>
                  </div>
                </div>
                <button onClick={() => { setIsModalOpen(false); setEditingId(null); }}
                  className="text-zinc-500 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* ── Tab bar ── */}
              <div className="flex border-b border-zinc-800 bg-zinc-900/50 shrink-0">
                {/* Tab 1 — Public */}
                <button
                  onClick={() => setActiveTab('public')}
                  className={cn(
                    'flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all border-b-2 flex-1 justify-center',
                    activeTab === 'public'
                      ? 'text-amber-400 border-amber-500 bg-amber-500/5'
                      : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-zinc-800/40'
                  )}
                >
                  <Eye size={14} /> Public Info
                </button>

                {/* Tab 2 — Content */}
                <button
                  onClick={() => setActiveTab('content')}
                  className={cn(
                    'flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all border-b-2 flex-1 justify-center',
                    activeTab === 'content'
                      ? 'text-purple-400 border-purple-500 bg-purple-500/5'
                      : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-zinc-800/40'
                  )}
                >
                  <Lock size={14} /> Content & Delivery
                  {formData.deliverables.length > 0 && (
                    <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full" title="Links configured">
                      {formData.deliverables.length}
                    </span>
                  )}
                </button>
              </div>

              {/* ── Form body ── */}
              <form id="productForm" onSubmit={handleSave} className="flex-grow overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">

                  {/* ══ TAB 1: PUBLIC INFO ══ */}
                  {activeTab === 'public' && (
                    <motion.div key="public" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.15 }} className="p-6 space-y-5">

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Product Name <span className="text-red-400">*</span></label>
                          <input type="text" name="name" required value={formData.name} onChange={onChange}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Category <span className="text-red-400">*</span></label>
                          <select name="category_id" required value={formData.category_id} onChange={onChange}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 appearance-none">
                            <option value="" disabled>Select category</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Public Description</label>
                        <textarea name="description" rows="3" value={formData.description} onChange={onChange}
                          placeholder="Describe the product for potential buyers..."
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none placeholder-zinc-700" />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Price (£)</label>
                          <input type="number" step="0.01" min="0" name="price" value={formData.price} onChange={onChange}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors" />
                          <p className={cn('text-[10px] mt-1 font-semibold',
                            parseFloat(formData.price) === 0 ? 'text-emerald-400' : 'text-zinc-600')}>
                            {parseFloat(formData.price) === 0 ? '✓ Free product' : 'Paid product'}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Language</label>
                          <select name="language" value={formData.language} onChange={onChange}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 appearance-none">
                            <option value="pt">🇧🇷 PT</option>
                            <option value="en">🇬🇧 EN</option>
                            <option value="es">🇪🇸 ES</option>
                            <option value="it">🇮🇹 IT</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Level</label>
                          <select name="level" value={formData.level} onChange={onChange}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 appearance-none">
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-zinc-400 mb-1.5 block flex items-center gap-1.5">
                          <Image size={12} /> Thumbnail Image URL
                        </label>
                        <div className="flex gap-3">
                          <input type="url" name="image_url" value={formData.image_url} onChange={onChange}
                            placeholder="https://..."
                            className="flex-grow bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors placeholder-zinc-700" />
                          {formData.image_url && (
                            <img src={formData.image_url} alt="preview"
                              className="w-12 h-12 rounded-xl object-cover border border-zinc-700 shrink-0"
                              onError={(e) => { e.target.style.display = 'none'; }} />
                          )}
                        </div>
                      </div>

                      {/* Toggles */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {permissions.canFeature && (
                          <label className={cn(
                            'flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all',
                            formData.is_featured
                              ? 'bg-amber-500/8 border-amber-500/40'
                              : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                          )}>
                            <div className={cn('w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                              formData.is_featured ? 'bg-amber-500 border-amber-500' : 'border-zinc-600 bg-zinc-900')}>
                              {formData.is_featured && <Check size={11} className="text-black" strokeWidth={3} />}
                            </div>
                            <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={onChange} className="hidden" />
                            <div>
                              <p className="text-sm font-semibold text-white flex items-center gap-1">
                                Featured <Star size={12} className="text-amber-400" />
                              </p>
                              <p className="text-[10px] text-zinc-500">Highlight on home page</p>
                            </div>
                          </label>
                        )}
                        <label className={cn(
                          'flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all',
                          formData.active
                            ? 'bg-emerald-500/5 border-emerald-500/30'
                            : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                        )}>
                          <div className={cn('w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                            formData.active ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600 bg-zinc-900')}>
                            {formData.active && <Check size={11} className="text-black" strokeWidth={3} />}
                          </div>
                          <input type="checkbox" name="active" checked={formData.active} onChange={onChange} className="hidden" />
                          <div>
                            <p className="text-sm font-semibold text-white">Active</p>
                            <p className="text-[10px] text-zinc-500">Visible in catalog</p>
                          </div>
                        </label>
                      </div>

                      {/* Next tab hint */}
                      <button type="button" onClick={() => setActiveTab('content')}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-zinc-700 hover:border-purple-500/50 text-zinc-500 hover:text-purple-400 transition-all text-xs font-medium group">
                        <span className="flex items-center gap-2">
                          <Lock size={12} /> Configure content links and delivery →
                        </span>
                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </motion.div>
                  )}

                  {/* ══ TAB 2: CONTENT & DELIVERY ══ */}
                  {activeTab === 'content' && (
                    <motion.div key="content" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                      transition={{ duration: 0.15 }} className="p-6 space-y-5">

                      {/* Private badge */}
                      <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/8 border border-purple-500/20 rounded-xl">
                        <Lock size={12} className="text-purple-400 shrink-0" />
                        <p className="text-xs text-purple-300">
                          This information is <strong>private</strong> — only visible to the admin. Each link below becomes a delivery button shown to the user once they have access. The URL itself is never shown to the user.
                        </p>
                      </div>

                      {loadingDeliverables ? (
                        <div className="flex items-center justify-center py-10 text-zinc-600 gap-2 text-sm">
                          <Loader2 size={16} className="animate-spin" /> Loading delivery items...
                        </div>
                      ) : (
                        <>
                          {/* Deliverable items list */}
                          <div className="space-y-3">
                            {formData.deliverables.length === 0 && (
                              <div className="text-center py-8 border border-dashed border-zinc-800 rounded-xl text-zinc-600 text-xs">
                                No delivery items yet. Add a PDF, video, external link, Drive file, or other resource below.
                              </div>
                            )}

                            {formData.deliverables.map((item, idx) => {
                              const t = getTypeConfig(item.type);
                              return (
                                <div key={item.id || `new-${idx}`}
                                  className={cn('bg-zinc-900 border rounded-xl p-3.5 space-y-2.5 transition-colors', item.url ? t.border : 'border-zinc-800')}>
                                  <div className="flex items-center justify-between">
                                    <div className="flex gap-1">
                                      {PRODUCT_TYPES.map((pt) => {
                                        const Icon = pt.icon;
                                        const active = item.type === pt.value;
                                        return (
                                          <button key={pt.value} type="button" title={pt.label}
                                            onClick={() => updateDeliverable(idx, 'type', pt.value)}
                                            className={cn(
                                              'p-1.5 rounded-lg border transition-all',
                                              active ? cn(pt.bg, pt.border, pt.color) : 'border-transparent text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800'
                                            )}>
                                            <Icon size={14} />
                                          </button>
                                        );
                                      })}
                                    </div>
                                    <button type="button" onClick={() => removeDeliverable(idx)}
                                      className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                      <Trash2 size={13} />
                                    </button>
                                  </div>

                                  {/* Provider select */}
                                  <select value={item.provider || ''} onChange={(e) => updateDeliverable(idx, 'provider', e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-zinc-600 transition-colors appearance-none">
                                    {PROVIDER_OPTIONS.map((o) => (
                                      <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                  </select>

                                  <input type="text" value={item.label} placeholder={`Label (optional) — e.g. "${t.label} — Module 1"`}
                                    onChange={(e) => updateDeliverable(idx, 'label', e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-zinc-600 transition-colors placeholder-zinc-700" />

                                  <input type="url" value={item.url} required
                                    placeholder={
                                      t.value === 'pdf'      ? 'https://docs.google.com/...' :
                                      t.value === 'video'    ? 'https://youtube.com/watch?v=...' :
                                      t.value === 'audio'    ? 'https://open.spotify.com/...' :
                                      t.value === 'drive'    ? 'https://drive.google.com/...' :
                                      'https://...'
                                    }
                                    onChange={(e) => updateDeliverable(idx, 'url', e.target.value)}
                                    className={cn(
                                      'w-full bg-zinc-950 border rounded-lg px-3 py-2 text-white text-xs focus:outline-none transition-colors placeholder-zinc-700',
                                      item.url ? cn(t.color, 'border-opacity-40', t.border) : 'border-zinc-800 focus:border-amber-500'
                                    )} />

                                  {/* go_unlisted_at — only for YouTube */}
                                  {(item.provider === 'youtube' || (item.url || '').includes('youtube') || (item.url || '').includes('youtu.be')) && (
                                    <div className="flex items-center gap-2 bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2">
                                      <span className="text-[10px] text-zinc-500 shrink-0">🔒 Make unlisted on</span>
                                      <input
                                        type="date"
                                        value={item.go_unlisted_at || ''}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => updateDeliverable(idx, 'go_unlisted_at', e.target.value)}
                                        className="flex-1 bg-transparent text-zinc-300 text-xs focus:outline-none"
                                      />
                                      {item.go_unlisted_at && (
                                        <button type="button" onClick={() => updateDeliverable(idx, 'go_unlisted_at', '')}
                                          className="text-zinc-600 hover:text-zinc-400 text-[10px]">✕</button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          <button type="button" onClick={addDeliverable}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-zinc-700 hover:border-amber-500/50 text-zinc-400 hover:text-amber-400 transition-all text-xs font-bold">
                            <Plus size={14} /> Add Delivery Item
                          </button>
                        </>
                      )}

                      {/* Stripe — only if paid */}
                      {parseFloat(formData.price) > 0 && (
                        <div className="bg-zinc-900/60 border border-zinc-700/60 rounded-xl p-4">
                          <label className="text-xs font-semibold text-amber-400 mb-1.5 block flex items-center gap-1.5">
                            💳 Stripe Payment URL
                          </label>
                          <input type="url" name="stripe_link" value={formData.stripe_link} onChange={onChange}
                            placeholder="https://buy.stripe.com/..."
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors placeholder-zinc-700" />
                          <p className="text-[10px] text-zinc-600 mt-1.5">Payment link for this product (£{parseFloat(formData.price || 0).toFixed(2)})</p>

                          <label className="text-xs font-semibold text-amber-400 mb-1.5 mt-4 block flex items-center gap-1.5">
                            ⏳ Access Duration (days)
                          </label>
                          <input type="number" min="1" step="1" name="access_duration_days" value={formData.access_duration_days} onChange={onChange}
                            placeholder="Leave empty for lifetime access"
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors placeholder-zinc-700" />
                          <p className="text-[10px] text-zinc-600 mt-1.5">How long access lasts after a Stripe purchase. Empty = lifetime.</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>

              {/* ── Footer ── */}
              <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  {/* Tab indicators */}
                  <div className={cn('w-2 h-2 rounded-full', formData.name && formData.category_id ? 'bg-amber-400' : 'bg-zinc-700')} title="Public info" />
                  <div className={cn('w-2 h-2 rounded-full', formData.deliverables.length > 0 ? 'bg-purple-400' : 'bg-zinc-700')} title="Content links" />
                  <span className="text-[10px] text-zinc-600 ml-1">
                    {formData.name ? `"${formData.name.slice(0, 20)}${formData.name.length > 20 ? '...' : ''}"` : 'Unsaved product'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => { setIsModalOpen(false); setEditingId(null); }}
                    className="px-4 py-2 text-zinc-400 hover:text-white text-sm transition-colors">
                    Cancel
                  </button>
                  <button type="submit" form="productForm" disabled={isSaving}
                    className="bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-black px-6 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20">
                    {isSaving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : editingId ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
