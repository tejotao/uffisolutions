
import React from 'react';
import { motion } from 'framer-motion';
import {
  X, Download, ExternalLink, Play, Globe, HardDrive,
  FileText, AlertCircle, Lock, Unlock, Clock,
} from 'lucide-react';
import { isAccessValid, daysUntilExpiry } from '@/lib/accessQueries';
import { cn } from '@/lib/utils';

// ─── Delivery config ──────────────────────────────────────────────────────────

export const DELIVERY_CONFIG = {
  pdf:      { label: 'Download PDF',      groupLabel: 'PDFs',            icon: FileText,     btnClass: 'bg-red-500/10 text-red-300 border-red-500/30 hover:bg-red-500/20'           },
  video:    { label: 'Watch Video',       groupLabel: 'Videos',          icon: Play,         btnClass: 'bg-blue-500/10 text-blue-300 border-blue-500/30 hover:bg-blue-500/20'         },
  external: { label: 'Open Platform',     groupLabel: 'External Links',  icon: ExternalLink, btnClass: 'bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20' },
  drive:    { label: 'Open Google Drive', groupLabel: 'Google Drive',    icon: HardDrive,    btnClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20' },
  other:    { label: 'Access Resource',   groupLabel: 'Other Resources', icon: Globe,        btnClass: 'bg-zinc-700/50 text-zinc-200 border-zinc-600/50 hover:bg-zinc-700'             },
};

const TYPE_ORDER = ['pdf', 'video', 'external', 'drive', 'other'];

export const getDeliveryConfig = (type) =>
  DELIVERY_CONFIG[type] || DELIVERY_CONFIG.other;

// Groups flat deliverable list into ordered { type, config, items } buckets
export const groupDeliverablesByType = (items) => {
  const buckets = new Map();
  items.forEach((item) => {
    const t = TYPE_ORDER.includes((item.type || '').toLowerCase()) ? item.type.toLowerCase() : 'other';
    if (!buckets.has(t)) buckets.set(t, []);
    buckets.get(t).push(item);
  });
  return TYPE_ORDER
    .filter((t) => buckets.has(t))
    .map((t) => ({ type: t, config: getDeliveryConfig(t), items: buckets.get(t) }));
};

// Resolves deliverable list from product._deliverables or falls back to legacy fields
export const resolveDeliverables = (product) => {
  if (Array.isArray(product._deliverables) && product._deliverables.length > 0) {
    return product._deliverables;
  }
  const legacyUrl = product.access_url || product.driveLink || product.content_url || null;
  const items = [];
  if (legacyUrl) items.push({ type: product.product_type || 'other', label: null, url: legacyUrl });
  if (product.drive_link && product.drive_link !== legacyUrl)
    items.push({ type: 'drive', label: 'Backup: Google Drive', url: product.drive_link });
  return items;
};

// ─── Expiry indicator ─────────────────────────────────────────────────────────

function ExpiryIndicator({ expiryDate }) {
  if (!expiryDate) return null;
  const days  = daysUntilExpiry(expiryDate);
  const valid = days >= 0;
  const soon  = days >= 0 && days <= 7;
  if (!valid) return (
    <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
      <AlertCircle size={9} /> Expired
    </span>
  );
  if (soon) return (
    <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
      <Clock size={9} /> {days}d left
    </span>
  );
  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AccessModal({ product, onClose }) {
  const items       = resolveDeliverables(product);
  const groupedItems = groupDeliverablesByType(items);

  const catColor   = product.category?.color || '#f59e0b';
  const catIcon    = product.category?.icon  || product.categoryIcon || '📁';
  const catName    = product.category?.name  || product.categoryName || '';
  const expiryDate = product._accessExpiry   || null;
  const expired    = expiryDate ? !isAccessValid(expiryDate) : false;

  const hexToRgb = (hex) => {
    if (!hex || !hex.startsWith('#') || hex.length !== 7) return '245,158,11';
    return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}`;
  };
  const catRgb = hexToRgb(catColor);

  const getLanguageFlag = (lang) => {
    if (!lang) return '🌐';
    const l = lang.toLowerCase();
    if (l.includes('pt-br') || l === 'pt') return '🇧🇷';
    if (l.includes('en')) return '🇬🇧';
    if (l.includes('es')) return '🇪🇸';
    if (l.includes('it')) return '🇮🇹';
    return '🌐';
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 48 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 48 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-zinc-950 border border-zinc-800/80 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* ── Colour header ── */}
        <div
          className="relative px-5 pt-5 pb-6"
          style={{ background: `linear-gradient(135deg, rgba(${catRgb},0.22) 0%, rgba(9,9,11,0.98) 100%)` }}
        >
          <div className="sm:hidden mx-auto mb-3 w-10 h-1 rounded-full bg-zinc-700" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X size={16} />
          </button>

          {catName && (
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-sm">{catIcon}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: catColor }}>
                {catName}
              </span>
            </div>
          )}

          <h2 className="text-xl font-black text-white leading-tight pr-6">
            {product.title || product.name}
          </h2>

          <div className="flex items-center gap-3 mt-3">
            <span className="text-lg">{getLanguageFlag(product.language)}</span>
            {expired ? (
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full">
                <Lock size={10} /> Access Expired
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <Unlock size={10} /> Access Confirmed
              </span>
            )}
            {expiryDate && !expired && <ExpiryIndicator expiryDate={expiryDate} />}
          </div>
        </div>

        {/* ── Delivery section ── */}
        <div className="px-5 pb-6 pt-4 space-y-5">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-2">
            <span className="w-3 h-px bg-zinc-700 inline-block" />
            How to access your content
            <span className="flex-1 h-px bg-zinc-800 inline-block" />
          </p>

          {expired ? (
            <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-3.5 text-sm text-red-400">
              <Lock size={16} className="shrink-0" />
              <div>
                <p className="font-semibold">Access has expired</p>
                <p className="text-xs text-red-400/70 mt-0.5">Contact support to renew.</p>
              </div>
            </div>
          ) : items.length > 0 ? (
            <div className="space-y-5">
              {groupedItems.map((group) => (
                <div key={group.type} className="space-y-2">
                  {groupedItems.length > 1 && (
                    <div className="flex items-center gap-2">
                      <group.config.icon size={12} className="shrink-0 opacity-60 text-zinc-500" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        {group.config.groupLabel}
                      </p>
                      <span className="text-[9px] text-zinc-700 bg-zinc-900 px-1.5 py-0.5 rounded-full">{group.items.length}</span>
                    </div>
                  )}
                  {group.items.map((item, idx) => {
                    const isPdf  = group.type === 'pdf';
                    const label  = item.label || (group.items.length > 1 ? `${group.config.label} ${idx + 1}` : group.config.label);
                    return (
                      <a
                        key={item.id || `${group.type}-${idx}`}
                        href={item.url}
                        download={isPdf || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn('w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border font-semibold text-sm transition-all', group.config.btnClass)}
                      >
                        <group.config.icon size={18} className="shrink-0" />
                        <div className="flex-1 text-left">
                          <p className="font-bold text-sm">{label}</p>
                          <p className="text-[10px] opacity-60 mt-0.5">{isPdf ? 'Click to download your file' : 'Opens in a new tab'}</p>
                        </div>
                        {isPdf ? <Download size={14} className="opacity-50" /> : <ExternalLink size={14} className="opacity-50" />}
                      </a>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-start gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-sm">
              <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-zinc-300 font-semibold text-sm">Content not yet available</p>
                <p className="text-zinc-500 text-xs mt-1">The delivery link hasn't been configured yet. Please contact support.</p>
              </div>
            </div>
          )}

          <p className="text-[10px] text-zinc-600 text-center pt-1">
            Access links are private and personalised for your account.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
