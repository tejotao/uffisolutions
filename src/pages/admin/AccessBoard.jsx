/**
 * AccessBoard — Kanban-style drag-and-drop for granting product access to users.
 *
 * Left column : draggable product cards
 * Right grid  : droppable user cards  (drag a product onto a user → grants access)
 *
 * Also supports: multi-select on the left → click "Assign" button on any user card.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Users, Search, Filter, ChevronDown, ChevronUp,
  Check, X, Loader2, RefreshCw, ShieldCheck, ArrowLeft,
  GripVertical, AlertCircle, CheckCircle, Trash, CalendarDays, Infinity as LucideInfinity,
} from 'lucide-react';
import { fetchAllProductsAllLanguages, fetchAllUsers } from '@/lib/catalogQueries';
import {
  getAllAccessSummary,
  getAccessesForUser,
  grantProductAccess,
  grantMultipleProductAccess,
  revokeProductAccess,
  updateAccessExpiry,
  isAccessValid,
  daysUntilExpiry,
} from '@/lib/accessQueries';
import AdminLayout from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const flag = (lang) => {
  if (!lang) return '🌐';
  const l = lang.toLowerCase();
  if (l.includes('pt')) return '🇧🇷';
  if (l.includes('en')) return '🇬🇧';
  if (l.includes('es')) return '🇪🇸';
  if (l.includes('it')) return '🇮🇹';
  return '🌐';
};

const roleBadgeCls = (role) =>
  role === 'super_admin' ? 'bg-red-500/15 text-red-400 border-red-500/25' :
  role === 'admin'       ? 'bg-purple-500/15 text-purple-400 border-purple-500/25' :
                           'bg-blue-500/15 text-blue-400 border-blue-500/25';

// ─── Draggable Product Card (left column) ─────────────────────────────────────

function DraggableProduct({ product, selected, onToggle, isDraggingThis }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `product::${product.id}`,
    data: { product },
  });

  const style = transform && !isDragging
    ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)` }
    : undefined;

  const isFree = product.is_free || parseFloat(product.price || 0) === 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-zinc-900 border rounded-xl flex items-center gap-2.5 px-3 py-2.5 select-none transition-all duration-150',
        isDragging || isDraggingThis
          ? 'opacity-40 border-zinc-700'
          : selected
          ? 'border-amber-500/60 bg-amber-500/5'
          : 'border-zinc-800 hover:border-zinc-700'
      )}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(product.id)}
        className={cn(
          'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all',
          selected ? 'bg-amber-500 border-amber-500' : 'border-zinc-600 bg-zinc-800'
        )}
      >
        {selected && <Check size={9} className="text-black" strokeWidth={3} />}
      </button>

      {/* Drag handle */}
      <div
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing text-zinc-700 hover:text-zinc-500 transition-colors shrink-0"
        title="Drag to a user to grant access"
      >
        <GripVertical size={14} />
      </div>

      {/* Product info */}
      <div className="flex-grow min-w-0">
        <p className="text-sm font-medium text-white truncate leading-tight">
          {product.title || product.name}
        </p>
        {product.product_code && (
          <p className="text-[10px] text-zinc-600 font-mono mt-0.5">{product.product_code}</p>
        )}
      </div>

      {/* Right badges */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-sm">{flag(product.language)}</span>
        <span className={cn(
          'text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide',
          isFree
            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
        )}>
          {isFree ? 'Free' : 'Pro'}
        </span>
      </div>
    </div>
  );
}

// ─── Floating overlay card (shown while dragging) ─────────────────────────────

function ProductOverlay({ product }) {
  if (!product) return null;
  const isFree = product.is_free || parseFloat(product.price || 0) === 0;
  return (
    <div className="bg-zinc-800 border border-amber-500/60 rounded-xl flex items-center gap-2.5 px-3 py-2.5 shadow-2xl shadow-black/60 w-64 rotate-2 scale-105">
      <GripVertical size={14} className="text-amber-400 shrink-0" />
      <div className="flex-grow min-w-0">
        <p className="text-sm font-semibold text-white truncate">{product.title || product.name}</p>
      </div>
      <span className="text-sm">{flag(product.language)}</span>
      <span className={cn(
        'text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase',
        isFree ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
               : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      )}>
        {isFree ? 'Free' : 'Pro'}
      </span>
    </div>
  );
}

// ─── Droppable User Card (right grid) ─────────────────────────────────────────

