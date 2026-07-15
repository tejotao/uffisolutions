#!/usr/bin/env node
// Regenerates public/sitemap.xml before every build — static routes plus one
// <url> per active product landing page (/products/:slug). Runs as a
// prebuild step (see package.json), same spot as generate-llms.js, and is
// deliberately best-effort: any failure (missing credentials offline, no
// network) logs a warning and leaves the previous sitemap.xml untouched
// rather than failing the whole build.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { getHreflang } from '../src/lib/productSchema.js';
import { loadLocalEnv } from './lib/loadLocalEnv.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_URL = 'https://www.uffisolutions.com';
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'sitemap.xml');

const STATIC_ROUTES = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/login', priority: '0.5', changefreq: 'monthly' },
  { loc: '/register', priority: '0.5', changefreq: 'monthly' },
  { loc: '/products', priority: '0.9', changefreq: 'daily' },
];

function toXml(urls) {
  const body = urls
    .map((u) => {
      // hreflang is self-referencing here: each product is its own
      // language-specific row in the DB (not one product with sibling
      // translations at other URLs), so there's no reliable "same content,
      // other language" URL to cross-link to without inventing a matching
      // heuristic nobody asked for. A self-hreflang is valid and harmless,
      // it just doesn't get the full cross-referencing benefit a true
      // alternate-language cluster would.
      const hreflangLine = u.hreflang
        ? `\n    <xhtml:link rel="alternate" hreflang="${u.hreflang}" href="${SITE_URL}${u.loc}" />`
        : '';
      return `  <url>
    <loc>${SITE_URL}${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${hreflangLine}
  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}\n</urlset>\n`;
}

async function fetchActiveProductSlugs() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn('[generate-sitemap] Missing Supabase credentials — skipping product URLs.');
    return [];
  }
  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from('products')
    .select('slug, language, updated_at, created_at')
    .eq('active', true)
    .not('slug', 'is', null);
  if (error) {
    console.warn('[generate-sitemap] Failed to fetch products:', error.message);
    return [];
  }
  return data || [];
}

async function main() {
  loadLocalEnv();
  const today = new Date().toISOString().split('T')[0];

  const urls = STATIC_ROUTES.map((r) => ({ ...r, lastmod: today }));

  const products = await fetchActiveProductSlugs();
  for (const p of products) {
    if (!p.slug) continue;
    const lastmod = (p.updated_at || p.created_at || today).toString().split('T')[0];
    urls.push({
      loc: `/products/${p.slug}`,
      lastmod,
      changefreq: 'monthly',
      priority: '0.9',
      hreflang: getHreflang(p.language),
    });
  }

  fs.writeFileSync(OUTPUT_PATH, toXml(urls));
  console.log(`[generate-sitemap] Wrote ${urls.length} URLs (${products.length} products) to public/sitemap.xml`);
}

main().catch((err) => {
  console.warn('[generate-sitemap] Non-fatal error, leaving existing sitemap.xml in place:', err.message);
});
