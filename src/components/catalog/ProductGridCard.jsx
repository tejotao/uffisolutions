import React from 'react';
import { Play, CheckCircle } from 'lucide-react';
import { optimizedImageUrl } from '@/lib/imageUrl';

function getLanguageFlag(lang) {
  if (!lang) return '🌐';
  const l = lang.toLowerCase();
  if (l.includes('pt-br') || l === 'pt') return '🇧🇷';
  if (l.includes('en')) return '🇬🇧';
  if (l.includes('es')) return '🇪🇸';
  if (l.includes('it')) return '🇮🇹';
  return '🌐';
}

// Shared by HomePage's grid and ProductsPage's catalog grid (the only two
// places asked for in this design) — a single component here means the two
// pages can no longer drift out of sync the way they did before (the price
// removal that landed on Home but was missed on the catalog for a whole
// session, until reported and fixed by hand).
//
// Default state shows only image + title + language flag, no description,
// no button — everything else reveals via a pure-CSS opacity transition on
// hover (desktop, gated behind the `md:` breakpoint) or is simply always-on
// below it (mobile/tablet, where there is no real hover to gate behind).
export default function ProductGridCard({ product, isFree, inLibrary = false, onClick, learnMoreLabel = 'Learn More' }) {
  const title = product.title || product.name;
  const description = product.description || '';
  const shortDescription = description.length > 80 ? `${description.slice(0, 80)}…` : description;

  return (
    <div
      onClick={onClick}
      className={`group relative bg-[#141414] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ease-in-out md:hover:scale-[1.02] md:hover:z-10 flex flex-col h-full ${
        isFree
          ? 'border-2 border-[#C9A84C] shadow-[0_0_15px_rgba(201,168,76,0.4)]'
          : 'border border-[#2a2a2a] hover:border-[#f59e0b]/50'
      }`}
    >
      {isFree && !inLibrary && (
        <div className="absolute top-2 left-2 z-30 bg-[#C9A84C] text-[#141414] text-xs font-bold px-2.5 py-1 rounded-full animate-free-pulse">
          FREE
        </div>
      )}
      {inLibrary && (
        <div className="absolute top-2 left-2 z-30 flex items-center gap-1 bg-amber-500 text-black px-2 py-1 rounded text-xs font-black shadow-lg">
          <CheckCircle size={11} /> In Library
        </div>
      )}
      <div className="absolute top-2 right-2 z-30 bg-black/60 backdrop-blur px-2 py-1 rounded text-xl">
        {getLanguageFlag(product.language)}
      </div>

      <div className="aspect-video relative overflow-hidden">
        {product.image_url ? (
          <img
            src={optimizedImageUrl(product.image_url, { width: 560, height: 315 })}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
            <Play size={32} className="text-[#2a2a2a]" />
          </div>
        )}

        {/* Dark overlay — always on for mobile/tablet (no hover to gate
            behind), fades in on hover for desktop. */}
        <div className="absolute inset-0 bg-black/60 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 ease-in-out" />

        {/* Reveal content — description + CTA, same opacity gating as the overlay above. */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-end gap-3 p-4 text-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
          {shortDescription && (
            <p className="text-gray-200 text-xs leading-relaxed line-clamp-3">{shortDescription}</p>
          )}
          <span className="inline-flex items-center gap-1.5 bg-[#f59e0b] text-black text-sm font-bold px-4 py-2 rounded-lg">
            {inLibrary ? (
              <>
                <CheckCircle size={14} /> Access
              </>
            ) : (
              `${learnMoreLabel} →`
            )}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-white text-base line-clamp-2 transition-colors md:group-hover:text-[#f59e0b]">
          {title}
        </h3>
      </div>
    </div>
  );
}
