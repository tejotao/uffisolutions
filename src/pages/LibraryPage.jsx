
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Package, ArrowLeft, Loader2, Mail, Lock } from 'lucide-react';
import {
  DeliverableItem, ExpiryIndicator, resolveDeliverables, getDeliveryConfig,
} from '@/components/uffi/AccessModal';
import Logo from '@/components/uffi/Logo';
import Footer from '@/components/uffi/Footer';
import { fetchAllProducts } from '@/lib/catalogQueries';
import { getUserPurchases } from '@/lib/purchaseQueries';
import { getMyActiveAccesses, isAccessValid } from '@/lib/accessQueries';
import { getDeliverablesForProduct } from '@/lib/deliverableQueries';

const getLanguageFlag = (lang) => {
  if (!lang) return '🌐';
  const l = lang.toLowerCase();
  if (l.includes('pt-br') || l === 'pt') return '🇧🇷';
  if (l.includes('en')) return '🇬🇧';
  if (l.includes('es')) return '🇪🇸';
  if (l.includes('it')) return '🇮🇹';
  return '🌐';
};

const hexToRgb = (hex) => {
  if (!hex || !hex.startsWith('#') || hex.length !== 7) return '245,158,11';
  return `${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)}`;
};

// ─── Main component ────────────────────────────────────────────────────────────

export default function LibraryPage({ user }) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading]   = useState(true);
  const [product, setProduct]   = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [expiryDate, setExpiryDate] = useState(null);
  const [items, setItems]       = useState([]);

  useEffect(() => {
    if (!user || !productId) return;
    const load = async () => {
      setLoading(true);
      try {
        const [allProducts, purchases, tableAccesses] = await Promise.all([
          fetchAllProducts(),
          getUserPurchases(user.email),
          getMyActiveAccesses(user.id),
        ]);

        const found = allProducts.find((p) => p.id === productId || p.slug === productId);
        setProduct(found || null);
        if (!found) { setLoading(false); return; }

        const purchasedIds = new Set((purchases || []).map((p) => p.product_id));
        const tableEntry = tableAccesses.find((p) => p.id === found.id);
        const granted = purchasedIds.has(found.id) || Boolean(tableEntry);
        setHasAccess(granted);
        setExpiryDate(tableEntry?._accessExpiry || null);

        if (granted) {
          const deliverables = await getDeliverablesForProduct(found.id);
          const resolved = resolveDeliverables({ ...found, _deliverables: deliverables });
          // Most recently added first.
          const sorted = [...resolved].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
          setItems(sorted);
        }
      } catch (err) {
        console.error('Library error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, productId]);

  if (!user) return null;

  const catColor = product?.category?.color || '#f59e0b';
  const catIcon  = product?.category?.icon  || '📁';
  const catName  = product?.category?.name  || product?.categoryName || '';
  const catRgb   = hexToRgb(catColor);
  const expired  = expiryDate ? !isAccessValid(expiryDate) : false;

  // Per-type running count, so unlabeled items of the same type still read
  // "Download PDF 1", "Download PDF 2" instead of colliding on one label.
  const typeSeen = {};

  return (
    <div
      className="min-h-screen text-white flex flex-col font-sans"
      style={{
        background: `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(${catRgb},0.14) 0%, transparent 60%), #0a0a0a`,
      }}
    >
      {/* ── Top bar ── */}
      <div className="fixed top-0 left-0 w-full z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3 flex items-center justify-between">
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

      <div className="flex-1 max-w-2xl w-full mx-auto px-4 pt-24 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="animate-spin text-amber-500" size={28} />
          </div>
        ) : !product ? (
          <div className="flex flex-col items-center text-center py-20">
            <h1 className="text-xl font-bold text-white mb-2">Product not found</h1>
            <button onClick={() => navigate('/dashboard')} className="text-amber-400 hover:text-amber-300 text-sm font-semibold mt-2">
              Back to Dashboard
            </button>
          </div>
        ) : !hasAccess ? (
          <div className="flex flex-col items-center text-center py-20">
            <div className="w-14 h-14 bg-zinc-800/60 rounded-full flex items-center justify-center mb-5">
              <Lock size={24} className="text-zinc-500" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">You don't have access to this product</h1>
            <button
              onClick={() => navigate(`/products/${product.slug || product.id}`)}
              className="bg-amber-500 hover:bg-amber-600 text-black px-6 py-2.5 rounded-lg font-bold transition-colors text-sm mt-3"
            >
              View Product
            </button>
          </div>
        ) : (
          <>
            {/* ── Product hero ── */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center mb-10">
              <div
                className="w-20 h-20 rounded-2xl overflow-hidden border shrink-0 mb-4"
                style={{ borderColor: `rgba(${catRgb},0.3)` }}
              >
                {product.image_url ? (
                  <img src={product.image_url} alt={product.title || product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl" style={{ background: `rgba(${catRgb},0.12)` }}>
                    {catIcon}
                  </div>
                )}
              </div>
              {catName && (
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-sm">{catIcon}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: catColor }}>{catName}</span>
                </div>
              )}
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {getLanguageFlag(product.language)} {product.title || product.name}
              </h1>
              {expired ? (
                <span className="mt-3 text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full">
                  Access Expired
                </span>
              ) : expiryDate ? (
                <div className="mt-3"><ExpiryIndicator expiryDate={expiryDate} /></div>
              ) : null}
            </motion.div>

            {/* ── Deliverables — flat list, most recent first ── */}
            {expired ? (
              <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-3.5 text-sm text-red-400">
                <Lock size={16} className="shrink-0" />
                <div>
                  <p className="font-semibold">Access has expired</p>
                  <p className="text-xs text-red-400/70 mt-0.5">Contact support to renew.</p>
                </div>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center text-center py-16 bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl">
                <p className="text-sm text-zinc-400">Content not yet available for this product.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, idx) => {
                  const type = (item.type || 'other').toLowerCase();
                  typeSeen[type] = (typeSeen[type] || 0) + 1;
                  const config = getDeliveryConfig(type);
                  const feedbackHref = `mailto:us@uffisolutions.com?subject=${encodeURIComponent(
                    `Feedback: ${product.title || product.name} — ${item.label || config.label}`
                  )}`;
                  return (
                    <motion.div
                      key={item.id || `${type}-${idx}`}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                    >
                      <DeliverableItem item={item} groupConfig={config} idx={typeSeen[type] - 1} totalInGroup={typeSeen[type]} />
                      <a
                        href={feedbackHref}
                        className="inline-flex items-center gap-1 text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors mt-1.5 ml-1"
                      >
                        <Mail size={10} /> Give feedback on this
                      </a>
                    </motion.div>
                  );
                })}
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
