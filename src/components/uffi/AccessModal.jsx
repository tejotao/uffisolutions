
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X, Download, ExternalLink, Play, Globe, HardDrive,
  FileText, AlertCircle, Lock, Unlock, Clock, Music,
  Loader2, WifiOff,
} from 'lucide-react';
import { isAccessValid, daysUntilExpiry } from '@/lib/accessQueries';
import { cn } from '@/lib/utils';

// ─── Type + provider config ───────────────────────────────────────────────────

export const DELIVERY_CONFIG = {
  pdf:      { label: 'Download PDF',      groupLabel: 'PDFs',            icon: FileText,  btnClass: 'bg-red-500/10 text-red-300 border-red-500/30 hover:bg-red-500/20'               },
  video:    { label: 'Watch Video',       groupLabel: 'Videos',          icon: Play,      btnClass: 'bg-blue-500/10 text-blue-300 border-blue-500/30 hover:bg-blue-500/20'           },
  audio:    { label: 'Listen',            groupLabel: 'Audio',           icon: Music,     btnClass: 'bg-pink-500/10 text-pink-300 border-pink-500/30 hover:bg-pink-500/20'           },
  external: { label: 'Open Platform',     groupLabel: 'External Links',  icon: ExternalLink, btnClass: 'bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20' },
  drive:    { label: 'Open Google Drive', groupLabel: 'Google Drive',    icon: HardDrive, btnClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20' },
  other:    { label: 'Access Resource',   groupLabel: 'Other Resources', icon: Globe,     btnClass: 'bg-zinc-700/50 text-zinc-200 border-zinc-600/50 hover:bg-zinc-700'               },
};

export const TYPE_ORDER = ['pdf', 'video', 'audio', 'external', 'drive', 'other'];

export const getDeliveryConfig = (type) =>
  DELIVERY_CONFIG[(type || '').toLowerCase()] || DELIVERY_CONFIG.other;

export const groupDeliverablesByType = (items) => {
  const buckets = new Map();
  items.forEach((item) => {
    const t = TYPE_ORDER.includes((item.type || '').toLowerCase())
      ? item.type.toLowerCase() : 'other';
    if (!buckets.has(t)) buckets.set(t, []);
    buckets.get(t).push(item);
  });
  return TYPE_ORDER
    .filter((t) => buckets.has(t))
    .map((t) => ({ type: t, config: getDeliveryConfig(t), items: buckets.get(t) }));
};

export const resolveDeliverables = (product) => {
  if (Array.isArray(product._deliverables) && product._deliverables.length > 0)
    return product._deliverables;
  const legacyUrl = product.access_url || product.driveLink || product.content_url || null;
  const items = [];
  if (legacyUrl) items.push({ type: product.product_type || 'other', label: null, url: legacyUrl });
  if (product.drive_link && product.drive_link !== legacyUrl)
    items.push({ type: 'drive', label: 'Backup: Google Drive', url: product.drive_link });
  return items;
};

// ─── URL extractors (all return null on failure — never throw) ────────────────

const safeUrl = (raw) => {
  if (!raw || typeof raw !== 'string' || !raw.trim()) return null;
  try { new URL(raw); return raw.trim(); } catch { return null; }
};

const getYouTubeEmbedUrl = (url) => {
  const safe = safeUrl(url);
  if (!safe) return null;
  try {
    const u = new URL(safe);
    let id = null;
    if (u.hostname.includes('youtu.be'))       id = u.pathname.slice(1).split('?')[0];
    else if (u.hostname.includes('youtube.com')) id = u.searchParams.get('v');
    if (!id) return null;
    return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
  } catch { return null; }
};

const getVimeoEmbedUrl = (url) => {
  const safe = safeUrl(url);
  if (!safe) return null;
  try {
    const u = new URL(safe);
    if (!u.hostname.includes('vimeo.com')) return null;
    const id = u.pathname.split('/').filter(Boolean).pop();
    if (!id || !/^\d+$/.test(id)) return null;
    return `https://player.vimeo.com/video/${id}?title=0&byline=0&portrait=0`;
  } catch { return null; }
};

const getSpotifyEmbedUrl = (url) => {
  const safe = safeUrl(url);
  if (!safe) return null;
  try {
    const u = new URL(safe);
    if (!u.hostname.includes('spotify.com')) return null;
    return safe.replace('open.spotify.com/', 'open.spotify.com/embed/');
  } catch { return null; }
};

// ─── Expiry indicator ─────────────────────────────────────────────────────────

export function ExpiryIndicator({ expiryDate }) {
  if (!expiryDate) return null;
  const days = daysUntilExpiry(expiryDate);
  if (days < 0) return (
    <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
      <AlertCircle size={9} /> Expired
    </span>
  );
  if (days <= 7) return (
    <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
      <Clock size={9} /> {days}d left
    </span>
  );
  return null;
}

// ─── Fallback state (anti-blackout) ──────────────────────────────────────────

function ContentPending({ label }) {
  return (
    <div className="flex items-center gap-3 bg-zinc-900/80 border border-dashed border-zinc-700 rounded-xl px-4 py-3.5">
      <WifiOff size={16} className="text-zinc-600 shrink-0" />
      <div>
        <p className="text-zinc-400 font-semibold text-sm">{label || 'Conteúdo em preparação'}</p>
        <p className="text-zinc-600 text-xs mt-0.5">Este recurso estará disponível em breve.</p>
      </div>
    </div>
  );
}

// ─── Embed wrapper — click-to-play + timeout fallback ────────────────────────
// 1. Shows thumbnail + play button (never auto-loads iframe)
// 2. On click: loads iframe + starts 5s timeout
// 3. If onLoad fires within 5s → shows player
// 4. If timeout fires before onLoad → YouTube blocked (X-Frame-Options)
//    → shows "Open in new tab" button (never a blank or broken iframe)

function EmbedFrame({ src, title, aspectRatio = '16/9', height, thumbnail, externalUrl }) {
  const [active,       setActive]       = useState(false);
  const [loaded,       setLoaded]       = useState(false);
  const [embedBlocked, setEmbedBlocked] = useState(false);

  // Timeout: if iframe hasn't called onLoad in 5s, assume embed is blocked
  useEffect(() => {
    if (!active || loaded || embedBlocked) return;
    const t = setTimeout(() => setEmbedBlocked(true), 5000);
    return () => clearTimeout(t);
  }, [active, loaded, embedBlocked]);

  // ── No embed URL ──
  if (!src) {
    if (externalUrl) return (
      <a href={externalUrl} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-semibold border border-zinc-700 transition-all">
        <ExternalLink size={15} /> Open externally
      </a>
    );
    return <ContentPending label={title} />;
  }

  // ── Embed blocked (timeout or X-Frame) ──
  if (embedBlocked) return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-700/60 rounded-xl px-4 py-3.5">
        <WifiOff size={16} className="text-zinc-500 shrink-0" />
        <div>
          <p className="text-zinc-300 font-semibold text-sm">Embed not available</p>
          <p className="text-zinc-600 text-xs mt-0.5">The platform blocks embedding. Open directly instead.</p>
        </div>
      </div>
      {externalUrl && (
        <a href={externalUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-semibold border border-zinc-700 transition-all">
          <ExternalLink size={15} /> Open in new tab
        </a>
      )}
    </div>
  );

  // ── Thumbnail / click-to-play ──
  if (!active) return (
    <div className="space-y-2">
      <div
        className="relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 cursor-pointer group"
        style={{ aspectRatio: height ? undefined : aspectRatio, height }}
        onClick={() => setActive(true)}
      >
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center">
            <Play size={36} className="text-zinc-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition-colors flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/95 group-hover:bg-white group-hover:scale-110 transition-all flex items-center justify-center shadow-2xl">
            <Play size={22} className="text-zinc-900 fill-zinc-900 ml-1" />
          </div>
        </div>
        {title && (
          <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-white text-xs font-semibold truncate">{title}</p>
          </div>
        )}
      </div>
      {externalUrl && (
        <a href={externalUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors">
          <ExternalLink size={11} /> Open in new tab
        </a>
      )}
    </div>
  );

  // ── Active iframe ──
  return (
    <div className="relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800"
      style={{ aspectRatio: height ? undefined : aspectRatio, height }}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <Loader2 size={22} className="animate-spin text-zinc-600" />
        </div>
      )}
      <iframe
        src={src}
        title={title || 'Content'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => setLoaded(true)}
        onError={() => setEmbedBlocked(true)}
        className="w-full h-full border-0 relative z-10"
      />
    </div>
  );
}

