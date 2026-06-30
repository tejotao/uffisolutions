
import { supabase } from './supabaseClient';

const getPrefix = (lang) => {
  const l = (lang || '').toLowerCase();
  if (l.includes('pt')) return 'PT';
  if (l.includes('en')) return 'EN';
  if (l.includes('es')) return 'ES';
  if (l.includes('it')) return 'IT';
  return 'XX';
};

export const generateProductCode = async (language) => {
  console.log('🔤 Starting product code generation for language:', language);
  try {
    const prefix = getPrefix(language);
    console.log('➡️ Determined prefix:', prefix);

    const { data, error } = await supabase
      .from('products')
      .select('product_code')
      .not('product_code', 'is', null);

    if (error) {
      console.error('❌ Error fetching product codes:', error);
      throw error;
    }

    console.log('📊 Fetched existing codes count:', data?.length || 0);

    let maxNumber = 0;
    if (data && data.length > 0) {
      data.forEach(p => {
        if (p.product_code) {
          const numPart = p.product_code.replace(/[^0-9]/g, '');
          if (numPart) {
            const num = parseInt(numPart, 10);
            if (num > maxNumber) maxNumber = num;
          }
        }
      });
    }

    console.log('🔢 Highest existing number:', maxNumber);
    const nextNumber = maxNumber + 1;
    const paddedNumber = String(nextNumber).padStart(4, '0');
    const finalCode = `${prefix}${paddedNumber}`;

    console.log('✅ Generated new product code:', finalCode);
    return finalCode;
  } catch (error) {
    console.error('❌ Failed to generate product code:', error);
    throw error;
  }
};

export const checkProductCodeExists = async (code) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .eq('product_code', code)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return !!data;
  } catch (error) {
    console.error('❌ Error checking product code:', error);
    return false;
  }
};
