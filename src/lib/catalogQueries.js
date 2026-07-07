
import { supabase } from './supabaseClient';

export function normalizeProduct(p, language = 'pt') {
  if (!p) return null;
  
  const prodTrans = p.product_translations?.find(t => t.language === language) || p.product_translations?.[0] || {};
  const cat = p.categories;
  
  const derivedCatName = cat?.slug ? cat.slug.charAt(0).toUpperCase() + cat.slug.slice(1) : 'Outros';
  
  return {
    ...p,
    id: p.id,
    slug: p.slug,
    title: prodTrans.name || p.name || p.title || 'Sem título',
    name: prodTrans.name || p.name || p.title || 'Sem título',
    description: prodTrans.description || p.description || '',
    price: p.price || 0,
    isFree: p.is_free === true || parseFloat(p.price) === 0,
    is_free: p.is_free === true || parseFloat(p.price) === 0,
    imageUrl: p.image_url || null,
    image_url: p.image_url || null,
    level: p.level || null,
    xpValue: p.xp_value || 0,
    featured: p.featured || false,
    stripeLink: p.stripe_payment_link || p.stripe_link || p.stripeLink || null,
    stripe_payment_link: p.stripe_payment_link || p.stripe_link || p.stripeLink || null,
    driveLink: p.drive_link || null,
    format: p.format || null,
    
    category_id: p.category_id || cat?.id || null,
    categorySlug: cat?.slug || null,
    categoryName: derivedCatName,
    categoryIcon: cat?.icon || '📁',
    category: cat ? {
      id: cat.id,
      slug: cat.slug,
      name: derivedCatName,
      color: cat.color || '#666',
      icon: cat.icon || '📁'
    } : null,
    active: p.active || false,
  };
}

// --- PRODUCTS ---
export const fetchAllProducts = async (language = 'pt') => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_translations(language, name, description), categories!products_category_id_fkey(id, slug, color, icon)')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return (data || []).map(p => normalizeProduct(p, language));
  } catch (error) {
    console.error('fetchAllProducts error:', error);
    return [];
  }
};

export const fetchAllProductsAllLanguages = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_translations(language, name, description), categories!products_category_id_fkey(id, slug, color, icon)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Normalize using the product's own language or fallback
    return (data || []).map(p => normalizeProduct(p, p.language || 'pt'));
  } catch (error) {
    console.error('fetchAllProductsAllLanguages error:', error);
    return [];
  }
};

export const fetchProductsByCategory = async (categoryId, language = 'pt') => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_translations(language, name, description), categories!products_category_id_fkey(id, slug, color, icon)')
      .eq('category_id', categoryId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return (data || []).map(p => normalizeProduct(p, language));
  } catch (error) {
    console.error('fetchProductsByCategory error:', error);
    return [];
  }
};

export const createProduct = async (productData) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('createProduct error:', error);
    return { data: null, error };
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('updateProduct error:', error);
    return { data: null, error };
  }
};

export const deleteProduct = async (id) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('deleteProduct error:', error);
    return { error };
  }
};

// Fire-and-forget, anonymous — no user_id/email collected on purpose.
// Failures are swallowed since this is best-effort analytics, not a
// user-facing feature.
export const logSearch = async (query, language) => {
  try {
    await supabase.from('search_logs').insert({ query, language });
  } catch {
    // ignore — non-critical
  }
};

// --- LANGUAGES ---
export const fetchLanguages = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('language')
      .not('language', 'is', null);
      
    if (error) throw error;
    
    const uniqueLangs = [...new Set(data.map(item => item.language))];
    return uniqueLangs.sort();
  } catch (error) {
    console.error('fetchLanguages error:', error);
    return [];
  }
};

// --- CATEGORIES ---
export const fetchAllCategories = async (language = 'pt') => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, slug, color, icon, sort_order, active, name, name_pt, name_it, name_es, description, category_translations(language, name, description)')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return (data || []).map(cat => {
      const trans = cat.category_translations?.find(t => t.language === language) || cat.category_translations?.[0] || {};
      const derivedName = trans.name || (cat.slug ? cat.slug.charAt(0).toUpperCase() + cat.slug.slice(1) : 'Other');
      // Per-language names, read from category_translations (the real source of
      // truth for display) rather than the legacy flat columns on `categories` —
      // used by the admin CRUD modal to prefill the edit form correctly.
      const byLang = { en: '', pt: '', it: '', es: '' };
      (cat.category_translations || []).forEach(t => {
        if (t.language in byLang) byLang[t.language] = t.name || '';
      });
      return {
        id: cat.id,
        slug: cat.slug,
        icon: cat.icon || '📁',
        color: cat.color || '#666',
        name: derivedName,
        description: trans.description || '',
        active: cat.active,
        is_active: cat.active,
        name_en: byLang.en,
        name_pt: byLang.pt,
        name_it: byLang.it,
        name_es: byLang.es,
        description_raw: trans.description || ''
      };
    });
  } catch (error) {
    console.error('fetchAllCategories error:', error);
    return [];
  }
};

export const fetchCategories = async (language = 'pt') => {
  try {
    return await fetchAllCategories(language);
  } catch (error) {
    console.error('fetchCategories error:', error);
    return [];
  }
};

export const fetchCategoriesForAdmin = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, slug, color, icon, active, category_translations(language, name, description)');

    if (error) throw error;

    const formatted = (data || []).map(cat => {
      const trans = cat.category_translations?.[0] || {};
      const derivedName = trans.name || (cat.slug ? cat.slug.charAt(0).toUpperCase() + cat.slug.slice(1) : 'Other');
      return {
        id: cat.id,
        slug: cat.slug,
        icon: cat.icon || '📁',
        color: cat.color || '#666',
        name: derivedName,
        description: trans.description || '',
        is_active: cat.active,
        active: cat.active
      };
    });

    return formatted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  } catch (error) {
    console.error('fetchCategoriesForAdmin error:', error);
    return [];
  }
};

export const createCategory = async (categoryData) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select()
      .single();
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('createCategory error:', error);
    return { data: null, error };
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('updateCategory error:', error);
    return { data: null, error };
  }
};

// Every public-facing read (fetchAllCategories, catalogue filters, product
// forms) derives the displayed category name from this table, not from the
// flat name/name_pt/name_it/name_es columns on `categories` — those only
// exist for the admin form and are otherwise unused for display.
export const upsertCategoryTranslations = async (categoryId, names, description) => {
  const rows = ['en', 'pt', 'it', 'es'].map((language) => ({
    category_id: categoryId,
    language,
    name: names[language] || '',
    description: description || '',
  }));
  const { error } = await supabase
    .from('category_translations')
    .upsert(rows, { onConflict: 'category_id,language' });
  if (error) console.error('upsertCategoryTranslations error:', error);
  return { error };
};

export const deleteCategory = async (id) => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('deleteCategory error:', error);
    return { error };
  }
};

// --- USERS ---
export const fetchAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;

    // Deduplicate by email — only the first occurrence (most recent) is kept.
    // Orphan rows created with random UUIDs that share an email are discarded.
    const seen = new Set();
    return (data || []).filter((u) => {
      const key = (u.email || u.id || '').toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch (error) {
    console.error('fetchAllUsers error:', error);
    return [];
  }
};

export const createUser = async (userData) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([userData])
      .select()
      .single();
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('createUser error:', error);
    return { data: null, error };
  }
};

export const updateUser = async (id, userData) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(userData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('updateUser error:', error);
    return { data: null, error };
  }
};

export const deleteUser = async (id) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('deleteUser error:', error);
    return { error };
  }
};
