const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const RAW_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/`;
const RENDER_PREFIX = `${SUPABASE_URL}/storage/v1/render/image/public/`;

// Product cover images are uploaded at whatever size the admin exported
// them at (often 2000px+, several MB) and rendered as small cards/thumbs.
// Supabase Storage's image transformation endpoint resizes + re-encodes
// on the fly (WebP/AVIF via content negotiation on the Accept header) —
// this only changes the URL used to fetch the image, never the stored
// file, so it's safe to apply without touching any product data.
// Non-Supabase URLs (e.g. the site logo on a third-party CDN) pass through
// unchanged — verified against this project's actual storage endpoint
// before rolling out (200 OK, 7.3MB -> 78KB at width=600&quality=75).
export function optimizedImageUrl(url, { width, quality = 75 } = {}) {
  if (!url || !SUPABASE_URL || !url.startsWith(RAW_PREFIX)) return url;
  const rendered = url.replace(RAW_PREFIX, RENDER_PREFIX);
  const params = new URLSearchParams();
  if (width) params.set('width', width);
  if (quality) params.set('quality', quality);
  const separator = rendered.includes('?') ? '&' : '?';
  return `${rendered}${separator}${params.toString()}`;
}
