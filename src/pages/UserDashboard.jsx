
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Package, AlertCircle, Search, Home, LogOut,
  User, Loader2, Copy, Download, ExternalLink, Play, CheckCircle, ChevronRight, Clock,
  ShieldAlert, Lock, UserCog, LifeBuoy,
} from 'lucide-react';
import { resolveDeliverables } from '@/components/uffi/AccessModal';
import ProfileModal from '@/components/uffi/ProfileModal';
import SupportModal from '@/components/support/SupportModal';
import NotificationBell from '@/components/notifications/NotificationBell';
import { getUserRole, ROLES } from '@/lib/rolePermissions';
import Footer from '@/components/uffi/Footer';
import Logo from '@/components/uffi/Logo';
import { logout } from '@/lib/supabaseAuth';
import { useToast } from '@/components/ui/use-toast';
import { fetchAllProducts } from '@/lib/catalogQueries';
import { getUserPurchases } from '@/lib/purchaseQueries';
import { getMyActiveAccesses, isAccessValid, daysUntilExpiry } from '@/lib/accessQueries';
import { getDeliverablesForProducts } from '@/lib/deliverableQueries';
import { supabase } from '@/lib/supabaseClient';
import { cn, getInitials } from '@/lib/utils';
import { optimizedImageUrl } from '@/lib/imageUrl';

// ─── Constants ────────────────────────────────────────────────────────────────

const LANGUAGE_OPTIONS = [
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English',   flag: '🇬🇧' },
  { code: 'es', name: 'Español',   flag: '🇪🇸' },
  { code: 'it', name: 'Italiano',  flag: '🇮🇹' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getLanguageFlag = (lang) => {
  if (!lang) return '🌐';
  const l = lang.toLowerCase();
  if (l.includes('pt-br') || l === 'pt') return '🇧🇷';
  if (l.includes('en')) return '🇬🇧';
  if (l.includes('es')) return '🇪🇸';
  if (l.includes('it')) return '🇮🇹';
  return '🌐';
};

/**
 * Determine the card action button type from the product's deliverable list.
 * Returns: 'download' | 'view' | null (null = nothing configured)
 */
const resolveActionType = (product) => {
  const items = resolveDeliverables(product);
  if (items.length === 0) return null;
  // If every configured item is a PDF, show "Download" wording; otherwise "Access".
  return items.every((it) => (it.type || '').toLowerCase() === 'pdf') ? 'download' : 'view';
};

// ─── Expiry indicator ─────────────────────────────────────────────────────────

const ExpiryIndicator = ({ expiryDate }) => {
  if (!expiryDate) return null;
  const days = daysUntilExpiry(expiryDate);
  const valid = days >= 0;
  const soon = days >= 0 && days <= 7;

  if (!valid) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-full">
        <AlertCircle size={10} /> Access expired
      </div>
    );
  }
  if (soon) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-full">
        <Clock size={10} /> Expires in {days}d
      </div>
    );
  }
  return null;
};

// ─── ProductCard ──────────────────────────────────────────────────────────────

