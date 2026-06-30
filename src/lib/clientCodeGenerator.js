
import { supabase } from './supabaseClient';

export const checkClientCodeExists = async (code) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('client_code', code)
      .maybeSingle();
      
    if (error && error.code !== 'PGRST116') {
      console.error('Database error checking client code:', error);
      return false; 
    }
    
    return !!data;
  } catch (err) {
    console.error('Error checking client code:', err);
    return false;
  }
};

export const generateClientCode = async () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  let exists = true;
  let attempts = 0;

  while (exists && attempts < 10) {
    let randomStr = '';
    for (let i = 0; i < 4; i++) {
      randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code = `UFFI-${randomStr}`;
    exists = await checkClientCodeExists(code);
    attempts++;
  }
  
  if (exists) {
    console.warn('Failed to generate a unique client code after 10 attempts. Falling back to timestamp-based code.');
    code = `UFFI-${Date.now().toString().slice(-4)}`;
  }
  
  return code;
};
