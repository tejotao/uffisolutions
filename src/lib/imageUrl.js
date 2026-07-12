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
//
// `height` is NOT optional if you want a sane result: passing `width` alone
// does not scale proportionally — confirmed by comparing real output
// dimensions (a 2752x1536 source came back 560x1536 with only width=560
// set, i.e. width changed but height didn't, wrecking the aspect ratio).
// Always pass `height` matching the container's real aspect ratio when the
// image fills a fixed-ratio box (object-cover, aspect-video, etc.).
export function optimizedImageUrl(url, { width, height, quality = 75, resize = 'cover' } = {}) {
  if (!url || !SUPABASE_URL || !url.startsWith(RAW_PREFIX)) return url;
  const rendered = url.replace(RAW_PREFIX, RENDER_PREFIX);
  const params = new URLSearchParams();
  if (width) params.set('width', width);
  if (height) {
    params.set('height', height);
    params.set('resize', resize);
  }
  if (quality) params.set('quality', quality);
  const separator = rendered.includes('?') ? '&' : '?';
  return `${rendered}${separator}${params.toString()}`;
}
