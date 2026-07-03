
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home, Package, ArrowLeft, Loader2, Sparkles, Mail, Clock, Search,
} from 'lucide-react';
import {
  DeliverableItem, ExpiryIndicator, groupDeliverablesByType, resolveDeliverables,
} from '@/components/uffi/AccessModal';
import Logo from '@/components/uffi/Logo';
import Footer from '@/components/uffi/Footer';
import { fetchAllProducts, fetchAllProductsAllLanguages } from '@/lib/catalogQueries';
import { getUserPurchases } from '@/lib/purchaseQueries';
import { getMyActiveAccesses, daysUntilExpiry } from '@/lib/accessQueries';
import { getDeliverablesForProducts } from '@/lib/deliverableQueries';

const getLanguageFlag = (lang) => {
  if (!lang) return '🌐';
  const l = lang.toLowerCase();
  if (l.includes('pt-br') || l === 'pt') return '🇧🇷';
  if (l.includes('en')) return '🇬🇧';
  if (l.includes('es')) return '🇪🇸';
  if (l.includes('it')) return '🇮🇹';
  return '🌐';
};

// ─── Stat pill ────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon: Icon, color = 'text-amber-400' }) => (
  <div className="flex items-center gap-3 bg-zinc-900/70 border border-zinc-800/80 rounded-2xl px-4 py-3.5">
    <div className={`w-9 h-9 rounded-xl bg-zinc-800/80 flex items-center justify-center shrink-0 ${color}`}>
      <Icon size={16} />
    </div>
    <div>
      <p className="text-lg font-black text-white leading-none">{value}</p>
      <p className="text-[11px] text-zinc-500 mt-1">{label}</p>
    </div>
  </div>
);

// ─── Recently added banner ─────────────────────────────────────────────────────

