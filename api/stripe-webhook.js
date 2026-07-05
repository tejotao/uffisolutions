import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

// A refund only gives us the Charge/PaymentIntent — client_reference_id lives
// on the Checkout Session, so we look the session back up via the Stripe API
// rather than needing a new column/migration to link purchases back to users.
async function handleRefund(charge) {
  try {
    const sessions = await stripe.checkout.sessions.list({ payment_intent: charge.payment_intent, limit: 1 });
    const session = sessions.data[0];
    if (!session) {
      console.error('charge.refunded: no Checkout Session found for payment_intent', charge.payment_intent);
      return;
    }

    const [userId, productId] = (session.client_reference_id || '').split('_');
    if (!userId || !productId) {
      console.error('charge.refunded: missing/malformed client_reference_id on session', session.id);
      return;
    }

    const { error: revokeError } = await supabase
      .from('user_product_access')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
    if (revokeError) throw revokeError;

    await supabase.from('purchases').update({ status: 'refunded' }).eq('stripe_session', session.id);

    console.log('charge.refunded: access revoked', { userId, productId, sessionId: session.id });
  } catch (err) {
    console.error('Failed to process refund for charge', charge.id, err);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end('Method Not Allowed');
    return;
  }

  let event;
  try {
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === 'charge.refunded') {
    await handleRefund(event.data.object);
    res.status(200).json({ received: true });
    return;
  }

  if (event.type !== 'checkout.session.completed') {
    res.status(200).json({ received: true });
    return;
  }

  const session = event.data.object;
  const [userId, productId] = (session.client_reference_id || '').split('_');
  console.log('stripe-webhook: checkout.session.completed', { sessionId: session.id, clientReferenceId: session.client_reference_id, userId, productId });

  if (!userId || !productId) {
    console.error('Missing/malformed client_reference_id on session', session.id);
    res.status(400).send('Missing client_reference_id');
    return;
  }

  try {
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('access_duration_days, language, name, title')
      .eq('id', productId)
      .single();
    if (productError) throw productError;

    const expiryDate = product?.access_duration_days ? addDays(product.access_duration_days) : null;

    const { data: accessRows, error: accessError } = await supabase
      .from('user_product_access')
      .upsert(
        {
          user_id: userId,
          product_id: productId,
          granted_by: null,
          expiry_date: expiryDate,
          is_active: true,
          notes: `Stripe purchase — session ${session.id}`,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,product_id' }
      )
      .select();
    if (accessError) throw accessError;

    if (!accessRows || accessRows.length === 0) {
      // Supabase does not return an error when RLS blocks a write — it just
      // affects 0 rows. Seeing this log with no thrown error almost always
      // means SUPABASE_SERVICE_ROLE_KEY is missing/wrong in Vercel env vars
      // (the client fell back to being RLS-restricted instead of bypassing it).
      console.error('user_product_access upsert affected 0 rows — check SUPABASE_SERVICE_ROLE_KEY in Vercel env vars', { userId, productId, sessionId: session.id });
    } else {
      console.log('user_product_access upserted successfully', accessRows[0]);
      try {
        const productName = product?.title || product?.name || 'your product';
        await supabase.from('notifications').insert({
          user_id: userId,
          title: 'Purchase confirmed',
          description: `Your purchase of "${productName}" is ready — access unlocked!`,
          type: 'purchase',
          icon: '🎉',
          action_url: `/products/${productId}`,
          read: false,
        });
      } catch (notifyError) {
        console.error('notification insert failed (non-blocking):', notifyError);
      }
    }

    try {
      await supabase.from('purchases').insert({
        buyer_email: session.customer_details?.email || session.customer_email,
        product_id: productId,
        stripe_session: session.id,
        status: 'active',
        language: product?.language || 'pt',
      });
    } catch (auditError) {
      console.error('purchases audit insert failed (non-blocking):', auditError);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Failed to grant access for session', session.id, err);
    res.status(500).send('Internal error granting access');
  }
}
