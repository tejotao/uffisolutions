import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const OWNER_EMAIL = 'us@uffisolutions.com';
const SITE_URL = 'https://www.uffisolutions.com';

// Same dark/amber design system as docs/email-templates/*.html (logo header,
// card with a coloured top bar, icon circle, centered CTA button, footer) —
// kept self-contained here (not a shared import) because Vercel treats every
// file under /api as its own route unless prefixed with "_", and this file
// is the only thing that needs these.
function emailShell({ accentFrom, accentTo, icon, iconBorder, title, bodyHtml, ctaLabel, ctaUrl }) {
  return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — UffiSolutions</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <img src="https://horizons-cdn.hostinger.com/1db78d05-91f5-4455-8f8f-f031a8b68532/57e87afb0356e1c00547152607556f48.png"
                   alt="UffiSolutions" height="40" style="display:block;" />
              <p style="margin:8px 0 0;font-size:18px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
                Uffi<span style="color:#f59e0b;">Solutions</span>
              </p>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#141414;border:1px solid #2a2a2a;border-radius:16px;overflow:hidden;">

              <div style="height:4px;background:linear-gradient(90deg,${accentFrom},${accentTo});"></div>

              <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 36px;">

                <!-- Icon -->
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <div style="width:64px;height:64px;background-color:#1a1a1a;border:1px solid ${iconBorder};border-radius:50%;display:inline-block;line-height:64px;text-align:center;font-size:28px;">
                      ${icon}
                    </div>
                  </td>
                </tr>

                <!-- Title -->
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <h1 style="margin:0;font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
                      ${title}
                    </h1>
                  </td>
                </tr>

                <!-- Body -->
                ${bodyHtml}

                <!-- CTA Button -->
                <tr>
                  <td align="center" style="padding-top:8px;">
                    <a href="${ctaUrl}"
                       style="display:inline-block;background-color:#f59e0b;color:#000000;font-size:15px;font-weight:800;text-decoration:none;padding:14px 36px;border-radius:12px;letter-spacing:0.3px;">
                      ${ctaLabel}
                    </a>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0 0 4px;font-size:12px;color:#3f3f46;">
                UffiSolutions · <a href="${SITE_URL}" style="color:#52525b;text-decoration:none;">uffisolutions.com</a>
              </p>
              <p style="margin:0;font-size:11px;color:#27272a;">
                © 2026 UffiSolutions. All rights reserved. · Company No. 16827147 · England &amp; Wales
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function saleRow(label, value) {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:13px;color:#71717a;">${label}</td>
            <td align="right" style="font-size:14px;color:#ffffff;font-weight:600;">${value}</td>
          </tr>
        </table>
      </td>
    </tr>`;
}

// Email 1 — sale notification, sent to the shop owner.
function buildOwnerSaleEmail({ productName, amountFormatted, customerEmail, dateStr, dashboardUrl }) {
  const bodyHtml = `
                <tr>
                  <td style="padding-bottom:28px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border:1px solid #2a2a2a;border-radius:10px;padding:4px 18px;">
                      ${saleRow('Produto', productName)}
                      ${saleRow('Valor pago', amountFormatted)}
                      ${saleRow('Cliente', customerEmail)}
                      ${saleRow('Data e hora', dateStr)}
                    </table>
                  </td>
                </tr>`;

  return {
    subject: `🛍️ Nova venda — ${productName}`,
    html: emailShell({
      accentFrom: '#10b981', accentTo: '#059669',
      icon: '🛍️', iconBorder: '#10b98133',
      title: 'Nova venda!',
      bodyHtml,
      ctaLabel: 'Ver no Stripe Dashboard',
      ctaUrl: dashboardUrl,
    }),
  };
}

// Email 2 — purchase confirmation, sent to the buyer.
function buildCustomerConfirmationEmail({ productName, guaranteeDays }) {
  const bodyHtml = `
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <p style="margin:0;font-size:15px;color:#a1a1aa;line-height:1.6;text-align:center;">
                      Sua compra de <strong style="color:#ffffff;">${productName}</strong> foi confirmada com sucesso! Faça login em <strong style="color:#ffffff;">uffisolutions.com</strong> com o mesmo email usado na compra para acessar o conteúdo.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color:#1a1a1a;border:1px solid #2a2a2a;border-radius:10px;padding:14px 18px;">
                    <p style="margin:0;font-size:12px;color:#71717a;text-align:center;">
                      🛡️ Garantia de ${guaranteeDays} dias — se não ficar satisfeito, devolvemos 100% do valor pago, sem perguntas.
                    </p>
                  </td>
                </tr>
                <tr><td style="height:20px;"></td></tr>
                <tr>
                  <td align="center">
                    <p style="margin:0;font-size:12px;color:#52525b;text-align:center;">
                      Dúvidas? Fale com a gente: <a href="mailto:${OWNER_EMAIL}" style="color:#f59e0b;text-decoration:none;">${OWNER_EMAIL}</a>
                    </p>
                  </td>
                </tr>`;

  return {
    subject: `✅ Sua compra foi confirmada — ${productName}`,
    html: emailShell({
      accentFrom: '#f59e0b', accentTo: '#d97706',
      icon: '✅', iconBorder: '#f59e0b33',
      title: 'Compra confirmada!',
      bodyHtml,
      ctaLabel: 'Acessar Minha Conta',
      ctaUrl: `${SITE_URL}/login`,
    }),
  };
}

async function sendEmail({ to, subject, html }) {
  try {
    // Constructed lazily, inside the try/catch — unlike the Stripe/Supabase
    // clients above, `new Resend()` throws synchronously if the API key is
    // missing/empty. Building it here means a misconfigured key only fails
    // the email (already the point of wrapping this in try/catch), instead
    // of crashing the whole function at cold start before any request —
    // including real Stripe POSTs — could even be handled
    // (FUNCTION_INVOCATION_FAILED for every invocation, not just email).
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: `UffiSolutions <${OWNER_EMAIL}>`,
      to,
      subject,
      html,
    });
    if (error) throw error;
    console.log('Email sent:', { to, subject });
  } catch (err) {
    // Non-blocking by design — a failed email must never stop access from
    // being granted (that already happened by the time this runs).
    console.error('Failed to send email (non-blocking):', { to, subject }, err);
  }
}

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
    // Temporary diagnostic (2026-07-13) — narrows down whether the failure is
    // a missing/wrong-scoped STRIPE_WEBHOOK_SECRET vs a missing signature
    // header, without ever logging the secret itself.
    const secret = process.env.STRIPE_WEBHOOK_SECRET || '';
    console.error('Stripe signature verification failed:', err.message, {
      secretPresent: secret.length > 0,
      secretPrefix: secret.slice(0, 8),
      secretLength: secret.length,
      sigHeaderPresent: Boolean(req.headers['stripe-signature']),
    });
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
      .select('access_duration_days, language, name, title, guarantee_days')
      .eq('id', productId)
      .single();
    if (productError) throw productError;

    const expiryDate = product?.access_duration_days ? addDays(product.access_duration_days) : null;

    // Own try/catch (not `if (error) throw`) — a real Supabase error here
    // used to propagate to the outer catch and skip everything below it,
    // including the sale/confirmation emails further down. Stripe already
    // charged the customer by this point regardless of whether this upsert
    // succeeds, so a DB hiccup here must not silently cancel the emails too.
    let accessRows = null;
    try {
      const { data, error: accessError } = await supabase
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
      accessRows = data;
    } catch (accessError) {
      console.error('user_product_access upsert threw (non-blocking — emails still send):', { userId, productId, sessionId: session.id }, accessError);
    }

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

    const buyerEmail = session.customer_details?.email || session.customer_email;

    try {
      await supabase.from('purchases').insert({
        buyer_email: buyerEmail,
        product_id: productId,
        stripe_session: session.id,
        status: 'active',
        language: product?.language || 'pt',
      });
    } catch (auditError) {
      console.error('purchases audit insert failed (non-blocking):', auditError);
    }

    // Sale notification (owner) + purchase confirmation (buyer) — fired for
    // every completed checkout regardless of the access-grant outcome above
    // (Stripe already charged the customer either way, so both still need
    // to go out; sendEmail() swallows its own errors, non-blocking).
    const productName = product?.title || product?.name || 'seu produto';
    const guaranteeDays = product?.guarantee_days ?? 14;
    const dateStr = new Date().toLocaleString('pt-PT', {
      timeZone: 'Europe/London', dateStyle: 'long', timeStyle: 'short',
    });
    const dashboardUrl = session.payment_intent
      ? `https://dashboard.stripe.com/payments/${session.payment_intent}`
      : 'https://dashboard.stripe.com/payments';

    const ownerEmail = buildOwnerSaleEmail({
      productName,
      amountFormatted: `£${((session.amount_total ?? 0) / 100).toFixed(2)}`,
      customerEmail: buyerEmail || 'N/A',
      dateStr,
      dashboardUrl,
    });
    await sendEmail({ to: OWNER_EMAIL, subject: ownerEmail.subject, html: ownerEmail.html });

    if (buyerEmail) {
      const customerEmail = buildCustomerConfirmationEmail({ productName, guaranteeDays });
      await sendEmail({ to: buyerEmail, subject: customerEmail.subject, html: customerEmail.html });
    } else {
      console.error('No buyer email on session — skipping purchase confirmation email', session.id);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Failed to grant access for session', session.id, err);
    res.status(500).send('Internal error granting access');
  }
}
