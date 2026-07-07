
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Play, ShoppingCart, Star, Clock, Users, User, ArrowLeft, Heart, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { fetchAllProducts } from '@/lib/catalogQueries';
import { getUserPurchases } from '@/lib/purchaseQueries';
import { getMyActiveAccesses, grantProductAccess } from '@/lib/accessQueries';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-[#f59e0b]/30">
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
                <div className="flex items-center gap-3 mb-6">
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

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                  {product.title || product.name}
                </h1>
                
                <p className="text-lg text-gray-400 mb-8 leading-relaxed max-w-2xl">
                  {product.description || t('detail.desc_unavailable')}
                </p>

                <div className="flex flex-wrap items-center gap-6 mt-auto">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Star className="text-[#f59e0b] fill-[#f59e0b]" size={20} />
                    <span className="font-bold text-white">{product.rating || '5.0'}</span>
                    <span className="text-sm text-gray-500">(120+ {t('detail.rating_count')})</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <User className="text-gray-400" size={20} />
                    <span>{product.instructor || 'Expert'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="text-gray-400" size={20} />
                    <span>{product.duration || t('detail.lifetime')}</span>
                  </div>
                </div>
              </div>

              {/* Sidebar Action Card */}
              <div className="lg:col-span-5">
                <div className={`bg-[#141414] border rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden group transition-colors ${isFree ? 'border-green-500/40 hover:border-green-500/80 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'border-[#2a2a2a] hover:border-[#f59e0b]/50'}`}>
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-${isFree ? 'green-500' : '[#f59e0b]'}/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full pointer-events-none`} />
                  
                  <div className={`aspect-[16/9] rounded-2xl bg-[#0a0a0a] border overflow-hidden mb-8 relative ${isFree ? 'border-green-500/30' : 'border-[#2a2a2a]'}`}>
                    {isFree && (
                      <div className="absolute top-4 left-4 bg-green-500 text-black px-3 py-1.5 rounded-lg text-sm font-black z-10 shadow-lg">
                        🎁 Free
                      </div>
                    )}
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#2a2a2a] group-hover:scale-105 transition-transform duration-700">
                        <Play size={64} className="opacity-20" />
                      </div>
                    )}
                    <button 
                      onClick={toggleFavorite}
                      className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md border border-white/10 transition-all z-10 ${isFavorite ? 'bg-red-500/20 text-red-500' : 'bg-black/40 text-white hover:bg-black/60 hover:text-red-500'}`}
                    >
                      <Heart size={20} className={isFavorite ? "fill-red-500" : ""} />
                    </button>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-end gap-2 mb-2">
                      {isFree ? (
                        <span className="text-4xl font-black text-green-500">{t('product.free')}</span>
                      ) : (
                        <>
                          <span className="text-4xl font-black text-white">£{Number(product.price).toFixed(2)}</span>
                          <span className="text-gray-500 text-lg line-through mb-1">£{(Number(product.price) * 1.5).toFixed(2)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* ── Action button — context-aware ── */}
                  {isFree ? (
                    !user ? (
                      /* Guest + Free → register to get access */
                      <button onClick={() => navigate('/register')}
                        className="w-full py-4 rounded-xl flex items-center justify-center gap-3 font-black text-lg transition-all shadow-xl bg-[#10b981] hover:bg-[#059669] text-black hover:scale-[1.02] active:scale-[0.98] mb-4">
                        🎁 Get Free Access
                      </button>
                    ) : hasAccess ? (
                      /* Logged in + has access → open modal */
                      <button onClick={openAccessModal}
                        className="w-full py-4 rounded-xl flex items-center justify-center gap-3 font-black text-lg transition-all shadow-xl bg-[#f59e0b] hover:bg-[#d97706] text-black hover:scale-[1.02] active:scale-[0.98] mb-4">
                        <Play size={22} className="fill-black" /> {t('detail.access')}
                      </button>
                    ) : (
                      /* Logged in + free + no access yet → grant */
                      <button onClick={handleFreeAccess} disabled={isGranting}
                        className="w-full py-4 rounded-xl flex items-center justify-center gap-3 font-black text-lg transition-all shadow-xl bg-[#10b981] hover:bg-[#059669] text-black hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 mb-4">
                        {isGranting ? <Loader2 size={22} className="animate-spin" /> : '🎁 Get Free Access'}
                      </button>
                    )
                  ) : (
                    !user ? (
                      /* Guest + Paid → buy */
                      <button onClick={handleBuy}
                        className="w-full py-4 rounded-xl flex items-center justify-center gap-3 font-black text-lg transition-all shadow-xl bg-[#f59e0b] hover:bg-[#d97706] text-black hover:scale-[1.02] active:scale-[0.98] mb-4">
                        <ShoppingCart size={24} /> {t('detail.buy_now')}
                      </button>
                    ) : hasAccess ? (
                      /* Logged in + paid + has access → open modal */
                      <button onClick={openAccessModal}
                        className="w-full py-4 rounded-xl flex items-center justify-center gap-3 font-black text-lg transition-all shadow-xl bg-[#f59e0b] hover:bg-[#d97706] text-black hover:scale-[1.02] active:scale-[0.98] mb-4">
                        <Play size={22} className="fill-black" /> {t('detail.access')}
                      </button>
                    ) : (
                      /* Logged in + paid + no access → buy */
                      <button onClick={handleBuy}
                        className="w-full py-4 rounded-xl flex items-center justify-center gap-3 font-black text-lg transition-all shadow-xl bg-[#f59e0b] hover:bg-[#d97706] text-black hover:scale-[1.02] active:scale-[0.98] mb-4">
                        <ShoppingCart size={24} /> {t('detail.buy_now')}
                      </button>
                    )
                  )}

                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 font-medium">
                    <Users size={16} /> +1000 {t('detail.students')}
                  </div>
                </div>
              </div>

            </div>
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
                    className={`bg-[#141414] border rounded-2xl overflow-hidden cursor-pointer transition-colors group flex flex-col ${rpIsFree ? 'border-green-500/40 hover:border-green-500/80' : 'border-[#2a2a2a] hover:border-[#f59e0b]/50'}`}
                  >
                    <div className="aspect-video bg-[#0a0a0a] relative overflow-hidden">
                      {rpIsFree && (
                        <div className="absolute top-2 left-2 bg-green-500 text-black px-2 py-1 rounded text-sm font-black z-10 shadow-lg">
                          🎁 Free
                        </div>
                      )}
                      {rp.image_url ? (
                        <img src={rp.image_url} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                      <h3 className={`font-bold text-white mb-2 line-clamp-2 transition-colors ${rpIsFree ? 'group-hover:text-green-400' : 'group-hover:text-[#f59e0b]'}`}>{rp.title || rp.name}</h3>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-grow">{rp.description}</p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#2a2a2a]">
                        <span className="font-black text-white">
                          {rpIsFree ? <span className="text-green-500">{t('product.free')}</span> : `£${Number(rp.price).toFixed(2)}`}
                        </span>
                        <span className={`font-bold text-sm px-3 py-1 rounded-lg ${rpIsFree ? 'text-green-500 bg-green-500/10' : 'text-[#f59e0b] bg-[#f59e0b]/10'}`}>
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
