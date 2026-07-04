
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Users, ChevronDown, Check,
  Shield, Filter, AlertTriangle, Key, CheckCircle,
  ShieldCheck, CalendarDays, Trash, RefreshCw, Package,
  Edit2, Trash2, X, Ban, Contact,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import UserProfileModal from '@/components/admin/UserProfileModal';
import { fetchAllProductsAllLanguages, fetchAllUsers, updateUser, deleteUser } from '@/lib/catalogQueries';
import {
  getAllAccessSummary,
  getAccessesForUser,
  grantMultipleProductAccess,
  revokeProductAccess,
  updateAccessExpiry,
  isAccessValid,
  daysUntilExpiry,
} from '@/lib/accessQueries';
import { useToast } from '@/hooks/use-toast';
import { canAccess, isSuperAdmin, ROLES } from '@/lib/rolePermissions';
import { resetPassword } from '@/lib/supabaseAuth';
import { cn, getInitials } from '@/lib/utils';

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

const add12Months = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
};

const ExpiryBadge = ({ expiryDate }) => {
  if (!expiryDate) return <span className="text-[10px] text-zinc-600 italic">∞ Permanent</span>;
  const days = daysUntilExpiry(expiryDate);
  const expired = days < 0;
  const soon = !expired && days <= 14;
  return (
    <span className={cn(
      'text-[10px] font-semibold px-1.5 py-0.5 rounded-full border',
      expired ? 'bg-red-500/10 text-red-400 border-red-500/25' :
      soon    ? 'bg-amber-500/10 text-amber-400 border-amber-500/25' :
                'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
    )}>
      {expired ? `Exp. ${Math.abs(days)}d ago` : days === 0 ? 'Today' : `${days}d · ${expiryDate}`}
    </span>
  );
};

// ─── Batch Grant Modal ─────────────────────────────────────────────────────────