const ProductCard = ({ product, onFallback, index = 0 }) => {
  const isFree       = product.is_free || parseFloat(product.price) === 0;
  const actionType   = resolveActionType(product);
  const expiryDate   = product._accessExpiry || null;
  const expired      = expiryDate ? !isAccessValid(expiryDate) : false;

  // Category dynamic color — drives border + gradient
  const catColor   = product.category?.color || '#f59e0b';
  const catIcon    = product.category?.icon || product.categoryIcon || '📁';
  const catName    = product.category?.name || product.categoryName || '';

  // Convert hex to rgb for gradient (handles #rrggbb)
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
  };
  const catRgb = hexToRgb(catColor.startsWith('#') && catColor.length === 7 ? catColor : '#f59e0b');

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.05 }}
      className={cn(
        'bg-zinc-900/80 rounded-2xl overflow-hidden flex flex-col group relative',
        'border border-zinc-800/60',
        'hover:shadow-xl hover:-translate-y-0.5',
        'transition-all duration-300'
      )}
      style={{
        // Dynamic left border using category color
        borderLeft: `4px solid ${catColor}`,
        // Glow on hover (via box-shadow fallback)
      }}
    >
      {/* ── Thumbnail ── */}
      <div className="aspect-video relative overflow-hidden flex items-center justify-center bg-zinc-950">
        {product.image_url || product.imageUrl ? (
          <img
            src={optimizedImageUrl(product.image_url || product.imageUrl, { width: 560, height: 315 })}
            alt={product.title || product.name}
            className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-40">
            <span className="text-4xl select-none">{catIcon}</span>
            <span className="text-[10px] text-zinc-600 font-medium">{catName}</span>
          </div>
        )}

        {/* Bottom-fade gradient using category color */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(to top, rgba(${catRgb},0.55) 0%, rgba(9,9,11,0.60) 40%, transparent 100%)`,
          }}
        />

        {/* Featured ribbon */}
        {product.featured && (
          <div className="absolute top-0 right-0 z-10">
            <div
              className="text-[9px] font-black px-2.5 py-1 rounded-bl-xl uppercase tracking-widest text-black shadow-lg"
              style={{ background: catColor }}
            >
              ★ Featured
            </div>
          </div>
        )}

        {/* Bottom row — floating flag + type + free badge */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end z-10">
          <div className="flex items-center gap-2">
            {/* Floating flag — no background, drop-shadow */}
            <span
              className="text-2xl select-none"
              title={`Language: ${product.language}`}
              style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.7)) drop-shadow(0 0 8px rgba(255,255,255,0.15))' }}
            >
              {getLanguageFlag(product.language)}
            </span>

            {/* Product type pill */}
            {product.product_type && product.product_type !== 'content' && (
              <span className="bg-black/50 backdrop-blur-sm text-zinc-200 px-2 py-0.5 text-[9px] rounded-full uppercase tracking-wider border border-white/10">
                {product.product_type}
              </span>
            )}
          </div>

          {/* Free / Premium — glassmorphism */}
          <span className={cn(
            'px-2.5 py-1 backdrop-blur-md rounded-full text-[10px] font-bold border',
            isFree
              ? 'bg-white/10 text-emerald-300 border-emerald-400/30 shadow-sm shadow-emerald-500/20'
              : 'bg-white/10 text-amber-300 border-amber-400/30 shadow-sm shadow-amber-500/20'
          )}>
            {isFree ? '✦ Free' : '✦ Premium'}
          </span>
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="p-4 flex flex-col flex-grow">

        {/* Category chip */}
        {catName && (
          <div className="flex items-center gap-1.5 mb-2.5">
            <span className="text-sm">{catIcon}</span>
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: catColor }}
            >
              {catName}
            </span>
          </div>
        )}

        {/* Product code */}
        {product.product_code && (
          <div
            className="font-black text-center py-0.5 px-3 rounded-md text-[9px] mb-2 tracking-[0.15em] uppercase border"
            style={{
              color: catColor,
              backgroundColor: `rgba(${catRgb},0.08)`,
              borderColor: `rgba(${catRgb},0.25)`,
            }}
          >
            {product.product_code}
          </div>
        )}

        <h3 className="font-bold text-white text-sm mb-1 line-clamp-1 leading-snug group-hover:text-opacity-90 transition-colors">
          {product.title || product.name}
        </h3>
        <p className="text-xs text-zinc-500 line-clamp-2 mb-3 flex-grow leading-relaxed">
          {product.description || 'No description available.'}
        </p>

        {/* Expiry indicator */}
        {expiryDate && (
          <div className="mb-3">
            <ExpiryIndicator expiryDate={expiryDate} />
          </div>
        )}

        {/* Action button — always opens AccessModal, never exposes the URL */}
        <div className="mt-auto pt-3 border-t border-zinc-800/60">
          {expired ? (
            <button
              onClick={() => onFallback(product)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-zinc-800/80 text-zinc-500 flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
            >
              <Lock size={13} /> Access Expired
            </button>
          ) : actionType ? (
            <button
              onClick={() => onFallback(product)}
              className="w-full py-2.5 rounded-xl text-xs font-black transition-all text-black flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${catColor}, ${catColor}cc)`,
                boxShadow: `0 4px 14px rgba(${catRgb},0.30)`,
              }}
            >
              {actionType === 'download'
                ? <><Download size={13} /> Download</>
                : <><Play size={13} className="fill-black" /> Access</>
              }
            </button>
          ) : (
            <button
              onClick={() => onFallback(product)}
              className="w-full py-2.5 rounded-xl text-xs font-black transition-all text-black flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${catColor}, ${catColor}cc)`,
                boxShadow: `0 4px 14px rgba(${catRgb},0.30)`,
              }}
            >
              <Play size={13} className="fill-black" /> Access
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Section header ────────────────────────────────────────────────────────────

