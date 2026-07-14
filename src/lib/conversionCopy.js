// Conversion-focused marketing copy for product cards/landing pages, keyed
// by the PRODUCT's own language (product.language) — not the visitor's
// current site language (useLanguage()/t()). A product page always shows
// one product's own content in its own language regardless of which site
// language the visitor is browsing in, so this stays independent of the
// general i18n system in translations.js.

function normalizeProductLanguage(language) {
  const l = (language || 'en').toLowerCase();
  if (l.includes('pt')) return 'pt';
  if (l.includes('es')) return 'es';
  if (l.includes('it')) return 'it';
  return 'en';
}

const TAGLINE_PAID = {
  en: 'Knowledge that drives results',
  pt: 'Conhecimento que gera resultado',
  es: 'Conocimiento que genera resultados',
  it: 'Conoscenza che genera risultati',
};

const TAGLINE_FREE = {
  en: 'Immediate free access',
  pt: 'Acesso imediato e gratuito',
  es: 'Acceso inmediato y gratuito',
  it: 'Accesso immediato e gratuito',
};

// 4 distinct phrases per language, one per CTA position on the landing page
// (hero, after sections, before FAQ, final) — never the same phrase twice
// on one page. The site brief supplied the first 3; the 4th ("Claim Your
// Access" family) extends the same imperative/benefit-driven tone for the
// final-position button.
const CTA_VARIANTS = {
  en: ['Start Now →', 'Get Instant Access →', 'Yes, I Want This →', 'Claim Your Access →'],
  pt: ['Quero Começar Agora →', 'Garantir Meu Acesso →', 'Sim, Quero Este Guia →', 'Desbloquear Meu Acesso →'],
  es: ['Quiero Empezar Ahora →', 'Garantizar Mi Acceso →', 'Sí, Quiero Esta Guía →', 'Desbloquear Mi Acceso →'],
  it: ['Voglio Iniziare Ora →', 'Garantisci il Mio Accesso →', 'Sì, Voglio Questa Guida →', 'Sblocca il Mio Accesso →'],
};

const FREE_CTA = {
  en: 'Get Free Access →',
  pt: 'Quero Acesso Gratuito →',
  es: 'Quiero Acceso Gratuito →',
  it: 'Voglio Accesso Gratuito →',
};

const FREE_SUBTEXT = {
  en: 'No card required. Instant access after signup.',
  pt: 'Sem cartão. Acesso imediato após cadastro.',
  es: 'Sin tarjeta. Acceso inmediato tras el registro.',
  it: 'Senza carta. Accesso immediato dopo la registrazione.',
};

const AUTHORITY_LINE = {
  en: 'A guide built from real experience — to save you time, mistakes and money.',
  pt: 'Um guia criado por quem vive isso na prática — para te poupar tempo, erros e dinheiro.',
  es: 'Una guía creada por quien vive esto en la práctica — para ahorrarte tiempo y errores.',
  it: 'Una guida creata da chi vive questo nella pratica — per farti risparmiare tempo ed errori.',
};

// {days} interpolated with the product's real guarantee_days (defaults to
// 14 elsewhere in ProductDetail.jsx) rather than hardcoding "14" here, so
// this stays correct for any product with a different guarantee window.
const OBJECTION_TEMPLATES = {
  en: ['100% secure payment via Stripe', '{days}-day guarantee — no questions asked', 'Email support: us@uffisolutions.com'],
  pt: ['Pagamento 100% seguro via Stripe', 'Garantia de {days} dias — sem perguntas', 'Suporte por email: us@uffisolutions.com'],
  es: ['Pago 100% seguro via Stripe', 'Garantía de {days} días — sin preguntas', 'Soporte por email: us@uffisolutions.com'],
  it: ['Pagamento 100% sicuro via Stripe', 'Garanzia di {days} giorni — senza domande', 'Supporto email: us@uffisolutions.com'],
};
const OBJECTION_ICONS = ['🔒', '↩️', '✉️'];

export function getTagline(language, isFree) {
  return (isFree ? TAGLINE_FREE : TAGLINE_PAID)[normalizeProductLanguage(language)];
}

export function getCtaVariant(language, index) {
  const variants = CTA_VARIANTS[normalizeProductLanguage(language)];
  return variants[index % variants.length];
}

export function getFreeCta(language) {
  return FREE_CTA[normalizeProductLanguage(language)];
}

export function getFreeSubtext(language) {
  return FREE_SUBTEXT[normalizeProductLanguage(language)];
}

export function getAuthorityLine(language) {
  return AUTHORITY_LINE[normalizeProductLanguage(language)];
}

export function getObjections(language, guaranteeDays = 14) {
  return OBJECTION_TEMPLATES[normalizeProductLanguage(language)].map((text, i) => ({
    icon: OBJECTION_ICONS[i],
    text: text.replace('{days}', guaranteeDays),
  }));
}