const GrantModal = ({ targetUser, allProducts, grantedBy, existingIds, onClose, onSuccess }) => {
  const { toast } = useToast();
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState(new Set());
  const [expiryDate, setExpiryDate] = useState(add12Months());
  const [step, setStep]             = useState('select'); // 'select' | 'confirm'
  const [granting, setGranting]     = useState(false);

  const available = allProducts.filter((p) => {
    if (existingIds.has(p.id)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (p.title || p.name || '').toLowerCase().includes(q) ||
           (p.product_code || '').toLowerCase().includes(q);
  });

  const toggle    = (id) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => selected.size === available.length ? setSelected(new Set()) : setSelected(new Set(available.map((p) => p.id)));
  const selected_ = allProducts.filter((p) => selected.has(p.id));
  const userName  = targetUser.name !== '-' ? targetUser.name : targetUser.email.split('@')[0];

  const handleGrant = async () => {
    setGranting(true);
    try {
      const { errors } = await grantMultipleProductAccess({
        userId: targetUser.id,
        productIds: [...selected],
        expiryDate,
        grantedBy,
      });
      if (errors.length > 0) throw new Error(`${errors.length} product(s) failed`);
      toast({
        title: `${selected.size} product${selected.size > 1 ? 's' : ''} granted`,
        description: `Access until ${new Date(expiryDate).toLocaleDateString('en-GB')}`,
        className: 'border-emerald-500 bg-zinc-900 text-white',
      });
      onSuccess();
      onClose();
    } catch (err) {
      toast({ title: err.message || 'Error granting access', variant: 'destructive' });
    } finally {
      setGranting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-4 bg-black/85 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-[#111] border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck size={16} className="text-amber-400" />
              {step === 'select' ? 'Select Products' : 'Confirm Grant'}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">For: <span className="text-white font-medium">{userName}</span></p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800">
            <X size={17} />
          </button>
        </div>

        {/* Step 1 — Select */}
        {step === 'select' && (
          <>
            <div className="px-5 pt-4 pb-2 shrink-0 space-y-2.5">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input type="text" placeholder="Search products..." value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">
                  {available.length} available · <span className="text-amber-400 font-semibold">{selected.size} selected</span>
                </span>
                {available.length > 0 && (
                  <button onClick={toggleAll} className="text-xs text-amber-400 hover:text-amber-300 font-medium">
                    {selected.size === available.length ? 'Deselect all' : 'Select all'}
                  </button>
                )}
              </div>
            </div>

            <div className="flex-grow overflow-y-auto px-5 pb-2 space-y-1.5 custom-scrollbar">
              {available.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-zinc-600 gap-2">
                  <CheckCircle size={32} className="text-emerald-500/30" />
                  <p className="text-sm">All products already assigned.</p>
                </div>
              ) : available.map((p) => {
                const checked = selected.has(p.id);
                const isFree  = p.is_free || parseFloat(p.price || 0) === 0;
                return (
                  <label key={p.id} onClick={() => toggle(p.id)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all',
                      checked ? 'bg-amber-500/8 border-amber-500/40' : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                    )}
                  >
                    <div className={cn('w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all',
                      checked ? 'bg-amber-500 border-amber-500' : 'border-zinc-600 bg-zinc-900')}>
                      {checked && <Check size={9} className="text-black" strokeWidth={3} />}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-medium text-white truncate">{p.title || p.name}</p>
                      {p.product_code && <p className="text-[10px] text-zinc-600 font-mono">{p.product_code}</p>}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-sm">{flag(p.language)}</span>
                      <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase',
                        isFree ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                               : 'text-amber-400 bg-amber-500/10 border-amber-500/20')}>
                        {isFree ? 'Free' : 'Pro'}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="border-t border-zinc-800 px-5 py-4 shrink-0 space-y-3">
              <div className="flex items-end gap-3">
                <div className="flex-grow">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">
                    Access Expires <span className="font-normal text-zinc-700 normal-case">(applies to all selected)</span>
                  </label>
                  <input type="date" value={expiryDate} min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
                </div>
                <button onClick={() => setExpiryDate(add12Months())}
                  className="text-xs text-zinc-500 hover:text-amber-400 border border-zinc-700 hover:border-amber-500/40 px-3 py-2 rounded-xl transition-colors whitespace-nowrap">
                  Reset 12m
                </button>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={onClose} className="px-4 py-2 text-zinc-400 hover:text-white text-sm">Cancel</button>
                <button onClick={() => setStep('confirm')} disabled={selected.size === 0}
                  className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black px-5 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2">
                  Review {selected.size > 0 && `(${selected.size})`} →
                </button>
              </div>
            </div>
          </>
        )}

        {/* Step 2 — Confirm */}
        {step === 'confirm' && (
          <>
            <div className="flex-grow overflow-y-auto px-5 py-5 space-y-4">
              <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5">
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-3">Summary</p>
                <div className="space-y-2 mb-4">
                  <div className="flex gap-2">
                    <span className="text-xs text-zinc-500 w-14 shrink-0 pt-0.5">User</span>
                    <span className="text-sm font-semibold text-white">{userName}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs text-zinc-500 w-14 shrink-0 pt-0.5">Expires</span>
                    <span className="text-sm font-semibold text-amber-400">
                      {new Date(expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div className="border-t border-zinc-800 pt-4 space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-2">Products ({selected_.length})</p>
                  {selected_.map((p) => (
                    <div key={p.id} className="flex items-center gap-2 text-sm">
                      <Check size={13} className="text-emerald-400 shrink-0" />
                      <span className="text-white font-medium truncate">{p.title || p.name}</span>
                      <span className="text-zinc-600 text-xs shrink-0">{flag(p.language)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-zinc-500 text-center leading-relaxed">
                <span className="text-white font-semibold">{userName}</span> will receive{' '}
                <span className="text-amber-400 font-semibold">{selected_.length} product{selected_.length !== 1 ? 's' : ''}</span>{' '}
                until <span className="text-amber-400 font-semibold">
                  {new Date(expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>.
              </p>
            </div>
            <div className="border-t border-zinc-800 px-5 py-4 shrink-0 flex justify-between gap-3">
              <button onClick={() => setStep('select')} className="text-sm text-zinc-400 hover:text-white transition-colors">← Back</button>
              <div className="flex gap-2">
                <button onClick={onClose} className="px-4 py-2 text-zinc-400 hover:text-white text-sm">Cancel</button>
                <button onClick={handleGrant} disabled={granting}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white px-6 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20">
                  {granting ? <><RefreshCw size={14} className="animate-spin" /> Granting...</> : <><CheckCircle size={14} /> Confirm & Grant</>}
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

// ─── Access drawer (expanded per user) ────────────────────────────────────────

const AccessDrawer = ({ userId, onRefresh }) => {
  const { toast } = useToast();
  const [accesses, setAccesses]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [revokingId, setRevokingId]   = useState(null);
  const [editingId, setEditingId]     = useState(null);
  const [editingVal, setEditingVal]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await getAccessesForUser(userId);
    setAccesses(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const revoke = async (accessId, productId) => {
    setRevokingId(accessId);
    try {
      const { error } = await revokeProductAccess(userId, productId);
      if (error) throw error;
      toast({ title: 'Access revoked', className: 'border-zinc-700 bg-zinc-900 text-white' });
      load(); onRefresh();
    } catch { toast({ title: 'Error revoking', variant: 'destructive' }); }
    finally { setRevokingId(null); }
  };

  const saveExpiry = async (accessId) => {
    try {
      const { error } = await updateAccessExpiry(accessId, editingVal || null);
      if (error) throw error;
      toast({ title: editingVal ? 'Expiry updated' : '∞ Set to Permanent', className: 'border-emerald-500 bg-zinc-900 text-white' });
      setEditingId(null); load();
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  if (loading) return (
    <div className="px-6 py-4 bg-zinc-950/60 border-t border-zinc-800 flex items-center gap-2 text-zinc-700 text-xs">
      <RefreshCw size={12} className="animate-spin" /> Loading products...
    </div>
  );

  return (
    <div className="px-6 py-4 bg-zinc-950/60 border-t border-zinc-800">
      {accesses.length === 0 ? (
        <p className="text-xs text-zinc-700 italic">No products assigned to this user.</p>
      ) : (
        <div className="space-y-2">
          {accesses.map((access) => {
            const prod    = access.product;
            const valid   = isAccessValid(access.expiry_date);
            const editing = editingId === access.id;
            return (
              <div key={access.id} className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl border text-xs',
                valid ? 'bg-zinc-900/70 border-zinc-800' : 'bg-red-500/5 border-red-500/20'
              )}>
                {/* Status */}
                <span className={cn('w-2 h-2 rounded-full shrink-0', valid ? 'bg-emerald-400' : 'bg-red-400')} />

                {/* Product name */}
                <div className="flex-grow min-w-0">
                  <p className="text-zinc-200 font-medium truncate">
                    {prod?.title || prod?.name || `Product ${access.product_id?.slice(0, 8)}`}
                  </p>
                  {prod?.product_type && prod.product_type !== 'content' && (
                    <span className="text-[9px] text-zinc-600 uppercase tracking-wider">{prod.product_type}</span>
                  )}
                </div>

                {/* Language */}
                <span className="text-sm shrink-0">{flag(prod?.language)}</span>

                {/* Expiry edit */}
                {editing ? (
                  <div className="flex items-center gap-1.5">
                    <input type="date" value={editingVal} onChange={(e) => setEditingVal(e.target.value)}
                      className="bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-0.5 text-[10px] text-white focus:outline-none focus:border-amber-500 w-28" />
                    <button onClick={() => saveExpiry(access.id)} className="text-emerald-400 hover:text-emerald-300"><Check size={12} /></button>
                    <button onClick={() => { setEditingVal(''); saveExpiry(access.id); }}
                      title="Set permanent" className="text-purple-400 hover:text-purple-300 text-[11px] font-bold">∞</button>
                    <button onClick={() => setEditingId(null)} className="text-zinc-500 hover:text-white"><X size={12} /></button>
                  </div>
                ) : (
                  <button onClick={() => { setEditingId(access.id); setEditingVal(access.expiry_date || ''); }}
                    className="hover:opacity-70 transition-opacity">
                    <ExpiryBadge expiryDate={access.expiry_date} />
                  </button>
                )}

                {/* Revoke */}
                <button onClick={() => revoke(access.id, access.product_id)}
                  disabled={revokingId === access.id}
                  className="text-zinc-600 hover:text-red-400 transition-colors p-0.5 shrink-0" title="Revoke">
                  {revokingId === access.id ? <RefreshCw size={12} className="animate-spin" /> : <Trash size={12} />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Role badge ───────────────────────────────────────────────────────────────

const roleBadge = (role) => {
  const cls =
    role === ROLES.SUPER_ADMIN ? 'bg-red-500/15 text-red-400 border-red-500/25' :
    role === ROLES.ADMIN       ? 'bg-purple-500/15 text-purple-400 border-purple-500/25' :
    role === ROLES.MODERATOR   ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' :
                                 'bg-blue-500/15 text-blue-400 border-blue-500/25';
  const label =
    role === ROLES.SUPER_ADMIN ? 'Super Admin' :
    role === ROLES.ADMIN       ? 'Admin' :
    role === ROLES.MODERATOR   ? 'Moderator' : 'User';
  return <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${cls}`}>{label}</span>;
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminUsers({ user }) {
  const { toast }  = useToast();
  const navigate   = useNavigate();

  const [users, setUsers]         = useState([]);
  const [products, setProducts]   = useState([]);
  const [summary, setSummary]     = useState(new Map());
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter]   = useState('all');
  const [expandedId, setExpandedId]   = useState(null);
  const [grantTarget, setGrantTarget] = useState(null);
  const [profileTarget, setProfileTarget] = useState(null);

  const permissions = {
    canRead:          canAccess(user, 'users', 'read'),
    canUpdate:        canAccess(user, 'users', 'update'),
    canDelete:        canAccess(user, 'users', 'delete'),
    canBlock:         canAccess(user, 'users', 'block'),
    canResetPassword: canAccess(user, 'users', 'resetPassword'),
    canGrantProducts: canAccess(user, 'users', 'update'),
  };

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [prods, usrs, sum] = await Promise.all([
        fetchAllProductsAllLanguages(),
        fetchAllUsers(),
        getAllAccessSummary(),
      ]);
      setProducts(prods || []);
      setSummary(sum);
      setUsers((usrs || []).map((u) => ({
        id: u.id,
        name: u.full_name || u.name || '-',
        email: u.email || '',
        role: u.role || (u.is_admin ? ROLES.ADMIN : ROLES.USER),
        clientCode: u.client_code || null,
        status: u.status || 'active',
      })));
    } catch {
      toast({ title: 'Failed to load users', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (permissions.canRead) load();
    else setIsLoading(false);
  }, [permissions.canRead, load]);

  if (!permissions.canRead) {
    return (
      <AdminLayout user={user}>
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <AlertTriangle size={48} className="text-red-500" />
          <h2 className="text-xl font-bold">Access Denied</h2>
        </div>
      </AdminLayout>
    );
  }

  const resetPwd = async (email, e) => {
    e.stopPropagation();
    if (!permissions.canResetPassword) return;
    if (!window.confirm(`Send password reset to ${email}?`)) return;
    const { success } = await resetPassword(email);
    toast(success
      ? { title: 'Reset email sent', className: 'border-emerald-500 bg-zinc-900 text-white' }
      : { title: 'Error sending reset', variant: 'destructive' }
    );
  };

  const deleteU = async (id, e) => {
    e.stopPropagation();
    if (!permissions.canDelete) return;
    if (!window.confirm('Permanently erase this profile? Use only for legal data-erasure requests (LGPD/GDPR) — this removes the profile row and cannot be undone. For blocking access, use "Block" instead.')) return;
    try {
      const { error } = await deleteUser(id);
      if (error) throw error;
      toast({ title: 'User data erased' });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      toast({ title: 'Error deleting user', variant: 'destructive' });
    }
  };

  const toggleBlock = async (u, e) => {
    e.stopPropagation();
    if (!permissions.canBlock) return;
    const blocking = u.status !== 'blocked';

    if (blocking) {
      const reason = window.prompt(`Block ${u.email}? Optional reason (visible only in this admin panel):`, '');
      if (reason === null) return;
      try {
        const { error } = await updateUser(u.id, {
          status: 'blocked',
          blocked_at: new Date().toISOString(),
          blocked_reason: reason || null,
          blocked_by: user?.id || null,
        });
        if (error) throw error;
        toast({ title: `${u.email} blocked`, className: 'border-red-500 bg-zinc-900 text-white' });
        setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, status: 'blocked' } : x)));
      } catch {
        toast({ title: 'Error blocking user', variant: 'destructive' });
      }
    } else {
      if (!window.confirm(`Unblock ${u.email}? They will regain full access immediately.`)) return;
      try {
        const { error } = await updateUser(u.id, {
          status: 'active',
          blocked_at: null,
          blocked_reason: null,
          blocked_by: null,
        });
        if (error) throw error;
        toast({ title: `${u.email} unblocked`, className: 'border-emerald-500 bg-zinc-900 text-white' });
        setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, status: 'active' } : x)));
      } catch {
        toast({ title: 'Error unblocking user', variant: 'destructive' });
      }
    }
  };

  const filtered = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      ((u.name || '').toLowerCase().includes(q) ||
       (u.email || '').toLowerCase().includes(q) ||
       (u.clientCode || '').toLowerCase().includes(q)) &&
      (roleFilter === 'all' || u.role === roleFilter)
    );
  });

  return (
    <AdminLayout user={user}>
      <div className="px-6 py-8 max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-800">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-3">
              <Users className="text-amber-400 w-6 h-6" /> Users
            </h1>
            <p className="text-zinc-500 text-sm mt-0.5">
              {filtered.length} user{filtered.length !== 1 ? 's' : ''} · Click a row to view their product access
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/access-board')}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          >
            <ShieldCheck size={14} className="text-amber-400" /> Access Board
          </button>
        </div>

        {/* ── Filters ── */}
        <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input type="text" placeholder="Search by name or email..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors" />
          </div>
          <div className="relative">
            <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 appearance-none">
              <option value="all">All Roles</option>
              <option value={ROLES.USER}>User</option>
              <option value={ROLES.MODERATOR}>Moderator</option>
              <option value={ROLES.ADMIN}>Admin</option>
              <option value={ROLES.SUPER_ADMIN}>Super Admin</option>
            </select>
          </div>
        </div>

        {/* ── List ── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-zinc-600 gap-2">
            <RefreshCw size={16} className="animate-spin" /> Loading users from Supabase...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-zinc-600">
            <Users size={36} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">No users found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((u) => {
              const info       = summary.get(u.id) || { active: 0, total: 0, productIds: [] };
              const isExpanded = expandedId === u.id;
              const expired    = info.total - info.active;

              return (
                <motion.div key={u.id} layout
                  className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-colors">

                  {/* ── Row ── */}
                  <div
                    className="flex items-center gap-3 px-5 py-4 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : u.id)}
                  >
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold text-amber-400 shrink-0">
                      {getInitials(u.name !== '-' ? u.name : null, u.email)}
                    </div>

                    {/* Name + email */}
                    <div className="flex-grow min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <span className="font-semibold text-white text-sm">
                          {u.name !== '-' ? u.name : u.email.split('@')[0]}
                        </span>
                        {roleBadge(u.role)}
                        {u.status === 'blocked' && (
                          <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded border bg-red-500/15 text-red-400 border-red-500/25">
                            <Ban size={9} /> Blocked
                          </span>
                        )}
                        {u.clientCode && (
                          <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono">{u.clientCode}</span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 truncate">{u.email}</p>
                    </div>

                    {/* Product count */}
                    <div className="hidden sm:flex flex-col items-center shrink-0 w-14">
                      <span className={cn('text-xl font-black', info.active > 0 ? 'text-amber-400' : 'text-zinc-700')}>
                        {info.active}
                      </span>
                      {expired > 0 && <span className="text-[9px] text-red-400">{expired} exp.</span>}
                      <span className="text-[9px] text-zinc-600 uppercase tracking-wide">products</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {permissions.canGrantProducts && (
                        <button onClick={() => setGrantTarget(u)} title="Grant Access"
                          className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-2.5 py-1.5 rounded-lg transition-colors">
                          <ShieldCheck size={12} /> Grant
                        </button>
                      )}
                      {permissions.canUpdate && (
                        <button onClick={(e) => { e.stopPropagation(); setProfileTarget(u); }} title="View Profile"
                          className="p-2 text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors">
                          <Contact size={14} />
                        </button>
                      )}
                      {permissions.canResetPassword && (
                        <button onClick={(e) => resetPwd(u.email, e)} title="Reset Password"
                          className="p-2 text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                          <Key size={14} />
                        </button>
                      )}
                      {permissions.canBlock && !isSuperAdmin(u.email) && (
                        <button onClick={(e) => toggleBlock(u, e)}
                          title={u.status === 'blocked' ? 'Unblock user' : 'Block user'}
                          className={cn('p-2 rounded-lg transition-colors',
                            u.status === 'blocked'
                              ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20'
                              : 'text-zinc-500 hover:text-red-400 hover:bg-red-500/10')}>
                          <Ban size={14} />
                        </button>
                      )}
                      {permissions.canDelete && !isSuperAdmin(u.email) && (
                        <button onClick={(e) => deleteU(u.id, e)} title="Erase user data (LGPD/GDPR)"
                          className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                      <ChevronDown size={15} className={cn('text-zinc-600 transition-transform duration-200', isExpanded && 'rotate-180')} />
                    </div>
                  </div>

                  {/* ── Expanded: products list ── */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <AccessDrawer userId={u.id} onRefresh={load} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Grant Modal ── */}
      <AnimatePresence>
        {grantTarget && (
          <GrantModal
            key={grantTarget.id}
            targetUser={grantTarget}
            allProducts={products}
            grantedBy={user?.id}
            existingIds={new Set(summary.get(grantTarget.id)?.productIds || [])}
            onClose={() => setGrantTarget(null)}
            onSuccess={load}
          />
        )}
      </AnimatePresence>

      {/* ── Profile Modal ── */}
      <AnimatePresence>
        {profileTarget && (
          <UserProfileModal
            key={profileTarget.id}
            targetUser={profileTarget}
            isSelf={profileTarget.id === user?.id}
            onClose={() => setProfileTarget(null)}
            onSaved={load}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
