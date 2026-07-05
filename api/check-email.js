import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// RFC-5322-ish, good enough to reject obvious junk before hitting the DB.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ENDPOINT = 'check-email';
const WINDOW_MS = 5 * 60 * 1000;
const MAX_REQUESTS = 10;

// DIY rate limit — no KV/Redis in this project. Read-then-write, so it's not
// perfectly race-proof under heavy concurrency, but plenty for deterring
// casual email-enumeration probing on this endpoint.
async function isRateLimited(ip) {
  const now = new Date();
  const { data: row } = await supabase
    .from('rate_limits')
    .select('window_start, count')
    .eq('ip', ip)
    .eq('endpoint', ENDPOINT)
    .maybeSingle();

  if (!row || now - new Date(row.window_start) > WINDOW_MS) {
    await supabase
      .from('rate_limits')
      .upsert({ ip, endpoint: ENDPOINT, window_start: now.toISOString(), count: 1 });
    return false;
  }

  if (row.count >= MAX_REQUESTS) return true;

  await supabase
    .from('rate_limits')
    .update({ count: row.count + 1 })
    .eq('ip', ip)
    .eq('endpoint', ENDPOINT);
  return false;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
  if (await isRateLimited(ip)) {
    res.status(429).json({ error: 'Too many requests, please try again later' });
    return;
  }

  const email = (req.body?.email || '').trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    res.status(400).json({ error: 'Invalid email' });
    return;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .limit(1);
    if (error) throw error;

    // Only a boolean is ever returned — no account details, no user data.
    res.status(200).json({ exists: (data?.length || 0) > 0 });
  } catch (err) {
    console.error('check-email error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
}
