
import { supabase } from './supabaseClient';

export const DELIVERABLE_TYPES = ['pdf', 'video', 'external', 'drive', 'other'];

// ─── Reads ──────────────────────────────────────────────────────────────────

export const getDeliverablesForProduct = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('product_deliverables')
      .select('*')
      .eq('product_id', productId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('getDeliverablesForProduct error:', error);
    return [];
  }
};

// Batch fetch for dashboards/lists — avoids N+1 queries.
// Returns a Map<product_id, deliverable[]>
export const getDeliverablesForProducts = async (productIds) => {
  const ids = [...new Set((productIds || []).filter(Boolean))];
  if (ids.length === 0) return new Map();
  try {
    const { data, error } = await supabase
      .from('product_deliverables')
      .select('*')
      .in('product_id', ids)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    const map = new Map();
    (data || []).forEach((d) => {
      if (!map.has(d.product_id)) map.set(d.product_id, []);
      map.get(d.product_id).push(d);
    });
    return map;
  } catch (error) {
    console.error('getDeliverablesForProducts error:', error);
    return new Map();
  }
};

// ─── Writes (admin only) ────────────────────────────────────────────────────

// Replaces the full deliverable list for a product. Simplest, safest mutation
// strategy for small admin-curated lists — avoids per-row diffing.
export const replaceProductDeliverables = async (productId, items) => {
  try {
    const { error: deleteError } = await supabase
      .from('product_deliverables')
      .delete()
      .eq('product_id', productId);
    if (deleteError) throw deleteError;

    const rows = (items || [])
      .filter((it) => it.url && it.url.trim())
      .map((it, idx) => ({
        product_id: productId,
        type: DELIVERABLE_TYPES.includes(it.type) ? it.type : 'other',
        label: it.label?.trim() || null,
        url: it.url.trim(),
        sort_order: idx,
      }));

    if (rows.length === 0) return { data: [], error: null };

    const { data, error: insertError } = await supabase
      .from('product_deliverables')
      .insert(rows)
      .select();
    if (insertError) throw insertError;
    return { data, error: null };
  } catch (error) {
    console.error('replaceProductDeliverables error:', error);
    return { data: null, error };
  }
};