const RecentProductStrip = ({ products, navigate }) => {
  if (!products || products.length === 0) return null;
  return (
    <div className="mb-10">
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 flex items-center gap-1.5 mb-3">
        <Sparkles size={11} className="text-amber-500/70" /> New on the platform
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {products.map((p) => (
          <button
            key={p.id}
            onClick={() => navigate(`/products/${p.slug || p.id}`)}
            className="flex items-center gap-3 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/60 hover:border-zinc-700 rounded-xl px-3 py-2.5 text-left transition-colors group"
          >
            <div
              className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-sm"
              style={{ background: `${p.category?.color || '#f59e0b'}22` }}
            >
              {p.category?.icon || '📁'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate">
                {getLanguageFlag(p.language)} {p.title || p.name}
              </p>
              <p className="text-[10px] text-zinc-600 truncate">{p.category?.name || p.categoryName || ''}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────

export default function LibraryPage({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [groupedItems, setGroupedItems] = useState([]);
  const [totalUnlocked, setTotalUnlocked] = useState(0);
  const [expiringSoon, setExpiringSoon] = useState(0);
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const [allProducts, purchases, tableAccesses, recent] = await Promise.all([
          fetchAllProducts(),
          getUserPurchases(user.email),
          getMyActiveAccesses(user.id),
          fetchAllProductsAllLanguages(),
        ]);

        // Same "single source of truth" as UserDashboard: purchases + admin
        // grants via user_product_access. Legacy profiles.product_access is
        // intentionally excluded (see UserDashboard.jsx for the same note).
        const purchasedIds = new Set((purchases || []).map((p) => p.product_id));
        const tableProductMap = new Map(tableAccesses.map((p) => [p.id, p]));
        const allAccessibleIds = new Set([...purchasedIds, ...tableProductMap.keys()]);

        const myProducts = allProducts
          .filter((p) => allAccessibleIds.has(p.id))
          .map((p) => {
            const tableEntry = tableProductMap.get(p.id);
            return tableEntry ? { ...p, _accessExpiry: tableEntry._accessExpiry } : p;
          });

        const deliverablesMap = await getDeliverablesForProducts(myProducts.map((p) => p.id));

        // Flatten every deliverable across every unlocked product into one
        // list, tagging each item with its parent product for attribution,
        // then group by type (PDFs / Videos / ...) — reuses the exact same
        // grouping AccessModal uses, so a product with a single PDF only
        // ever shows up under "PDFs", never under empty sections it has no
        // content for.
        const flatItems = myProducts.flatMap((p) => {
          const items = resolveDeliverables({ ...p, _deliverables: deliverablesMap.get(p.id) || [] });
          return items.map((item, i) => ({
            ...item,
            id: item.id || `${p.id}-${i}`,
            _product: p,
          }));
        });

        setGroupedItems(groupDeliverablesByType(flatItems));
        setTotalUnlocked(myProducts.length);
        setExpiringSoon(
          myProducts.filter((p) => {
            if (!p._accessExpiry) return false;
            const d = daysUntilExpiry(p._accessExpiry);
            return d >= 0 && d <= 7;
          }).length
        );
        setRecentProducts((recent || []).slice(0, 3));
      } catch (err) {
        console.error('Library error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (!user) return null;

  const totalItems = groupedItems.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
      {/* ── Top bar ── */}
      <div className="fixed top-0 left-0 w-full z-50 bg-neutral-950/95 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
          <Logo size="md" clickable={false} />
          <span className="font-bold text-base text-white group-hover:text-amber-400 transition-colors">
            Uffi<span className="text-amber-400 group-hover:text-white transition-colors">Solutions</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => navigate('/dashboard')} title="Back to Dashboard" className="flex items-center gap-1.5 text-zinc-400 hover:text-white px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors text-xs font-semibold">
            <ArrowLeft size={15} /> Dashboard
          </button>
          <button onClick={() => navigate('/')} title="Home" className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition-colors">
            <Home size={18} />
          </button>
          <button onClick={() => navigate('/products')} title="Catalog" className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition-colors">
            <Package size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-5xl w-full mx-auto px-4 pt-24 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="animate-spin text-amber-500" size={28} />
          </div>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-black text-white">My Library</h1>
              <p className="text-sm text-zinc-500 mt-1">Everything you've unlocked, in one place.</p>
            </motion.div>

            {/* ── Stats ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10"
            >
              <StatCard label="Unlocked products" value={totalUnlocked} icon={Package} color="text-amber-400" />
              {groupedItems.map((g) => (
                <StatCard key={g.type} label={g.config.groupLabel} value={g.items.length} icon={g.config.icon} color="text-zinc-300" />
              ))}
              {expiringSoon > 0 && (
                <StatCard label="Expiring soon" value={expiringSoon} icon={Clock} color="text-amber-400" />
              )}
            </motion.div>

            {/* ── Recently added to platform ── */}
            <RecentProductStrip products={recentProducts} navigate={navigate} />

            {/* ── Content, grouped by deliverable type ── */}
            {totalItems === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-20 bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl">
                <div className="w-16 h-16 bg-zinc-800/60 rounded-full flex items-center justify-center mb-5">
                  <Package size={28} className="text-zinc-500" />
                </div>
                <h2 className="text-base font-bold text-white mb-2">Your library is empty</h2>
                <p className="text-sm text-zinc-400 max-w-sm mb-7">
                  You don't have any unlocked content yet.
                </p>
                <button
                  onClick={() => navigate('/products')}
                  className="bg-amber-500 hover:bg-amber-600 text-black px-7 py-2.5 rounded-lg font-bold transition-colors text-sm inline-flex items-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  Browse Available Products <Search size={14} />
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                {groupedItems.map((group, gi) => (
                  <motion.section
                    key={group.type}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 + gi * 0.05 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <group.config.icon size={14} className="shrink-0 text-zinc-500" />
                      <h2 className="text-sm font-bold text-white">{group.config.groupLabel}</h2>
                      <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                        {group.items.length} item{group.items.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {group.items.map((item, idx) => (
                        <div key={item.id} className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs">{item._product.category?.icon || '📁'}</span>
                            <p className="text-[11px] font-semibold text-zinc-400 truncate flex-1">
                              {item._product.title || item._product.name}
                            </p>
                            {item._product._accessExpiry && <ExpiryIndicator expiryDate={item._product._accessExpiry} />}
                          </div>
                          <DeliverableItem item={item} groupConfig={group.config} idx={idx} totalInGroup={group.items.length} />
                        </div>
                      ))}
                    </div>
                  </motion.section>
                ))}
              </div>
            )}

            {/* ── Support footer ── */}
            <div className="mt-16 pt-8 border-t border-zinc-800/60 flex flex-col items-center gap-2 text-center">
              <p className="text-xs text-zinc-500">Need any support?</p>
              <a
                href="mailto:us@uffisolutions.com"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-amber-400 transition-colors"
              >
                <Mail size={12} /> us@uffisolutions.com
              </a>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