function DroppableUser({
  user, summary, allProducts,
  selectedProductIds, onAssignSelected,
  currentUserId, onRefresh,
}) {
  const { toast } = useToast();
  const { setNodeRef, isOver } = useDroppable({
    id: `user::${user.id}`,
    data: { user },
  });

  const [expanded, setExpanded] = useState(false);
  const [accesses, setAccesses] = useState([]);
  const [loadingAccesses, setLoadingAccesses] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [revokingId, setRevokingId] = useState(null);
  const [editingExpiryId, setEditingExpiryId] = useState(null);
  const [editingExpiryValue, setEditingExpiryValue] = useState('');

  const info = summary.get(user.id) || { active: 0, total: 0, productIds: [] };
  const initial = user.email?.charAt(0).toUpperCase() ?? '?';

  const loadAccesses = useCallback(async () => {
    setLoadingAccesses(true);
    const { data } = await getAccessesForUser(user.id);
    setAccesses(data);
    setLoadingAccesses(false);
  }, [user.id]);

  useEffect(() => {
    if (expanded) loadAccesses();
  }, [expanded, loadAccesses]);

  const handleAssignSelected = async () => {
    if (selectedProductIds.size === 0) return;
    setAssigning(true);
    try {
      const { errors } = await grantMultipleProductAccess({
        userId: user.id,
        productIds: [...selectedProductIds],
        grantedBy: currentUserId,
      });
      if (errors.length > 0) throw new Error(`${errors.length} failed`);
      toast({
        title: `${selectedProductIds.size} product${selectedProductIds.size > 1 ? 's' : ''} granted to ${user.name !== '-' ? user.name : user.email}`,
        className: 'border-emerald-500 bg-zinc-900 text-white',
      });
      onRefresh();
      if (expanded) loadAccesses();
    } catch (err) {
      toast({ title: err.message || 'Error granting access', variant: 'destructive' });
    } finally {
      setAssigning(false);
    }
  };

  const handleRevoke = async (accessId, productId) => {
    setRevokingId(accessId);
    try {
      const { error } = await revokeProductAccess(user.id, productId);
      if (error) throw error;
      toast({ title: 'Access revoked', className: 'border-zinc-700 bg-zinc-900 text-white' });
      onRefresh();
      loadAccesses();
    } catch {
      toast({ title: 'Error revoking', variant: 'destructive' });
    } finally {
      setRevokingId(null);
    }
  };

  const handleUpdateExpiry = async (accessId) => {
    try {
      const { error } = await updateAccessExpiry(accessId, editingExpiryValue || null);
      if (error) throw error;
      toast({ title: 'Expiry updated', className: 'border-emerald-500 bg-zinc-900 text-white' });
      setEditingExpiryId(null);
      loadAccesses();
    } catch {
      toast({ title: 'Error updating expiry', variant: 'destructive' });
    }
  };

  const handleSetLifetime = async (accessId) => {
    try {
      const { error } = await updateAccessExpiry(accessId, null);
      if (error) throw error;
      toast({ title: '∞ Set to Lifetime', description: 'Permanent access — no expiry.', className: 'border-purple-500 bg-zinc-900 text-white' });
      loadAccesses();
    } catch {
      toast({ title: 'Error updating expiry', variant: 'destructive' });
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-2xl border flex flex-col transition-all duration-200',
        isOver
          ? 'border-amber-400 bg-amber-500/8 shadow-lg shadow-amber-500/10 scale-[1.02]'
          : 'border-zinc-800 bg-zinc-900/60'
      )}
    >
      {/* ── User header ── */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border transition-colors',
            isOver
              ? 'bg-amber-500 text-black border-amber-400'
              : 'bg-zinc-800 text-amber-400 border-zinc-700'
          )}>
            {isOver ? <Package size={18} /> : initial}
          </div>

          <div className="flex-grow min-w-0">
            <p className="font-semibold text-white text-sm truncate">
              {user.name !== '-' ? user.name : user.email.split('@')[0]}
            </p>
            <p className="text-xs text-zinc-600 truncate">{user.email}</p>
            <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded border mt-1 inline-block', roleBadgeCls(user.role))}>
              {user.role.toUpperCase()}
            </span>
          </div>

          {/* Product count badge */}
          <div className="text-right shrink-0">
            <div className={cn(
              'text-lg font-black',
              info.active > 0 ? 'text-amber-400' : 'text-zinc-700'
            )}>
              {info.active}
            </div>
            <div className="text-[9px] text-zinc-600 uppercase tracking-wide">products</div>
          </div>
        </div>

        {/* Drop zone hint */}
        {isOver && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 border border-dashed border-amber-500/50 rounded-xl py-2 text-center text-xs text-amber-400 font-medium"
          >
            Drop to grant access
          </motion.div>
        )}

        {/* Assign selected button */}
        {selectedProductIds.size > 0 && !isOver && (
          <button
            onClick={handleAssignSelected}
            disabled={assigning}
            className="mt-3 w-full py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-400 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            {assigning
              ? <><RefreshCw size={11} className="animate-spin" /> Assigning...</>
              : <><ShieldCheck size={11} /> Assign {selectedProductIds.size} selected</>
            }
          </button>
        )}
      </div>

      {/* ── Expand toggle ── */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="px-4 pb-3 flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors font-medium"
      >
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {expanded ? 'Hide' : 'Show'} {info.total} product{info.total !== 1 ? 's' : ''}
      </button>

      {/* ── Expanded product list with full management ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden border-t border-zinc-800"
          >
            <div className="p-3 space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
              {loadingAccesses ? (
                <div className="flex items-center gap-2 text-zinc-600 text-xs py-4 justify-center">
                  <RefreshCw size={12} className="animate-spin" /> Loading products...
                </div>
              ) : accesses.length === 0 ? (
                <p className="text-xs text-zinc-700 italic text-center py-4">No products assigned yet.</p>
              ) : (
                accesses.map((access) => {
                  const prod  = access.product;
                  const valid = isAccessValid(access.expiry_date);
                  const days  = daysUntilExpiry(access.expiry_date);
                  const isEditingThis = editingExpiryId === access.id;

                  return (
                    <div
                      key={access.id}
                      className={cn(
                        'rounded-xl border p-2.5 text-xs',
                        valid ? 'bg-zinc-800/50 border-zinc-700/60' : 'bg-red-500/5 border-red-500/20'
                      )}
                    >
                      {/* Product name row */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', valid ? 'bg-emerald-400' : 'bg-red-400')} />
                        <span className="flex-grow font-medium text-white truncate leading-tight">
                          {prod?.title || prod?.name || `Product ${access.product_id.slice(0, 8)}`}
                        </span>
                        <span className="text-sm shrink-0">{flag(prod?.language)}</span>
                      </div>

                      {/* Expiry row */}
                      <div className="flex items-center gap-1.5 pl-3.5">
                        <CalendarDays size={10} className="text-zinc-600 shrink-0" />
                        {isEditingThis ? (
                          <div className="flex items-center gap-1 flex-grow">
                            <input
                              type="date"
                              value={editingExpiryValue}
                              onChange={(e) => setEditingExpiryValue(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              className="bg-zinc-950 border border-zinc-600 rounded px-1.5 py-0.5 text-[10px] text-white focus:outline-none focus:border-amber-500 flex-grow"
                            />
                            <button
                              onClick={() => handleUpdateExpiry(access.id)}
                              className="text-emerald-400 hover:text-emerald-300 p-0.5"
                              title="Save expiry"
                            >
                              <Check size={11} />
                            </button>
                            <button
                              onClick={() => { setEditingExpiryId(null); }}
                              className="text-zinc-500 hover:text-white p-0.5"
                              title="Cancel"
                            >
                              <X size={11} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 flex-grow flex-wrap">
                            {/* Expiry badge */}
                            {access.expiry_date ? (
                              <span className={cn(
                                'text-[9px] font-semibold px-1.5 py-0.5 rounded-full border',
                                days < 0  ? 'text-red-400 bg-red-500/10 border-red-500/25' :
                                days <= 14 ? 'text-amber-400 bg-amber-500/10 border-amber-500/25' :
                                             'text-emerald-400 bg-emerald-500/10 border-emerald-500/25'
                              )}>
                                {days < 0
                                  ? `Expired ${Math.abs(days)}d ago`
                                  : days === 0 ? 'Expires today'
                                  : `${days}d · ${access.expiry_date}`}
                              </span>
                            ) : (
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/25">
                                ∞ Lifetime
                              </span>
                            )}

                            {/* Action buttons */}
                            <div className="flex items-center gap-1 ml-auto">
                              {/* Edit expiry */}
                              <button
                                onClick={() => {
                                  setEditingExpiryId(access.id);
                                  setEditingExpiryValue(access.expiry_date || '');
                                }}
                                className="text-zinc-600 hover:text-zinc-300 p-0.5 transition-colors"
                                title="Edit expiry date"
                              >
                                <CalendarDays size={11} />
                              </button>

                              {/* Set lifetime */}
                              {access.expiry_date && (
                                <button
                                  onClick={() => handleSetLifetime(access.id)}
                                  className="text-zinc-600 hover:text-purple-400 p-0.5 transition-colors text-[9px] font-bold"
                                  title="Set as Lifetime (no expiry)"
                                >
                                  ∞
                                </button>
                              )}

                              {/* Revoke */}
                              <button
                                onClick={() => handleRevoke(access.id, access.product_id)}
                                disabled={revokingId === access.id}
                                className="text-zinc-600 hover:text-red-400 transition-colors p-0.5"
                                title="Revoke access"
                              >
                                {revokingId === access.id
                                  ? <RefreshCw size={11} className="animate-spin" />
                                  : <Trash size={11} />
                                }
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Board ────────────────────────────────────────────────────────────────

export default function AccessBoard({ user: adminUser }) {
  const navigate  = useNavigate();
  const { toast } = useToast();

  const [products, setProducts] = useState([]);
  const [users, setUsers]       = useState([]);
  const [summary, setSummary]   = useState(new Map());
  const [loading, setLoading]   = useState(true);

  const [productSearch, setProductSearch] = useState('');
  const [productFilter, setProductFilter] = useState('all'); // all | free | premium
  const [userSearch, setUserSearch]       = useState('');

  const [selectedIds, setSelectedIds] = useState(new Set()); // selected product IDs

  const [draggingProduct, setDraggingProduct] = useState(null);
  const [grantingDropId, setGrantingDropId]   = useState(null); // userId being granted (toast feedback)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // ── Load data ──
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, usrs, sum] = await Promise.all([
        fetchAllProductsAllLanguages(),
        fetchAllUsers(),
        getAllAccessSummary(),
      ]);
      setProducts(prods || []);
      setUsers((usrs || []).map((u) => ({
        id: u.id,
        name: u.full_name || '-',
        email: u.email,
        role: u.role || (u.is_admin ? 'admin' : 'user'),
        emailConfirmed: !!u.email_confirmed_at,
      })));
      setSummary(sum);
    } catch {
      toast({ title: 'Failed to load board data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── DnD handlers ──
  const handleDragStart = ({ active }) => {
    setDraggingProduct(active.data.current?.product ?? null);
  };

  const handleDragEnd = async ({ active, over }) => {
    setDraggingProduct(null);
    if (!over) return;

    const product  = active.data.current?.product;
    const dropUser = over.data.current?.user;
    if (!product || !dropUser) return;

    // Check if already granted
    const existing = summary.get(dropUser.id);
    if (existing?.productIds.includes(product.id)) {
      toast({
        title: 'Already assigned',
        description: `${dropUser.name !== '-' ? dropUser.name : dropUser.email} already has access to this product.`,
      });
      return;
    }

    setGrantingDropId(dropUser.id);
    try {
      const { error } = await grantProductAccess({
        userId: dropUser.id,
        productId: product.id,
        grantedBy: adminUser?.id,
      });
      if (error) throw error;

      toast({
        title: `Access granted!`,
        description: `"${product.title || product.name}" → ${dropUser.name !== '-' ? dropUser.name : dropUser.email}`,
        className: 'border-emerald-500 bg-zinc-900 text-white',
      });
      // Optimistic update on summary map
      setSummary((prev) => {
        const next = new Map(prev);
        const entry = next.get(dropUser.id) || { active: 0, total: 0, productIds: [] };
        next.set(dropUser.id, {
          active: entry.active + 1,
          total: entry.total + 1,
          productIds: [...entry.productIds, product.id],
        });
        return next;
      });
    } catch {
      toast({ title: 'Error granting access', variant: 'destructive' });
    } finally {
      setGrantingDropId(null);
    }
  };

  // ── Checkbox toggle ──
  const toggleProduct = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  // ── Filtered lists ──
  const filteredProducts = products.filter((p) => {
    const isFree = p.is_free || parseFloat(p.price || 0) === 0;
    if (productFilter === 'free' && !isFree) return false;
    if (productFilter === 'premium' && isFree) return false;
    if (!productSearch) return true;
    const q = productSearch.toLowerCase();
    return (p.title || p.name || '').toLowerCase().includes(q) ||
           (p.product_code || '').toLowerCase().includes(q);
  });

  const filteredUsers = users.filter((u) => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
  });

  const allSelected = filteredProducts.length > 0 && selectedIds.size === filteredProducts.length;

  // ── Render ──
  return (
    <AdminLayout user={adminUser}>
      <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>

        {/* ── Toolbar ── */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-4 flex-wrap bg-zinc-950/60">
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={15} /> Back to Users
          </button>
          <div className="h-5 w-px bg-zinc-800" />
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck size={16} className="text-amber-400" /> Access Board
            </h1>
            <p className="text-xs text-zinc-600">Drag a product onto a user — or select + click "Assign"</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={load}
              className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw size={15} />
            </button>
            <div className="text-xs text-zinc-600">
              {products.length} products · {users.length} users
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex-grow flex items-center justify-center gap-3 text-zinc-600">
            <Loader2 size={24} className="animate-spin" />
            <span className="text-sm">Loading board...</span>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex flex-col lg:flex-row flex-grow overflow-hidden">

              {/* ══ LEFT: Products ══ */}
              <div className="w-full lg:w-72 shrink-0 flex flex-col max-h-[40vh] lg:max-h-none border-b lg:border-b-0 lg:border-r border-zinc-800 bg-zinc-950/40">

                {/* Product column header */}
                <div className="px-4 pt-4 pb-3 space-y-2.5 shrink-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Package size={12} className="text-amber-400" /> Products
                      <span className="ml-1 text-zinc-700 font-normal normal-case tracking-normal">
                        ({filteredProducts.length})
                      </span>
                    </h2>
                    <button
                      onClick={toggleSelectAll}
                      className="text-[10px] text-amber-400 hover:text-amber-300 font-medium transition-colors"
                    >
                      {allSelected ? 'None' : 'All'}
                    </button>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  {/* Filter pills */}
                  <div className="flex gap-1.5">
                    {[['all', 'All'], ['free', 'Free'], ['premium', 'Premium']].map(([v, l]) => (
                      <button
                        key={v}
                        onClick={() => setProductFilter(v)}
                        className={cn(
                          'text-[10px] px-2.5 py-1 rounded-full border font-medium transition-colors',
                          productFilter === v
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700'
                        )}
                      >
                        {l}
                      </button>
                    ))}
                  </div>

                  {/* Selected count */}
                  {selectedIds.size > 0 && (
                    <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5">
                      <span className="text-xs text-amber-400 font-semibold">
                        {selectedIds.size} selected
                      </span>
                      <button
                        onClick={() => setSelectedIds(new Set())}
                        className="text-zinc-500 hover:text-white transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Draggable product list */}
                <div className="flex-grow overflow-y-auto px-3 pb-4 space-y-1.5 custom-scrollbar">
                  {filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-zinc-700 gap-2">
                      <Package size={28} className="opacity-20" />
                      <p className="text-xs">No products found</p>
                    </div>
                  ) : (
                    filteredProducts.map((p) => (
                      <DraggableProduct
                        key={p.id}
                        product={p}
                        selected={selectedIds.has(p.id)}
                        onToggle={toggleProduct}
                        isDraggingThis={draggingProduct?.id === p.id}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* ══ RIGHT: Users ══ */}
              <div className="flex-grow min-h-0 flex flex-col overflow-hidden">

                {/* User area header */}
                <div className="px-5 pt-4 pb-3 shrink-0 flex items-center gap-3">
                  <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Users size={12} className="text-blue-400" /> Users
                    <span className="ml-1 text-zinc-700 font-normal normal-case tracking-normal">
                      ({filteredUsers.length})
                    </span>
                  </h2>
                  <div className="relative flex-grow max-w-xs">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  {selectedIds.size > 0 && (
                    <p className="text-xs text-amber-400 font-medium ml-auto shrink-0">
                      ← Click "Assign" on any user to grant {selectedIds.size} product{selectedIds.size > 1 ? 's' : ''}
                    </p>
                  )}
                  {!selectedIds.size && !draggingProduct && (
                    <p className="text-xs text-zinc-700 ml-auto shrink-0">
                      ← Drag a product or select + assign
                    </p>
                  )}
                  {draggingProduct && (
                    <p className="text-xs text-amber-400 animate-pulse ml-auto shrink-0 font-medium">
                      Drop onto a user to grant access →
                    </p>
                  )}
                </div>

                {/* User grid */}
                <div className="flex-grow overflow-y-auto px-5 pb-6 custom-scrollbar">
                  {filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-zinc-700 gap-2">
                      <Users size={28} className="opacity-20" />
                      <p className="text-xs">No users found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {filteredUsers.map((u) => (
                        <DroppableUser
                          key={u.id}
                          user={u}
                          summary={summary}
                          allProducts={products}
                          selectedProductIds={selectedIds}
                          onAssignSelected={() => {}} // handled inside the component
                          currentUserId={adminUser?.id}
                          onRefresh={load}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Floating drag overlay */}
            <DragOverlay dropAnimation={null}>
              {draggingProduct ? <ProductOverlay product={draggingProduct} /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </AdminLayout>
  );
}
