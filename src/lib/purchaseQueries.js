import { supabase } from './supabaseClient';

// Get all purchases for a user (matched by email), joining with products table
export const getUserPurchases = async (userEmail) => {
  if (!userEmail) return [];
  const { data, error } = await supabase
    .from('purchases')
    .select(`
      id, product_id, buyer_email, stripe_session, status, language, created_at,
      product:products(*)
    `)
    .eq('buyer_email', userEmail)
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  
  if (error) { 
    console.error('getUserPurchases error:', error); 
    return []; 
  }
  
  return data || [];
};

// Check if user has purchased a specific product (by email) joining products table
export const hasPurchased = async (userEmail, productId) => {
  if (!userEmail || !productId) return false;
  const { data, error } = await supabase
    .from('purchases')
    .select('id')
    .eq('buyer_email', userEmail)
    .eq('product_id', productId)
    .eq('status', 'active')
    .single();
  if (error) return false;
  return !!data;
};

// Create a purchase record (after Stripe payment) in products flow
export const createPurchase = async (buyerEmail, productId, stripeSession = null, language = 'pt-BR') => {
  const { data, error } = await supabase
    .from('purchases')
    .insert({
      buyer_email: buyerEmail,
      product_id: productId,
      stripe_session: stripeSession,
      status: 'active',
      language,
    })
    .select()
    .single();
  if (error) { console.error('createPurchase error:', error); return null; }
  return data;
};