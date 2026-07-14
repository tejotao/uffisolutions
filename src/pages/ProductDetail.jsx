
import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Play, ShoppingCart, Star, Clock, User, ArrowLeft, Heart, AlertCircle, Loader2, CheckCircle,
  ShieldCheck, ChevronDown, Quote,
} from 'lucide-react';
import { fetchAllProducts } from '@/lib/catalogQueries';
import { getUserPurchases } from '@/lib/purchaseQueries';
import { getMyActiveAccesses, grantProductAccess } from '@/lib/accessQueries';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { optimizedImageUrl } from '@/lib/imageUrl';
import { supabase } from '@/lib/supabaseClient';
import { buildProductSchema, buildFaqSchema, buildBreadcrumbSchema, getOgLocale } from '@/lib/productSchema';
import { getCtaVariant, getFreeCta, getFreeSubtext, getAuthorityLine, getObjections, getTagline } from '@/lib/conversionCopy';

const SITE_URL = 'https://www.uffisolutions.com';

export default function ProductDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { language, t } = useLanguage();

  const [product, setProduct]           = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [isFavorite, setIsFavorite]     = useState(false);
  const [hasAccess, setHasAccess]       = useState(false);
  const [isGranting, setIsGranting]     = useState(false);
  const [openFaqIdx, setOpenFaqIdx]     = useState(null);
  const [categoryName, setCategoryName] = useState(null);

  // Translation strings that carry a "{days}" placeholder (guarantee copy) —
  // getTranslation only does flat key lookup, so the interpolation happens here.
  const tf = (key, vars = {}) =>
    Object.entries(vars).reduce((str, [k, v]) => str.replaceAll(`{${k}}`, v), t(key));

  // A product page is for one specific language variant — switching the
  // site language here would leave stale content and mismatched UI (e.g. an
  // Italian product page suddenly wrapped in Portuguese buttons). Instead,
  // send the visitor to the catalog, already filtered to the new language.
  const initialLanguageRef = useRef(language);
  useEffect(() => {
    if (language !== initialLanguageRef.current) {
      navigate('/products');
    }
  }, [language, navigate]);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const products = await fetchAllProducts('all');
        const found = products.find(p => p.id === id || p.slug === id);

        if (found) {
          setProduct(found);
          const related = products.filter(p => {
            const pLang = (p.language || 'en').toLowerCase();
            return p.category_id === found.category_id && p.id !== found.id && pLang.includes(language);
          }).slice(0, 3);
          setRelatedProducts(related);

          // Check user access
          if (user) {
            const [purchases, accesses] = await Promise.all([
              getUserPurchases(user.email),
              getMyActiveAccesses(user.id),
            ]);
            const purchasedIds = new Set((purchases || []).map(p => p.product_id));
            const accessIds    = new Set((accesses  || []).map(a => a.id));
            setHasAccess(purchasedIds.has(found.id) || accessIds.has(found.id));
          }
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadProduct();
  }, [id, language, user]);

  // English category name for JSON-LD/breadcrumb — normalizeProduct()'s own
  // `categoryName` (catalogQueries.js) is just the capitalized slug, not a
  // real translation, and category_translations is empty at the time this
  // was written, so neither is usable here. `categories.name` is the real,
  // populated column — queried directly rather than touching the shared
  // fetchAllProducts() select (used by every other page).
  useEffect(() => {
    if (!product?.category_id) { setCategoryName(null); return; }
    let cancelled = false;
    supabase.from('categories').select('name').eq('id', product.category_id).single()
      .then(({ data }) => { if (!cancelled) setCategoryName(data?.name || null); });
    return () => { cancelled = true; };
  }, [product?.category_id]);

  const getLanguageFlag = (lang) => {
    if (!lang) return '🌐';
    const l = lang.toLowerCase();
    if (l.includes('pt-br') || l === 'pt') return '🇧🇷';
    if (l.includes('en')) return '🇬🇧';
    if (l.includes('es')) return '🇪🇸';
    if (l.includes('it')) return '🇮🇹';
    return '🌐';
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? t('toast.success') : t('toast.success'),
      description: isFavorite ? t('toast.fav_remove') : t('toast.fav_add'),
    });
  };

  const handleBuy = () => {
    if (!user) {
      localStorage.setItem('uffi_pending_buy', product.id);
      const lang = product.language ? `?lang=${product.language}` : '';
      navigate(`/start${lang}`);
      return;
    }
    const link = product.stripe_link || product.stripe_payment_link;
    if (!link) { toast({ title: t('toast.error'), description: 'Payment link not configured yet.', variant: 'destructive' }); return; }
    const url = new URL(link);
    url.searchParams.set('client_reference_id', `${user.id}_${product.id}`);
    url.searchParams.set('prefilled_email', user.email);
    window.open(url.toString(), '_blank');
  };

  // Resumes a purchase started before login/registration (see handleBuy above
  // and UserDashboard's pending-buy redirect) once the user and product are
  // both loaded.
  useEffect(() => {
    if (user && product && searchParams.get('autobuy') === '1') {
      searchParams.delete('autobuy');
      setSearchParams(searchParams, { replace: true });
      handleBuy();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, product]);

  const handleFreeAccess = async () => {
    if (!user) { navigate('/register'); return; }
    setIsGranting(true);
    try {
      const { error } = await grantProductAccess({
        userId: user.id, productId: product.id,
        expiryDate: null, grantedBy: user.id, notes: 'Self-claimed free product',
      });
      // Even if RLS blocks the DB write (SQL policy not yet applied),
      // still send the user to their library so they can access the content.
      if (!error) {
        setHasAccess(true);
        toast({ title: '🎁 Access granted!', description: 'Added to your library.', className: 'border-emerald-500 bg-zinc-900 text-white' });
      }
      navigate(`/library/${product.slug || product.id}`);
    } catch {
      // Fallback: go to library anyway (free product = accessible)
      navigate(`/library/${product.slug || product.id}`);
    } finally {
      setIsGranting(false);
    }
  };

  const openAccessModal = () => navigate(`/library/${product.slug || product.id}`);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
        <Header user={user} isAdminPage={false} />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#f59e0b]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
        <Header user={user} isAdminPage={false} />
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle size={64} className="text-red-500 mb-6" />
          <h1 className="text-3xl font-black mb-4">{t('detail.not_found')}</h1>
          <p className="text-gray-400 mb-8">{t('detail.not_found_desc')}</p>
          <button 
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 bg-[#f59e0b] text-black px-6 py-3 rounded-xl font-bold hover:bg-[#d97706] transition-colors"
          >
            <ArrowLeft size={20} /> {t('detail.back_catalog')}
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Inactive products stay reachable for people who already own them (so
  // they can still find their way to the Library), but are otherwise treated
  // as unavailable — never a route to a fresh purchase.
  if (product.active === false && !hasAccess) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
        <Header user={user} isAdminPage={false} />
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle size={64} className="text-red-500 mb-6" />
          <h1 className="text-3xl font-black mb-4">{t('detail.unavailable')}</h1>
          <p className="text-gray-400 mb-8">{t('detail.unavailable_desc')}</p>
          <button
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 bg-[#f59e0b] text-black px-6 py-3 rounded-xl font-bold hover:bg-[#d97706] transition-colors"
          >
            <ArrowLeft size={20} /> {t('detail.back_catalog')}
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const isFree = product.is_free || parseFloat(product.price) === 0 || !product.price;
  const guaranteeDays = product.guarantee_days ?? 14;

  // Shared primary CTA — used at every CTA position on the page (hero,
  // mid-page, before FAQ, final), so the buy/access/free logic only lives in
  // one place. `ctaIndex` picks a different purchase phrase per position
  // (see src/lib/conversionCopy.js) so the same line is never repeated
  // twice on one page; it only affects the not-yet-purchased paid branch.
  const renderCtaButton = (wrapperClassName = 'mb-4', ctaIndex = 0) => {
    const buttonBase = 'w-full py-4 rounded-xl flex items-center justify-center gap-3 font-black text-lg transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]';
    if (isFree) {
      if (!user) {
        return (
          <div className={wrapperClassName}>
            <button onClick={() => navigate('/register')} className={`${buttonBase} bg-[#10b981] hover:bg-[#059669] text-black`}>
              🎁 {getFreeCta(product.language)}
            </button>
            <p className="text-xs text-gray-500 text-center mt-2.5">{getFreeSubtext(product.language)}</p>
          </div>
        );
      }
      if (hasAccess) {
        return (
          <div className={wrapperClassName}>
            <button onClick={openAccessModal} className={`${buttonBase} bg-[#f59e0b] hover:bg-[#d97706] text-black`}>
              <Play size={22} className="fill-black" /> {t('detail.access')}
            </button>
          </div>
        );
      }
      return (
        <div className={wrapperClassName}>
          <button onClick={handleFreeAccess} disabled={isGranting} className={`${buttonBase} bg-[#10b981] hover:bg-[#059669] text-black disabled:opacity-70`}>
            {isGranting ? <Loader2 size={22} className="animate-spin" /> : `🎁 ${getFreeCta(product.language)}`}
          </button>
          <p className="text-xs text-gray-500 text-center mt-2.5">{getFreeSubtext(product.language)}</p>
        </div>
      );
    }
    if (user && hasAccess) {
      return (
        <div className={wrapperClassName}>
          <button onClick={openAccessModal} className={`${buttonBase} bg-[#f59e0b] hover:bg-[#d97706] text-black`}>
            <Play size={22} className="fill-black" /> {t('detail.access')}
          </button>
        </div>
      );
    }
    return (
      <div className={wrapperClassName}>
        <button onClick={handleBuy} className={`${buttonBase} bg-[#f59e0b] hover:bg-[#d97706] text-black`}>
          <ShoppingCart size={24} /> {getCtaVariant(product.language, ctaIndex)}
        </button>
      </div>
    );
  };

  const pageTitle = `${product.title || product.name} — UffiSolutions`;
  const pageDescription = (product.hero_description || product.description || '').slice(0, 160);
  const canonicalUrl = `${SITE_URL}/products/${product.slug || product.id}`;
  const ogLocale = getOgLocale(product.language);

  const productSchema = buildProductSchema({
    product, categoryName, siteUrl: SITE_URL, imageUrl: optimizedImageUrl(product.image_url, { width: 1200, height: 675, quality: 80 }),
  });
  const faqSchema = buildFaqSchema(product.faq);
  const breadcrumbSchema = buildBreadcrumbSchema({
    product, categoryName, categorySlug: product.categorySlug, siteUrl: SITE_URL,
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-[#f59e0b]/30">
      <Helmet>
        <title>{pageTitle}</title>
        {pageDescription && <meta name="description" content={pageDescription} />}
        <meta property="og:title" content={pageTitle} />
        {pageDescription && <meta property="og:description" content={pageDescription} />}
        <meta property="og:type" content="product" />
        <meta property="og:locale" content={ogLocale} />
        {product.image_url && <meta property="og:image" content={product.image_url} />}
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
        {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>
      <Header user={user} isAdminPage={false} />
      
      <main className="flex-grow pt-24 pb-16">
        
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[#141414] to-[#0a0a0a] border-b border-[#2a2a2a] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#f59e0b]/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#3b82f6]/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative z-10">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-400 hover:text-[#f59e0b] transition-colors mb-8 text-sm font-medium w-fit"
            >
              <ArrowLeft size={16} /> {t('detail.back')}
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
              
              {/* Image & Main Info */}
              <div className="lg:col-span-7 flex flex-col">
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  {product.badge_text && (
                    <span className="px-3 py-1 bg-[#f59e0b] text-black rounded-lg text-sm font-black">
                      {product.badge_text}
                    </span>
                  )}
                  <span className="text-3xl" title="Language">
                    {getLanguageFlag(product.language)}
                  </span>
                  {product.categoryName && (
                    <span className="px-3 py-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm font-medium text-gray-300">
                      {product.categoryName}
                    </span>
                  )}
                  {product.level && (
                    <span className={`px-3 py-1 bg-[#f59e0b]/10 border rounded-lg text-sm font-bold capitalize ${isFree ? 'border-green-500/20 text-green-500' : 'border-[#f59e0b]/20 text-[#f59e0b]'}`}>
                      {product.level}
                    </span>
                  )}
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-[1.1] tracking-tight">
                  {product.title || product.name}
                </h1>

                {product.tagline && (
                  <p className="text-xl text-[#f59e0b] font-semibold mb-4">{product.tagline}</p>
                )}

                {!isFree && (
                  <p className="text-base text-gray-300 italic mb-4 max-w-2xl">
                    {getAuthorityLine(product.language)}
                  </p>
                )}

                <p className="text-lg text-gray-400 mb-8 leading-relaxed max-w-2xl">
                  {product.hero_description || product.description || t('detail.desc_unavailable')}
                </p>

                <div className="flex flex-wrap items-center gap-6 mt-auto mb-6">
                  <div className="flex items-center gap-2 text-gray-300">
                    <User className="text-gray-400" size={20} />
                    <span>{product.instructor || 'Expert'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="text-gray-400" size={20} />
                    <span>{product.duration || t('detail.lifetime')}</span>
                  </div>
                </div>

                {product.target_audience && (
                  <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5 max-w-2xl">
                    <p className="text-xs font-bold text-[#f59e0b] uppercase tracking-wider mb-1.5">{t('detail.audience_title')}</p>
                    <p className="text-gray-300 leading-relaxed">{product.target_audience}</p>
                  </div>
                )}
              </div>

              {/* Sidebar Action Card */}
              <div className="lg:col-span-5">
                <div className={`bg-[#141414] border rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden group transition-colors ${isFree ? 'border-[#f59e0b]/40 hover:border-[#f59e0b]/80 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'border-[#2a2a2a] hover:border-[#f59e0b]/50'}`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#f59e0b]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full pointer-events-none" />

                  <div className={`aspect-[16/9] rounded-2xl bg-[#0a0a0a] border overflow-hidden mb-8 relative ${isFree ? 'border-[#f59e0b]/30' : 'border-[#2a2a2a]'}`}>
                    {isFree && (
                      <div className="absolute top-4 left-4 bg-[#f59e0b] text-black px-4 py-2 rounded-lg text-base font-black z-10 shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                        🎁 {t('product.free')}
                      </div>
                    )}
                    {product.image_url ? (
                      <img src={optimizedImageUrl(product.image_url, { width: 900, height: 506 })} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#2a2a2a] group-hover:scale-105 transition-transform duration-700">
                        <Play size={64} className="opacity-20" />
                      </div>
                    )}
                    <button
                      onClick={toggleFavorite}
                      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md border border-white/10 transition-all z-10 ${isFavorite ? 'bg-red-500/20 text-red-500' : 'bg-black/40 text-white hover:bg-black/60 hover:text-red-500'}`}
                    >
                      <Heart size={20} className={isFavorite ? "fill-red-500" : ""} />
                    </button>
                  </div>

                  {/* ── Action button — context-aware ── */}
                  {renderCtaButton('', 0)}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* What's Included */}
        {Array.isArray(product.includes) && product.includes.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
            <h2 className="text-2xl font-black text-white mb-8 border-l-4 border-[#f59e0b] pl-4">
              {t('detail.includes_title')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.includes.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
                  <CheckCircle size={20} className="text-[#f59e0b] shrink-0" />
                  <span className="text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sections / Phases */}
        {Array.isArray(product.sections) && product.sections.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
            <h2 className="text-2xl font-black text-white mb-8 border-l-4 border-[#f59e0b] pl-4">
              {t('detail.sections_title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {product.sections.map((section, idx) => (
                <div key={idx} className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6 hover:border-[#f59e0b]/40 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    {section.icon && <span className="text-3xl">{section.icon}</span>}
                    {section.title && <h3 className="text-lg font-bold text-white">{section.title}</h3>}
                  </div>
                  {section.description && (
                    <p className="text-gray-400 mb-4 leading-relaxed">{section.description}</p>
                  )}
                  {Array.isArray(section.bullets) && section.bullets.length > 0 && (
                    <ul className="space-y-2">
                      {section.bullets.map((bullet, bi) => (
                        <li key={bi} className="flex items-start gap-2 text-sm text-gray-300">
                          <CheckCircle size={16} className="text-[#f59e0b] shrink-0 mt-0.5" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Mid-page CTA — paid products only, distinct phrase from hero/final */}
        {!isFree && (
          <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
            <div className="max-w-md mx-auto">
              {renderCtaButton('', 1)}
            </div>
          </section>
        )}

        {/* What You'll Receive */}
        {Array.isArray(product.what_you_learn) && product.what_you_learn.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
            <h2 className="text-2xl font-black text-white mb-8 border-l-4 border-[#f59e0b] pl-4">
              {t('detail.receive_title')}
            </h2>
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6 lg:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {product.what_you_learn.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Guarantee */}
        {product.guarantee_text && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
            <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/30 rounded-3xl p-8 lg:p-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <ShieldCheck size={64} className="text-green-500 shrink-0" />
              <div>
                <h2 className="text-2xl font-black text-white mb-2">{tf('detail.guarantee_heading', { days: guaranteeDays })}</h2>
                <p className="text-gray-300 leading-relaxed mb-2">{product.guarantee_text}</p>
                <p className="text-green-400 font-bold text-sm">{t('detail.guarantee_no_questions')}</p>
              </div>
            </div>
          </section>
        )}

        {/* CTA before FAQ — paid products only, distinct phrase */}
        {!isFree && (
          <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
            <div className="max-w-md mx-auto">
              {renderCtaButton('', 2)}
            </div>
          </section>
        )}

        {/* FAQ */}
        {Array.isArray(product.faq) && product.faq.length > 0 && (
          <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
            <h2 className="text-2xl font-black text-white mb-8 border-l-4 border-[#f59e0b] pl-4">
              {t('detail.faq_title')}
            </h2>
            <div className="space-y-3">
              {product.faq.map((item, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div key={idx} className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden">
                    <button type="button" onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left">
                      <span className="font-semibold text-white">{item.question}</span>
                      <ChevronDown size={18} className={`text-[#f59e0b] shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-gray-400 leading-relaxed">{item.answer}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Testimonials */}
        {Array.isArray(product.testimonials) && product.testimonials.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
            <h2 className="text-2xl font-black text-white mb-8 border-l-4 border-[#f59e0b] pl-4">
              {t('detail.testimonials_title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {product.testimonials.map((item, idx) => (
                <div key={idx} className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6 flex flex-col">
                  <Quote size={24} className="text-[#f59e0b]/40 mb-3" />
                  <p className="text-gray-300 leading-relaxed mb-4 flex-grow">{item.text}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-[#2a2a2a]">
                    <span className="font-bold text-white text-sm">{item.name}</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star key={si} size={14} className={si < (item.rating || 5) ? 'text-[#f59e0b] fill-[#f59e0b]' : 'text-gray-700'} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="bg-gradient-to-b from-[#141414] to-[#0a0a0a] border border-[#2a2a2a] rounded-3xl p-8 lg:p-12 text-center">
            <h2 className="text-3xl font-black text-white mb-3">{t('detail.cta_final_heading')}</h2>

            {/* Objection elimination — honest, low-key trust signals right before the last CTA */}
            {!isFree && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 mb-8 mt-6">
                {getObjections(product.language, guaranteeDays).map((objection, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="text-lg">{objection.icon}</span>
                    <span>{objection.text}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="max-w-md mx-auto">
              {renderCtaButton('', 3)}
            </div>
            {product.guarantee_text && (
              <p className="text-sm text-gray-500 mt-4">{tf('detail.cta_final_guarantee', { days: guaranteeDays })}</p>
            )}
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
            <h2 className="text-2xl font-black text-white mb-8 border-l-4 border-[#f59e0b] pl-4">
              {t('detail.related')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProducts.map(rp => {
                const rpIsFree = rp.is_free || parseFloat(rp.price) === 0 || !rp.price;
                return (
                  <div
                    key={rp.id}
                    onClick={() => navigate(rpIsFree && !user ? '/login' : `/products/${rp.slug || rp.id}`)}
                    className={`bg-[#141414] border rounded-2xl overflow-hidden cursor-pointer transition-colors group flex flex-col ${rpIsFree ? 'border-[#f59e0b]/40 hover:border-[#f59e0b]/80' : 'border-[#2a2a2a] hover:border-[#f59e0b]/50'}`}
                  >
                    <div className="aspect-video bg-[#0a0a0a] relative overflow-hidden">
                      {rpIsFree && (
                        <div className="absolute top-2 left-2 bg-[#f59e0b] text-black px-3 py-1.5 rounded-lg text-base font-black z-10 shadow-[0_0_16px_rgba(245,158,11,0.5)]">
                          🎁 {t('product.free')}
                        </div>
                      )}
                      {rp.image_url ? (
                        <img src={optimizedImageUrl(rp.image_url, { width: 560, height: 315 })} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
                          <Play size={32} className="text-[#2a2a2a]" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-lg z-10">
                        {getLanguageFlag(rp.language)}
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="font-bold text-white mb-1 line-clamp-2 transition-colors group-hover:text-[#f59e0b]">{rp.title || rp.name}</h3>
                      <p className={`text-xs font-medium mb-2 ${rpIsFree ? 'text-[#f59e0b]' : 'text-gray-500'}`}>
                        {getTagline(rp.language, rpIsFree)}
                      </p>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-grow">{rp.description}</p>
                      <div className="mt-auto pt-4 border-t border-[#2a2a2a]">
                        <span className="block text-center font-bold text-sm px-3 py-2 rounded-lg text-[#f59e0b] bg-[#f59e0b]/10 transition-all group-hover:shadow-[0_0_20px_rgba(245,158,11,0.55)] group-hover:bg-[#f59e0b]/20">
                          {t('product.learn_more')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
