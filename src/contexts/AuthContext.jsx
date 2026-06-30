import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext({});

// Admin emails - only these can access /admin
const ADMIN_EMAILS = ['tejotao@gmail.com'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load profile from Supabase profiles table
  const loadProfile = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) setProfile(data);
    } catch (e) {
      console.error('Error loading profile:', e);
    }
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          loadProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  // Check if current user is admin
  const isAdmin = useCallback(() => {
    if (!user || !user.email) return false;
    return ADMIN_EMAILS.includes(user.email.toLowerCase());
  }, [user]);

  // Register new user
  const signUp = async (email, password, fullName, preferredLanguage = 'pt-BR') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, preferred_language: preferredLanguage }
      }
    });
    if (error) throw error;

    // Create profile record (RLS is OFF so this works without being logged in)
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        email: email,
        preferred_language: preferredLanguage,
        xp: 0,
        level: 'Curioso',
        created_at: new Date().toISOString()
      });
    }
    return data;
  };

  // Sign in existing user
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
  };

  // Send password reset email
  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/password-reset'
    });
    if (error) throw error;
  };

  // Update password (when user has reset link token)
  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  // Update profile
  const updateProfile = async (updates) => {
    if (!user) throw new Error('Not authenticated');
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...updates });
    if (error) throw error;
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const value = {
    user,
    profile,
    loading,
    isAdmin,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    loadProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;