'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any; data: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isDemoUser: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signInWithPassword: async () => ({ error: null }),
  signUp: async () => ({ error: null, data: null }),
  signInWithGoogle: async () => ({ error: null }),
  signOut: async () => {},
  isDemoUser: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // No modo demo, recupera usuário simulado salvo no localStorage
      const savedDemo = localStorage.getItem('tnb_demo_user');
      if (savedDemo) {
        try {
          setUser(JSON.parse(savedDemo));
          setIsDemoUser(true);
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
      return;
    }

    // Busca sessão ativa
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escuta alterações de estado de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      const demoUser = {
        id: 'demo-admin-id',
        email,
        user_metadata: { name: email.split('@')[0] },
      } as unknown as User;
      setUser(demoUser);
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
      setIsDemoUser(false);
      localStorage.removeItem('tnb_demo_user');
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signInWithPassword,
        signUp,
        signInWithGoogle,
        signOut,
        isDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
