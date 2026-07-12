// Pure JSON-LD builders for product landing pages — no Node-only or
// browser-only APIs, so this same module is imported both by
// tools/prerender-product-meta.js (Node, build time, static HTML) and
// src/pages/ProductDetail.jsx (browser, client-side react-helmet). Keeping
// one source of truth for the schema shape avoids the two from drifting
// apart over time.

const OG_LOCALE_BY_LANGUAGE = {
  pt: 'pt_BR',
  'pt-br': 'pt_BR',
  en: 'en_GB',
  it: 'it_IT',
  es: 'es_ES',
};

export function getOgLocale(language) {
  const key = (language || '').toLowerCase();
  return OG_LOCALE_BY_LANGUAGE[key] || 'en_GB';
}

const HREFLANG_BY_LANGUAGE = {
  pt: 'pt-BR',
  'pt-br': 'pt-BR',
  en: 'en-GB',
  it: 'it-IT',
  es: 'es-ES',
};

export function getHreflang(language) {
  const key = (language || '').toLowerCase();
  return HREFLANG_BY_LANGUAGE[key] || 'en-GB';
}

export function buildProductSchema({ product, categoryName, siteUrl, imageUrl }) {
  const name = product.title || product.name;
  const description = product.hero_description || product.description || undefined;
  const price = Number(product.price || 0).toFixed(2);
  const guaranteeDays = product.guarantee_days ?? 14;
  const productUrl = `${siteUrl}/products/${product.slug}`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    image: imageUrl || product.image_url || undefined,
    brand: {
      '@type': 'Brand',
      name: 'UffiSolutions',
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'GBP',
      price,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'UffiSolutions',
        url: siteUrl,
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: guaranteeDays,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
      warranty: {
        '@type': 'WarrantyPromise',
        durationOfWarranty: {
          '@type': 'QuantitativeValue',
          value: guaranteeDays,
          unitCode: 'DAY',
        },
      },
    },
    category: categoryName || undefined,
  };

  if (description) schema.description = description;

  return schema;
}

export function buildFaqSchema(faq) {
  if (!Array.isArray(faq) || faq.length === 0) return null;
  const items = faq.filter((item) => item?.question && item?.answer);
  if (items.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function buildBreadcrumbSchema({ product, categoryName, categorySlug, siteUrl }) {
  const items = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
  ];

  if (categoryName && categorySlug) {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: categoryName,
      item: `${siteUrl}/?category=${categorySlug}`,
    });
  }

  items.push({
    '@type': 'ListItem',
    position: items.length + 1,
    name: product.title || product.name,
    item: `${siteUrl}/products/${product.slug}`,
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}
