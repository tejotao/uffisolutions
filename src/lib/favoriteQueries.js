import { supabase } from './supabaseClient';
import { fetchAllProducts } from './catalogQueries';

// Get all favorites for a user (with product data)
export const getFavorites = async (userId) => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('favorites')
    .select('product_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) { console.error('getFavorites error:', error); return []; }
  if (!data || data.length === 0) return [];

  // Get all products to populate
  const allProducts = await fetchAllProducts();
  return data.map(fav => {
    const product = allProducts.find(p => p.id === fav.product_id);
    return product ? { ...product, favorited_at: fav.created_at } : null;
  }).filter(Boolean);
};

// Add a product to favorites
export const addFavorite = async (userId, productId) => {
  if (!userId || !productId) return false;
  const { error } = await supabase
    .from('favorites')
    .upsert({ user_id: userId, product_id: productId, created_at: new Date().toISOString() });
  if (error) { console.error('addFavorite error:', error); return false; }
  return true;
};

// Remove a product from favorites
export const removeFavorite = async (userId, productId) => {
  if (!userId || !productId) return false;
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);
  if (error) { console.error('removeFavorite error:', error); return false; }
  return true;
};

// Check if a product is in favorites
export const isFavorite = async (userId, productId) => {
  if (!userId || !productId) return false;
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();
  if (error) return false;
  return !!data;
};

// Get favorites count for a user
export const getFavoritesCount = async (userId) => {
  if (!userId) return 0;
  const { count, error } = await supabase
    .from('favorites')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (error) return 0;
  return count || 0;
};