/**
 * accessQueries.js
 * All queries related to the user_product_access table.
 * This file MUST NOT touch auth context, sessions, or ProtectedRoute logic.
 */

import { supabase } from './supabaseClient';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns true if the access has no expiry OR if today is before/on the expiry date. */
export const isAccessValid = (expiryDate) => {
  if (!expiryDate) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(expiryDate) >= today;
};

/** Number of days until expiry (negative = already expired). */
export const daysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(expiryDate) - today) / (1000 * 60 * 60 * 24));
};

// ─── Admin queries ────────────────────────────────────────────────────────────

/**
 * List every product access row for a specific user (admin use).
 * Uses manual two-step join so it works even without FK constraints declared.
 */
export const getAccessesForUser = async (userId) => {
  const { data: rows, error } = await supabase
    .from('user_product_access')
    .select('id, product_id, granted_at, expiry_date, is_active, notes, granted_by')
    .eq('user_id', userId)
    .order('granted_at', { ascending: false });

  if (error) {
    console.error('getAccessesForUser error:', error);
    return { data: [], error };
  }
  if (!rows || rows.length === 0) return { data: [], error: null };

  const productIds = [...new Set(rows.map((r) => r.product_id))];
  const { data: products } = await supabase
    .from('products')
    .select('id, title, name, product_type, access_url, drive_link, image_url, price, is_free, language, active')
    .in('id', productIds);

  const byId = Object.fromEntries((products || []).map((p) => [p.id, p]));

  return {
    data: rows.map((row) => ({ ...row, product: byId[row.product_id] ?? null })),
    error: null,
  };
};

/**
 * Grant (or update) access to a product for a user.
 * Uses upsert so re-granting updates the expiry date without creating duplicates.
 */
export const grantProductAccess = async ({
  userId,
  productId,
  expiryDate = null,
  grantedBy = null,
  notes = null,
}) => {
  const { data, error } = await supabase
    .from('user_product_access')
    .upsert(
      {
        user_id: userId,
        product_id: productId,
        granted_by: grantedBy,
        expiry_date: expiryDate || null,
        is_active: true,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,product_id' }
    )
    .select()
    .single();

  return { data, error };
};

/**
 * Grant access to MULTIPLE products at once for the same user.
 */
export const grantMultipleProductAccess = async ({
  userId,
  productIds,
  expiryDate = null,
  grantedBy = null,
  notes = null,
}) => {
  const results = await Promise.all(
    productIds.map((productId) =>
      grantProductAccess({ userId, productId, expiryDate, grantedBy, notes })
    )
  );
  const errors = results.filter((r) => r.error).map((r) => r.error);
  return { errors };
};

/**
 * Update only the expiry date of an existing access row.
 */
export const updateAccessExpiry = async (accessId, expiryDate) => {
  const { data, error } = await supabase
    .from('user_product_access')
    .update({ expiry_date: expiryDate || null, updated_at: new Date().toISOString() })
    .eq('id', accessId)
    .select()
    .single();

  return { data, error };
};

/**
 * Permanently remove an access row (hard delete).
 */
export const revokeProductAccess = async (userId, productId) => {
  const { error } = await supabase
    .from('user_product_access')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  return { error };
};

/**
 * Load ALL access rows in one shot so the board can compute per-user counts.
 * Returns a Map<userId, { active: number, total: number, productIds: string[] }>
 */
export const getAllAccessSummary = async () => {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('user_product_access')
    .select('user_id, product_id, expiry_date, is_active');

  if (error) { console.error('getAllAccessSummary error:', error); return new Map(); }

  const map = new Map();
  for (const row of data || []) {
    if (!map.has(row.user_id)) map.set(row.user_id, { active: 0, total: 0, productIds: [] });
    const entry = map.get(row.user_id);
    entry.total++;
    entry.productIds.push(row.product_id);
    if (row.is_active && (row.expiry_date === null || row.expiry_date >= today)) entry.active++;
  }
  return map;
};

// ─── User-side queries ────────────────────────────────────────────────────────

/**
 * Get all ACTIVE (non-expired) product accesses for the currently logged-in user.
 */
export const getMyActiveAccesses = async (userId) => {
  if (!userId) return [];
  const today = new Date().toISOString().split('T')[0];

  const { data: rows, error } = await supabase
    .from('user_product_access')
    .select('product_id, expiry_date, is_active')
    .eq('user_id', userId)
    .eq('is_active', true)
    .or(`expiry_date.is.null,expiry_date.gte.${today}`);

  if (error || !rows?.length) {
    if (error) console.error('getMyActiveAccesses error:', error);
    return [];
  }

  const productIds = [...new Set(rows.map((r) => r.product_id))];
  const { data: products } = await supabase
    .from('products')
    .select('id, title, name, description, product_type, access_url, drive_link, image_url, price, is_free, language, featured, active')
    .in('id', productIds);

  const byId = Object.fromEntries((products || []).map((p) => [p.id, p]));

  return rows
    .filter((row) => byId[row.product_id])
    .map((row) => ({
      ...byId[row.product_id],
      expiry_date: row.expiry_date,
      _accessExpiry: row.expiry_date,
    }));
};
