'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isCheckingAdmin: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any; data: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isDemoUser: boolean;
  checkAdminStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  isCheckingAdmin: true,
  signInWithPassword: async () => ({ error: null }),
  signUp: async () => ({ error: null, data: null }),
  signInWithGoogle: async () => ({ error: null }),
  signOut: async () => {},
  isDemoUser: false,
  checkAdminStatus: async () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);

  // Função para verificar se o usuário é Administrador autorizado no banco
  const checkAdminStatus = useCallback(async (targetUser?: User | null): Promise<boolean> => {
    const currentUser = targetUser !== undefined ? targetUser : user;
    if (!currentUser || !currentUser.email) {
      setIsAdmin(false);
      setIsCheckingAdmin(false);
      return false;
    }

    if (!isSupabaseConfigured) {
      setIsAdmin(true);
      setIsCheckingAdmin(false);
      return true;
    }

    try {
      setIsCheckingAdmin(true);
      const userEmail = currentUser.email.toLowerCase().trim();

      // 1. Checa na tabela allowed_admins
      const { data: allowed, error: allowedErr } = await supabase
        .from('allowed_admins')
        .select('*')
        .ilike('email', userEmail)
        .maybeSingle();

      if (allowed && (allowed.role === 'admin' || !allowed.role)) {
        setIsAdmin(true);
        setIsCheckingAdmin(false);
        return true;
      }

      // 2. Checa na tabela profiles
      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (profile && profile.role === 'admin') {
        setIsAdmin(true);
        setIsCheckingAdmin(false);
        return true;
      }

      setIsAdmin(false);
      setIsCheckingAdmin(false);
      return false;
    } catch (err) {
      console.error('Erro ao verificar status de administrador:', err);
      setIsAdmin(false);
      setIsCheckingAdmin(false);
      return false;
    }
  }, [user]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const savedDemo = localStorage.getItem('tnb_demo_user');
      if (savedDemo) {
        try {
          const parsed = JSON.parse(savedDemo);
          setUser(parsed);
          setIsAdmin(true);
          setIsDemoUser(true);
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
      setIsCheckingAdmin(false);
      return;
    }

    // Busca sessão ativa
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        checkAdminStatus(currentUser);
      } else {
        setIsAdmin(false);
        setIsCheckingAdmin(false);
      }
      setLoading(false);
    });

    // Escuta alterações de estado de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await checkAdminStatus(currentUser);
      } else {
        setIsAdmin(false);
        setIsCheckingAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAdminStatus]);

  const signInWithPassword = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      const demoUser = {
        id: 'demo-admin-id',
        email,
        user_metadata: { name: email.split('@')[0] },
      } as unknown as User;
      setUser(demoUser);
      setIsAdmin(true);
      setIsDemoUser(true);
      localStorage.setItem('tnb_demo_user', JSON.stringify(demoUser));
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, name?: string) => {
    if (!isSupabaseConfigured) {
      const demoUser = {
        id: 'demo-admin-id',
        email,
        user_metadata: { name: name || email.split('@')[0] },
      } as unknown as User;
      setUser(demoUser);
      setIsAdmin(true);
      setIsDemoUser(true);
      localStorage.setItem('tnb_demo_user', JSON.stringify(demoUser));
      return { error: null, data: { user: demoUser } };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}` : undefined,
      },
    });
    return { error, data };
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      const demoUser = {
        id: 'demo-google-id',
        email: 'lider.tnb@igreja.com',
        user_metadata: { name: 'Líder TNB' },
      } as unknown as User;
      setUser(demoUser);
      setIsAdmin(true);
      setIsDemoUser(true);
      localStorage.setItem('tnb_demo_user', JSON.stringify(demoUser));
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}` : undefined,
      },
    });
    return { error };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setIsAdmin(false);
      setIsDemoUser(false);
      localStorage.removeItem('tnb_demo_user');
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        isCheckingAdmin,
        signInWithPassword,
        signUp,
        signInWithGoogle,
        signOut,
        isDemoUser,
        checkAdminStatus: () => checkAdminStatus(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
