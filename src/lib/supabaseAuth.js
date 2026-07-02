
import { supabase } from './supabaseClient';

export const clearAllAuthTokens = () => {
  console.log('🔑 [Auth] Limpando todos os tokens de autenticação...');
  try {
    const storages = [window.localStorage, window.sessionStorage];
    storages.forEach(storage => {
      const keysToRemove = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => storage.removeItem(key));
    });
    console.log('✅ [Auth] Tokens limpos com sucesso.');
    return { success: true, error: null };
  } catch (error) {
    console.error('❌ [Auth] Erro ao limpar tokens:', error);
    return { success: false, error };
  }
};

export const initializeAuth = async () => {
  console.log('🔄 [Auth] Inicializando autenticação...');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('❌ [Auth] Erro ao inicializar sessão:', error.message);
      clearAllAuthTokens();
      return { success: false, data: null, error };
    }
    console.log('✅ [Auth] Sessão inicializada com sucesso.');
    return { success: true, data: data.session, error: null };
  } catch (error) {
    console.error('❌ [Auth] Erro inesperado ao inicializar:', error);
    clearAllAuthTokens();
    return { success: false, data: null, error };
  }
};

export const getCurrentUser = async () => {
  console.log('ℹ️ [Auth] Buscando usuário atual...');
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    if (session?.user) {
      return { success: true, data: session.user, error: null };
    }
    return { success: true, data: null, error: null };
  } catch (error) {
    console.error('❌ [Auth] Erro ao buscar usuário:', error.message);
    return { success: false, data: null, error };
  }
};

export const getCurrentUserWithRole = async () => {
  console.log('ℹ️ [Auth] Buscando usuário atual com role...');
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    if (session?.user) {
      const user = session.user;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, role, client_code, status, full_name')
        .eq('id', user.id)
        .single();

      user.is_admin = profile?.is_admin || false;
      user.role = profile?.role || (user.is_admin ? 'admin' : 'user');
      user.client_code = profile?.client_code || null;
      user.status = profile?.status || 'active';
      user.full_name = profile?.full_name || null;
      
      if (user.email === 'tejotao@gmail.com') {
        user.is_admin = true;
        user.role = 'super_admin';
      }
      
      return { success: true, data: user, error: null };
    }
    return { success: true, data: null, error: null };
  } catch (error) {
    console.error('❌ [Auth] Erro ao buscar usuário com role:', error.message);
    return { success: false, data: null, error };
  }
};

export const isAuthenticated = async () => {
  const { data } = await getCurrentUser();
  return { success: true, data: !!data, error: null };
};

export const loginWithEmail = async (email, password) => {
  console.log(`🔐 [Auth] Tentando login para: ${email}`);
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { success: true, data, error: null };
  } catch (error) {
    console.error('❌ [Auth] Erro no login:', error.message);
    return { success: false, data: null, error };
  }
};

export const logout = async () => {
  console.log('🔄 [Auth] Realizando logout...');
  try {
    const { error } = await supabase.auth.signOut();
    clearAllAuthTokens();
    if (error) throw error;
    return { success: true, data: null, error: null };
  } catch (error) {
    console.error('❌ [Auth] Erro ao fazer logout:', error.message);
    clearAllAuthTokens();
    return { success: false, data: null, error };
  }
};

export const signUpWithEmail = async (email, password, clientCode, name) => {
  try {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          client_code: clientCode,
          full_name: name,
          name: name
        }
      }
    });
    
    if (error) throw error;
    
    if (data?.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: email,
        client_code: clientCode,
        full_name: name,
        name: name,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    }
    
    return { success: true, data, error: null };
  } catch (error) {
    console.error('SignUp Error:', error);
    return { success: false, data: null, error };
  }
};

export const resetPassword = async (email) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return { success: true, data, error: null };
  } catch (error) {
    return { success: false, data: null, error };
  }
};

export const updatePassword = async (newPassword) => {
  try {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return { success: true, data, error: null };
  } catch (error) {
    return { success: false, data: null, error };
  }
};

export const onAuthStateChange = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      clearAllAuthTokens();
    }
    callback(event, session);
  });
  return subscription;
};