// ─── Single deliverable renderer ──────────────────────────────────────────────

export function DeliverableItem({ item, groupConfig, idx, totalInGroup }) {
  const provider  = (item.provider || '').toLowerCase();
  const type      = (item.type    || 'other').toLowerCase();
  const url       = safeUrl(item.url);
  const label     = item.label || (totalInGroup > 1 ? `${groupConfig.label} ${idx + 1}` : groupConfig.label);

  // ── YouTube — thumbnail + open in new tab (no embed) ──
  if (provider === 'youtube' || (!provider && url && (url.includes('youtube.com') || url.includes('youtu.be')))) {
    const embedUrl = getYouTubeEmbedUrl(url);
    const ytId     = embedUrl ? embedUrl.split('/embed/')[1]?.split('?')[0] : null;
    const thumb    = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;
    if (!url) return <ContentPending label={label} />;
    return (
      <div className="space-y-2">
        {label && <p className="text-xs font-semibold text-zinc-400">{label}</p>}
        <a href={url} target="_blank" rel="noopener noreferrer" className="block group">
          <div className="relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 cursor-pointer" style={{ aspectRatio: '16/9' }}>
            {thumb ? (
              <img src={thumb} alt={label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center">
                <Play size={36} className="text-zinc-600" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition-colors flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/95 group-hover:bg-white group-hover:scale-110 transition-all flex items-center justify-center shadow-2xl">
                <Play size={22} className="text-zinc-900 fill-zinc-900 ml-1" />
              </div>
            </div>
            {label && (
              <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white text-xs font-semibold truncate">{label}</p>
              </div>
            )}
            <div className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
              YouTube
            </div>
          </div>
        </a>
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors">
          <ExternalLink size={11} /> Open on YouTube
        </a>
      </div>
    );
  }

  // ── Vimeo — thumbnail + open in new tab ──
  if (provider === 'vimeo' || (!provider && url?.includes('vimeo.com'))) {
    if (!url) return <ContentPending label={label} />;
    return (
      <div className="space-y-2">
        {label && <p className="text-xs font-semibold text-zinc-400">{label}</p>}
        <a href={url} target="_blank" rel="noopener noreferrer"
          className={cn('w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border font-semibold text-sm transition-all', groupConfig.btnClass)}>
          <Play size={18} className="shrink-0" />
          <div className="flex-1 text-left">
            <p className="font-bold text-sm">{label}</p>
            <p className="text-[10px] opacity-60 mt-0.5">Opens on Vimeo</p>
          </div>
          <ExternalLink size={14} className="opacity-50" />
        </a>
      </div>
    );
  }

  // ── Spotify — auto-embed (Spotify works cross-domain) ──
  if (provider === 'spotify' || (!provider && url?.includes('spotify.com'))) {
    const embedUrl = getSpotifyEmbedUrl(url);
    return (
      <div className="space-y-2">
        {label && <p className="text-xs font-semibold text-zinc-400">{label}</p>}
        <EmbedFrame src={embedUrl} title={label} height="152px" aspectRatio={undefined} externalUrl={url} />
      </div>
    );
  }

  // ── Native HTML5 video (Supabase Storage or direct .mp4) ──
  if (provider === 'supabase' && type === 'video') {
    if (!url) return <ContentPending label={label} />;
    return (
      <div className="space-y-2">
        {label && <p className="text-xs font-semibold text-zinc-400">{label}</p>}
        <video
          src={url} controls preload="metadata"
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>
    );
  }

  // ── Native HTML5 audio (Supabase Storage or Spotify direct) ──
  if (type === 'audio' || (provider === 'supabase' && type === 'audio')) {
    if (!url) return <ContentPending label={label} />;
    return (
      <div className="space-y-2">
        {label && <p className="text-xs font-semibold text-zinc-400">{label}</p>}
        <audio
          src={url} controls preload="metadata"
          className="w-full rounded-xl"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>
    );
  }

  // ── PDF download ──
  if (type === 'pdf') {
    if (!url) return <ContentPending label={label} />;
    return (
      <a href={url} download target="_blank" rel="noopener noreferrer"
        className={cn('w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border font-semibold text-sm transition-all', groupConfig.btnClass)}>
        <FileText size={18} className="shrink-0" />
        <div className="flex-1 text-left">
          <p className="font-bold text-sm">{label}</p>
          <p className="text-[10px] opacity-60 mt-0.5">Click to download your file</p>
        </div>
        <Download size={14} className="opacity-50" />
      </a>
    );
  }

  // ── Generic link button (external, drive, other, or unknown provider) ──
  if (!url) return <ContentPending label={label} />;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className={cn('w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border font-semibold text-sm transition-all', groupConfig.btnClass)}>
      <groupConfig.icon size={18} className="shrink-0" />
      <div className="flex-1 text-left">
        <p className="font-bold text-sm">{label}</p>
        <p className="text-[10px] opacity-60 mt-0.5">Opens in a new tab</p>
      </div>
      <ExternalLink size={14} className="opacity-50" />
    </a>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AccessModal({ product, onClose }) {
  // Guard: if product is null/undefined, render nothing (anti-blackout)
  if (!product) return null;

  const items        = resolveDeliverables(product);
  const groupedItems = groupDeliverablesByType(items);

  // Detect if any item has an embed provider → widen the modal
  const hasEmbed = items.some((it) => {
    const p = (it.provider || '').toLowerCase();
    const u = it.url || '';
    return p === 'youtube' || p === 'vimeo' || p === 'spotify'
      || u.includes('youtube.com') || u.includes('youtu.be')
      || u.includes('vimeo.com') || u.includes('spotify.com');
  });

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
        className={cn(
          'w-full bg-zinc-950 border border-zinc-800/80 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl',
          hasEmbed ? 'sm:max-w-2xl' : 'sm:max-w-md'
        )}
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
            {product.title || product.name || 'Untitled product'}
          </h2>

          <div className="flex items-center gap-3 mt-3 flex-wrap">
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
        <div className="px-5 pb-6 pt-4 space-y-5 max-h-[70vh] overflow-y-auto">
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
            <div className="space-y-6">
              {groupedItems.map((group) => (
                <div key={group.type} className="space-y-3">
                  {groupedItems.length > 1 && (
                    <div className="flex items-center gap-2">
                      <group.config.icon size={12} className="shrink-0 opacity-60 text-zinc-500" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        {group.config.groupLabel}
                      </p>
                      <span className="text-[9px] text-zinc-700 bg-zinc-900 px-1.5 py-0.5 rounded-full">
                        {group.items.length}
                      </span>
                    </div>
                  )}
                  {group.items.map((item, idx) => (
                    <DeliverableItem
                      key={item.id || `${group.type}-${idx}`}
                      item={item}
                      groupConfig={group.config}
                      idx={idx}
                      totalInGroup={group.items.length}
                    />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <ContentPending label="Content not yet available" />
          )}

          <p className="text-[10px] text-zinc-600 text-center pt-1">
            Access links are private and personalised for your account.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
