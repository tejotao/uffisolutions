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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, '..', 'dist');
const BASE_HTML_PATH = path.join(DIST_DIR, 'index.html');
const SITE_URL = 'https://uffisolutions.com';

function loadLocalEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] === undefined) {
      process.env[key] = rawValue.replace(/^["']|["']$/g, '');
    }
  }
}

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

function buildProductHtml(baseHtml, product) {
  const title = `${escapeHtml(product.title || product.name)} — UffiSolutions`;
  const description = escapeHtml((product.hero_description || product.description || '').slice(0, 160));
  const url = `${SITE_URL}/products/${product.slug}`;
  const image = product.image_url || null;

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
  // Add a canonical link (index.html doesn't ship one) right before </head>.
  html = html.replace('</head>', `\t\t<link rel="canonical" href="${url}" />\n\t</head>`);

  return html;
}

async function fetchActiveProducts() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn('[prerender-product-meta] Missing Supabase credentials — skipping.');
    return [];
  }
  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from('products')
    .select('slug, title, name, hero_description, description, image_url')
    .eq('active', true)
    .not('slug', 'is', null);
  if (error) {
    console.warn('[prerender-product-meta] Failed to fetch products:', error.message);
    return [];
  }
  return data || [];
}

async function main() {
  loadLocalEnv();

  if (!fs.existsSync(BASE_HTML_PATH)) {
    console.warn('[prerender-product-meta] dist/index.html not found — run after `vite build`. Skipping.');
    return;
  }
  const baseHtml = fs.readFileSync(BASE_HTML_PATH, 'utf8');

  const products = await fetchActiveProducts();
  let written = 0;
  for (const product of products) {
    if (!product.slug) continue;
    const outDir = path.join(DIST_DIR, 'products', product.slug);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), buildProductHtml(baseHtml, product));
    written++;
  }
  console.log(`[prerender-product-meta] Wrote ${written} static product pages with real meta tags.`);
}

main().catch((err) => {
  console.warn('[prerender-product-meta] Non-fatal error:', err.message);
});
