import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// RFC-5322-ish, good enough to reject obvious junk before hitting the DB.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
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
