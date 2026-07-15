#!/usr/bin/env node
// This is a pure client-side SPA (no SSR) — index.html ships one static set
// of <title>/description/og:*/twitter:* tags, identical for every route.
// react-helmet (used in ProductDetail.jsx) only edits the DOM after React
// boots in a real browser, which is invisible to the crawlers that matter
// most for paid-traffic landing pages: Facebook/WhatsApp/LinkedIn/Twitter's
// link-preview bots fetch the raw HTML and generally don't execute JS.
//
// Fix: after `vite build`, generate one static dist/products/<slug>/index.html
// per active product — a copy of the real built index.html (so it still
// boots the SPA and hydrates normally for real visitors) with the <head>
// meta tags swapped for that product's real title/description/image. Static
// files take priority over vercel.json's SPA catch-all rewrite, and Vercel
// resolves directory-style paths (/products/<slug>) to their index.html the
// same way it already does for "/" -> dist/index.html.
//
// Mirrors the exact same title/description derivation used client-side in
// ProductDetail.jsx (pageTitle / pageDescription) so both stay in sync.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { buildProductSchema, buildFaqSchema, buildBreadcrumbSchema, getOgLocale } from '../src/lib/productSchema.js';
import { loadLocalEnv } from './lib/loadLocalEnv.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, '..', 'dist');
const BASE_HTML_PATH = path.join(DIST_DIR, 'index.html');
const SITE_URL = 'https://www.uffisolutions.com';

// Product text is admin-authored free text — must be escaped before going
// into HTML attribute/text context (an "&" or `"` in a tagline would
// otherwise corrupt the tag or the rest of the document).
function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function replaceTag(html, regex, replacement) {
  if (!regex.test(html)) {
    console.warn(`[prerender-product-meta] Pattern not found, skipped: ${regex}`);
    return html;
  }
  return html.replace(regex, replacement);
}

// Same Supabase Storage image-transform rewrite as src/lib/imageUrl.js, but
// reimplemented locally rather than importing that module: it reads
// `import.meta.env.VITE_SUPABASE_URL`, a Vite-only feature that doesn't
// exist under plain `node` (this script's runtime) and would throw on
// import. 1200x675 (16:9) matches Google's structured-data image-size
// guidance for Product rich results. height is required, not optional —
// Supabase's transform endpoint doesn't scale height proportionally when
// only width is given (confirmed by comparing real output dimensions: a
// 2752x1536 source came back 560x1536 with just width=560 set — width
// changed, height didn't, wrecking the aspect ratio).
function schemaImageUrl(rawUrl) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const rawPrefix = `${supabaseUrl}/storage/v1/object/public/`;
  if (!rawUrl || !supabaseUrl || !rawUrl.startsWith(rawPrefix)) return rawUrl;
  const renderPrefix = `${supabaseUrl}/storage/v1/render/image/public/`;
  return `${rawUrl.replace(rawPrefix, renderPrefix)}?width=1200&height=675&resize=cover&quality=80`;
}

function buildProductHtml(baseHtml, product, category) {
  const title = `${escapeHtml(product.title || product.name)} — UffiSolutions`;
  const description = escapeHtml((product.hero_description || product.description || '').slice(0, 160));
  const url = `${SITE_URL}/products/${product.slug}`;
  const image = product.image_url || null;
  const ogLocale = getOgLocale(product.language);

  let html = baseHtml;
  html = replaceTag(html, /<title>.*?<\/title>/s, `<title>${title}</title>`);
  html = replaceTag(html, /<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${description}" />`);
  html = replaceTag(html, /<meta property="og:type" content="[^"]*"\s*\/>/, `<meta property="og:type" content="product" />`);
  html = replaceTag(html, /<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${url}" />`);
  html = replaceTag(html, /<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${title}" />`);
  html = replaceTag(html, /<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${description}" />`);
  html = replaceTag(html, /<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${title}" />`);
  html = replaceTag(html, /<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${description}" />`);
  if (image) {
    html = replaceTag(html, /<meta property="og:image" content="[^"]*"\s*\/>/, `<meta property="og:image" content="${escapeHtml(image)}" />`);
    html = replaceTag(html, /<meta name="twitter:image" content="[^"]*"\s*\/>/, `<meta name="twitter:image" content="${escapeHtml(image)}" />`);
  }

  const jsonLdBlocks = [
    buildProductSchema({ product, categoryName: category?.name, siteUrl: SITE_URL, imageUrl: schemaImageUrl(image) }),
    buildFaqSchema(product.faq),
    buildBreadcrumbSchema({ product, categoryName: category?.name, categorySlug: category?.slug, siteUrl: SITE_URL }),
  ].filter(Boolean);

  const jsonLdScripts = jsonLdBlocks
    .map((schema) => `\t\t<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
    .join('\n');

  // canonical + og:locale + JSON-LD, all injected right before </head>.
  html = html.replace(
    '</head>',
    `\t\t<link rel="canonical" href="${url}" />\n\t\t<meta property="og:locale" content="${ogLocale}" />\n${jsonLdScripts}\n\t</head>`
  );

  return html;
}

function getSupabaseClient() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function fetchActiveProducts(supabase) {
  const { data, error } = await supabase
    .from('products')
    .select('slug, title, name, hero_description, description, image_url, price, guarantee_days, faq, language, category_id')
    .eq('active', true)
    .not('slug', 'is', null);
  if (error) {
    console.warn('[prerender-product-meta] Failed to fetch products:', error.message);
    return [];
  }
  return data || [];
}

// English category name — used for the JSON-LD `category` field and the
// breadcrumb, independent of the `category_translations` table (empty at
// the time this was written) or the buggy `categoryName` derived by
// normalizeProduct() in catalogQueries.js (always just the capitalized
// slug). `categories.name`/`.slug` are the real, populated columns.
async function fetchCategoriesById(supabase) {
  const { data, error } = await supabase.from('categories').select('id, name, slug');
  if (error) {
    console.warn('[prerender-product-meta] Failed to fetch categories:', error.message);
    return new Map();
  }
  return new Map((data || []).map((c) => [c.id, c]));
}

async function main() {
  loadLocalEnv();

  if (!fs.existsSync(BASE_HTML_PATH)) {
    console.warn('[prerender-product-meta] dist/index.html not found — run after `vite build`. Skipping.');
    return;
  }
  const baseHtml = fs.readFileSync(BASE_HTML_PATH, 'utf8');

  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn('[prerender-product-meta] Missing Supabase credentials — skipping.');
    return;
  }

  const [products, categoriesById] = await Promise.all([
    fetchActiveProducts(supabase),
    fetchCategoriesById(supabase),
  ]);

  let written = 0;
  for (const product of products) {
    if (!product.slug) continue;
    const category = categoriesById.get(product.category_id);
    const outDir = path.join(DIST_DIR, 'products', product.slug);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), buildProductHtml(baseHtml, product, category));
    written++;
  }
  console.log(`[prerender-product-meta] Wrote ${written} static product pages with real meta tags.`);
}

main().catch((err) => {
  console.warn('[prerender-product-meta] Non-fatal error:', err.message);
});