const SectionTitle = ({ icon: Icon, label, count, iconColor }) => (
  <div className="flex items-center justify-between mb-5">
    <h2 className="text-sm font-bold text-white flex items-center gap-2">
      <Icon size={15} className={iconColor} />
      {label}
    </h2>
    {count !== undefined && (
      <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
        {count} item{count !== 1 ? 's' : ''}
      </span>
    )}
  </div>
);

// ─── Main component ────────────────────────────────────────────────────────────

export default function UserDashboard({ user }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const userRole = getUserRole(user);
  const isAdmin = userRole === ROLES.SUPER_ADMIN || userRole === ROLES.ADMIN;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  const [freeProducts, setFreeProducts] = useState([]);
  const [clientCode, setClientCode] = useState(null);
  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  useEffect(() => {
    if (searchParams.get('tab') === 'settings') {
      setShowProfileModal(true);
      searchParams.delete('tab');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resumes a purchase that was interrupted by the register/login flow
  // (see ProductDetail.jsx's handleBuy, which stores this before redirecting).
  useEffect(() => {
    const pendingBuy = localStorage.getItem('uffi_pending_buy');
    if (pendingBuy) {
      localStorage.removeItem('uffi_pending_buy');
      navigate(`/products/${pendingBuy}?autobuy=1`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // First-login welcome modal state
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [welcomeLanguage, setWelcomeLanguage] = useState('pt');
  const [isSavingWelcome, setIsSavingWelcome] = useState(false);
  const [welcomeError, setWelcomeError] = useState(null);

  // ── Load data ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) { navigate('/login'); return; }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        let userLang = 'pt';
        let userProfileData = null;

        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (!profileError && profileData) {
            userLang = profileData.preferred_language || profileData.language || 'pt';
            userProfileData = profileData;
            if (profileData.client_code) setClientCode(profileData.client_code);
            if (profileData.full_name) setFullName(profileData.full_name);
            // Set display name from profile
            const name =
              profileData.full_name ||
              user?.user_metadata?.full_name?.split(' ')[0] ||
              user?.email?.split('@')[0] ||
              'User';
            setDisplayName(name.split(' ')[0]); // only first word
            if (profileData.first_login === true) {
              setShowWelcomeModal(true);
              setWelcomeLanguage(userLang.split('-')[0]);
            }
          } else {
            setDisplayName(
              user?.user_metadata?.full_name?.split(' ')[0] ||
              user?.email?.split('@')[0] ||
              'User'
            );
          }
        } catch {
          setDisplayName(user?.email?.split('@')[0] || 'User');
        }

        userLang = userLang.split('-')[0];

        const [allProducts, purchases, tableAccesses] = await Promise.all([
          fetchAllProducts(),
          getUserPurchases(user.email),
          getMyActiveAccesses(user.id), // new user_product_access table
        ]);

        // IDs from Stripe/manual purchases (purchases table)
        const purchasedIds = new Set((purchases || []).map((p) => p.product_id));

        // IDs from user_product_access table (admin-granted, with expiry)
        const tableProductMap = new Map(tableAccesses.map((p) => [p.id, p]));

        // Single source of truth: purchases + admin grants via user_product_access
        // Legacy profiles.product_access is intentionally excluded to prevent
        // orphan/stale data from leaking into the dashboard for new users.
        const allAccessibleIds = new Set([
          ...purchasedIds,
          ...tableProductMap.keys(),
        ]);

        // Build purchased products list, enriching with _accessExpiry when available
        const myPurchased = allProducts
          .filter((p) => allAccessibleIds.has(p.id))
          .map((p) => {
            const tableEntry = tableProductMap.get(p.id);
            return tableEntry
              ? { ...p, _accessExpiry: tableEntry._accessExpiry, access_url: tableEntry.access_url || p.access_url, product_type: tableEntry.product_type || p.product_type }
              : p;
          });

        // Free products: language-matched + not already in accessible set
        const normalizedLang = userLang.toLowerCase();
        const myFree = allProducts.filter((p) => {
          const isFree = p.is_free === true || parseFloat(p.price) === 0;
          const isActive = p.active === true || p.is_active === true;
          const prodLang = (p.language || 'pt').toLowerCase().split('-')[0];
          return isFree && isActive && prodLang === normalizedLang && !allAccessibleIds.has(p.id);
        });

        // Batch-fetch delivery items for every visible product (single query,
        // no N+1) and attach them so the AccessModal never needs to re-fetch.
        const deliverablesMap = await getDeliverablesForProducts(
          [...myPurchased, ...myFree].map((p) => p.id)
        );
        const withDeliverables = (list) =>
          list.map((p) => ({ ...p, _deliverables: deliverablesMap.get(p.id) || [] }));

        setPurchasedProducts(withDeliverables(myPurchased));
        setFreeProducts(withDeliverables(myFree));
      } catch (err) {
        console.error('Dashboard error:', err);
        setError('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, navigate]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const copyClientCode = () => {
    if (!clientCode) return;
    navigator.clipboard.writeText(clientCode);
    toast({ title: 'Code copied!', className: 'border-amber-500 bg-zinc-900 text-white' });
  };

  const handleSaveWelcomeModal = async () => {
    setIsSavingWelcome(true);
    setWelcomeError(null);
    try {
      const { error: updateError } = await supabase.from('profiles').upsert({
        id: user.id,
        language: welcomeLanguage,
        preferred_language: welcomeLanguage,
        first_login: false,
        updated_at: new Date().toISOString(),
      });
      if (updateError) throw updateError;
      toast({ title: 'Preferences saved', className: 'border-amber-500 bg-zinc-900 text-white', duration: 3000 });
      setShowWelcomeModal(false);
    } catch {
      setWelcomeError('Failed to save. Please try again.');
    } finally {
      setIsSavingWelcome(false);
    }
  };

  if (!user) return null;

  const totalItems = purchasedProducts.length + freeProducts.length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">

      {/* ── Profile modal ── */}
      <AnimatePresence>
        {showProfileModal && (
          <ProfileModal
            user={user}
            onClose={() => setShowProfileModal(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Support modal ── */}
      {showSupportModal && (
        <SupportModal user={user} onClose={() => setShowSupportModal(false)} />
      )}

      {/* ── First-login welcome modal ── */}
      <AnimatePresence>
        {showWelcomeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="bg-zinc-900 border border-zinc-700/60 rounded-2xl p-8 max-w-sm w-full shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                  <span className="text-2xl">👋</span>
                </div>
                <h2 className="text-lg font-bold text-white mb-1">Welcome to UffiSolutions!</h2>
                <p className="text-sm text-zinc-400">Choose your preferred language to see your free resources.</p>
              </div>
              <div className="space-y-4">
                <select
                  value={welcomeLanguage}
                  onChange={(e) => setWelcomeLanguage(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
                >
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <option key={opt.code} value={opt.code}>{opt.flag} {opt.name}</option>
                  ))}
                </select>
                {welcomeError && (
                  <p className="text-xs text-red-400 flex items-center gap-1.5">
                    <AlertCircle size={13} /> {welcomeError}
                  </p>
                )}
                <button
                  onClick={handleSaveWelcomeModal}
                  disabled={isSavingWelcome}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-black font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {isSavingWelcome
                    ? <><Loader2 size={15} className="animate-spin" /> Saving...</>
                    : <><CheckCircle size={15} /> Save & Continue</>
                  }
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Top bar ── */}
      <div className="fixed top-0 left-0 w-full z-50 bg-neutral-950/95 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
          <Logo size="md" clickable={false} />
          <span className="font-bold text-base text-white group-hover:text-amber-400 transition-colors">
            Uffi<span className="text-amber-400 group-hover:text-white transition-colors">Solutions</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => navigate('/')} title="Home" className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition-colors">
            <Home size={18} />
          </button>
          <button onClick={() => navigate('/products')} title="Catalog" className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition-colors">
            <Package size={18} />
          </button>

          <button onClick={() => setShowSupportModal(true)} title="Contact Support" className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition-colors">
            <LifeBuoy size={18} />
          </button>

          <NotificationBell />

          {/* Admin shortcut — only visible for admin/super_admin */}
          {isAdmin && (
            <button
              onClick={() => navigate('/admin/users')}
              title="Admin — Manage Users & Access"
              className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-3 py-2 rounded-lg transition-colors text-xs font-bold"
            >
              <ShieldAlert size={15} />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          <button onClick={handleLogout} title="Sign Out" className="text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 p-2 rounded-lg transition-colors ml-1">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-16">

        {/* ── Welcome header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full border border-amber-500/30 bg-zinc-800 flex items-center justify-center shrink-0 text-base font-bold text-amber-400">
              {getInitials(fullName, user?.email)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Welcome back, <span className="text-amber-400">{displayName}</span>
                </h1>
                <button
                  onClick={() => setShowProfileModal(true)}
                  title="Edit Profile"
                  className="text-zinc-500 hover:text-amber-400 hover:bg-zinc-800 p-1.5 rounded-lg transition-colors"
                >
                  <UserCog size={16} />
                </button>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">Manage your products and resources.</p>
            </div>
          </div>

          {/* Client code badge */}
          {clientCode && (
            <div className="flex items-center gap-2 bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-2.5">
              <div>
                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">Client Code</p>
                <p className="text-base font-black text-white tracking-widest">{clientCode}</p>
              </div>
              <button
                onClick={copyClientCode}
                className="p-1.5 text-amber-400/60 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all ml-1"
                title="Copy code"
              >
                <Copy size={14} />
              </button>
            </div>
          )}
        </div>

        {/* ── States ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="animate-spin text-amber-500" size={32} />
            <p className="text-sm text-zinc-500">Loading your resources...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <AlertCircle size={40} className="text-red-500" />
            <div>
              <p className="font-bold text-white">Something went wrong</p>
              <p className="text-sm text-zinc-400 mt-1">{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-amber-500 hover:bg-amber-600 text-black px-6 py-2 rounded-lg font-bold transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        ) : totalItems === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-5">
              <Package size={28} className="text-zinc-500" />
            </div>
            <h2 className="text-base font-bold text-white mb-2">Your dashboard is empty</h2>
            <p className="text-sm text-zinc-400 max-w-sm mb-7">
              You don't have any products or resources assigned to your account yet.
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-amber-500 hover:bg-amber-600 text-black px-7 py-2.5 rounded-lg font-bold transition-colors text-sm inline-flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              Browse Available Products <Search size={14} />
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {purchasedProducts.length > 0 && (
              <section>
                <SectionTitle icon={Package} label="Unlocked Products" count={purchasedProducts.length} iconColor="text-amber-400" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {purchasedProducts.map((product, i) => (
                    <ProductCard key={`p-${product.id}`} product={product} index={i} onFallback={(p) => navigate(`/library/${p.slug || p.id}`)} />
                  ))}
                </div>
              </section>
            )}
            {freeProducts.length > 0 && (
              <section>
                <SectionTitle icon={BookOpen} label="Free Resources" count={freeProducts.length} iconColor="text-emerald-400" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {freeProducts.map((product, i) => (
                    <ProductCard key={`f-${product.id}`} product={product} index={i} onFallback={(p) => navigate(`/library/${p.slug || p.id}`)} />
                  ))}
                </div>
              </section>
            )}
            <div className="pt-4 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-zinc-500">
                Showing {totalItems} resource{totalItems !== 1 ? 's' : ''} · Free resources filtered by your preferred language
              </p>
              <button onClick={() => navigate('/products')} className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors">
                Browse full catalog <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
