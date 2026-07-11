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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_URL = 'https://uffisolutions.com';
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'sitemap.xml');

// Vite only injects VITE_-prefixed vars into import.meta.env for client code —
// this plain Node script needs them in process.env instead. Vercel already
// exposes project env vars that way during the build step; for local builds,
// fall back to reading .env.local directly.
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

const STATIC_ROUTES = [
  { loc: '/', priority: '1.0', changefreq: 'daily' },
  { loc: '/login', priority: '0.5', changefreq: 'monthly' },
  { loc: '/register', priority: '0.5', changefreq: 'monthly' },
  { loc: '/products', priority: '0.9', changefreq: 'daily' },
];

function toXml(urls) {
  const body = urls
    .map(
      (u) => `  <url>
    <loc>${SITE_URL}${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
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
    .select('slug, updated_at, created_at')
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
    urls.push({ loc: `/products/${p.slug}`, lastmod, changefreq: 'weekly', priority: '0.8' });
  }

  fs.writeFileSync(OUTPUT_PATH, toXml(urls));
  console.log(`[generate-sitemap] Wrote ${urls.length} URLs (${products.length} products) to public/sitemap.xml`);
}

main().catch((err) => {
  console.warn('[generate-sitemap] Non-fatal error, leaving existing sitemap.xml in place:', err.message);
});
