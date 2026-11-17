import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  error: null,
  isConfigured: false,
  signInWithPassword: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPasswordForEmail: async () => {},
  updatePassword: async () => {}
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isConfigured = isSupabaseConfigured();

  // Helper to map Supabase session into application userSession format
  const syncApplicationSession = (currentSession) => {
    if (!currentSession?.user) {
      try {
        localStorage.removeItem('titan_user_session');
      } catch (e) {}
      return;
    }

    const supaUser = currentSession.user;
    const name = supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0] || 'Quant Trader';
    const tenantId = supaUser.id; // Tenant isolated UUID

    const appSession = {
      isAuthed: true,
      hasCompletedSetup: true,
      email: supaUser.email || '',
      name: name,
      tenantId: tenantId,
      idToken: currentSession.access_token || '',
      startingCapital: 25000,
      currency: 'AUD',
      kellyFraction: 0.50,
      spreadsheetId: ''
    };

    try {
      localStorage.setItem('titan_user_session', JSON.stringify(appSession));
    } catch (e) {}
  };

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // 1. Initial session retrieval
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (isMounted) {
          setSession(initialSession);
          setUser(initialSession?.user || null);
          syncApplicationSession(initialSession);
        }
      } catch (err) {
        console.error('Supabase Auth Initialization Error:', err);
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    // 2. Real-time auth state listener across tabs / refreshes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      setUser(currentSession?.user || null);
      syncApplicationSession(currentSession);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [isConfigured]);

  const signInWithPassword = async ({ email, password }) => {
    setError(null);
    if (!isConfigured) {
      throw new Error('Supabase credentials are not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
    }
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (signInError) {
      setError(signInError.message);
      throw signInError;
    }
    return data;
  };

  const signUp = async ({ email, password, fullName }) => {
    setError(null);
    if (!isConfigured) {
      throw new Error('Supabase credentials are not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
    }
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || ''
        }
      }
    });
    if (signUpError) {
      setError(signUpError.message);
      throw signUpError;
    }
    return data;
  };

  const signOut = async () => {
    setError(null);
    if (isConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error:', e);
      }
    }
    setSession(null);
    setUser(null);
    try {
      localStorage.removeItem('titan_user_session');
    } catch (e) {}
  };

  const resetPasswordForEmail = async (email) => {
    setError(null);
    if (!isConfigured) {
      throw new Error('Supabase credentials are not configured.');
    }
    const { data, error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (resetError) {
      setError(resetError.message);
      throw resetError;
    }
    return data;
  };

  const updatePassword = async (newPassword) => {
    setError(null);
    if (!isConfigured) {
      throw new Error('Supabase credentials are not configured.');
    }
    const { data, error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (updateError) {
      setError(updateError.message);
      throw updateError;
    }
    return data;
  };

  const value = {
    user,
    session,
    loading,
    error,
    isConfigured,
    signInWithPassword,
    signUp,
    signOut,
    resetPasswordForEmail,
    updatePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
