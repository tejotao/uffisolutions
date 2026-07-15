// Site-level JSON-LD builders (Organization, CollectionPage) — distinct
// from src/lib/productSchema.js, which is scoped to individual product
// pages. Pure functions, no React dependency, so they're safe to reuse from
// build-time Node scripts (tools/*.js) later if the Home page ever gets its
// own prerender step.
import { companyInfo } from '@/config/legal.js';

const SITE_URL = 'https://www.uffisolutions.com';
// Same logo already used for OG/Twitter images in index.html — kept as one
// literal here rather than a shared constant, since this is the only other
// place it's needed.
const LOGO_URL = 'https://horizons-cdn.hostinger.com/1db78d05-91f5-4455-8f8f-f031a8b68532/57e87afb0356e1c00547152607556f48.png';

// `address` is passed straight through as the Text form Schema.org accepts
// for `address` (rather than hand-parsed into a PostalAddress object) —
// avoids a hardcoded split silently going stale if companyInfo.address ever
// changes without updating a parser here too.
export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: companyInfo.brandName,
    legalName: companyInfo.legalName,
    url: SITE_URL,
    logo: LOGO_URL,
    taxID: companyInfo.crn,
    email: companyInfo.email,
    address: companyInfo.address,
    sameAs: companyInfo.sameAs,
  };
}

export function buildCollectionPageSchema({ name, description, url }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      name: companyInfo.brandName,
      url: SITE_URL,
    },
  };
}
