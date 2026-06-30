import { supabase } from './supabaseClient';

// ==========================================
// CATEGORIES FUNCTIONS
// ==========================================

export const createCategory = async (payload) => {
  try {
    const { slug, icon, color, sort_order, active } = payload;
    const { data, error } = await supabase
      .from('categories')
      .insert([{ slug, icon, color, sort_order, active }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating category:', error.message);
    return { data: null, error };
  }
};

export const updateCategory = async (id, payload) => {
  try {
    const { slug, icon, color, sort_order, active } = payload;
    const updateData = {};
    
    if (slug !== undefined) updateData.slug = slug;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (sort_order !== undefined) updateData.sort_order = sort_order;
    if (active !== undefined) updateData.active = active;

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error updating category (ID: ${id}):`, error.message);
    return { data: null, error };
  }
};

export const deleteCategory = async (id) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error deleting category (ID: ${id}):`, error.message);
    return { data: null, error };
  }
};

export const fetchCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    return { data: null, error };
  }
};

// ==========================================
// CLIENTS FUNCTIONS
// ==========================================

export const fetchClients = async (searchTerm = '') => {
  try {
    let query = supabase
      .from('profiles')
      .select('id, full_name, email');

    if (searchTerm && searchTerm.trim() !== '') {
      const search = `%${searchTerm.trim()}%`;
      query = query.or(`full_name.ilike.${search},email.ilike.${search}`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching clients:', error.message);
    return { data: null, error };
  }
};

export const updateClientProfile = async (id, payload) => {
  try {
    // Sanitize payload to only include full_name and email
    const sanitizedPayload = {};
    if (payload.full_name !== undefined) sanitizedPayload.full_name = payload.full_name;
    if (payload.email !== undefined) sanitizedPayload.email = payload.email;

    // Check if there's anything to update
    if (Object.keys(sanitizedPayload).length === 0) {
      throw new Error("No valid fields provided for update. Only 'full_name' and 'email' are allowed.");
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(sanitizedPayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error updating client profile (ID: ${id}):`, error.message);
    return { data: null, error };
  }
};