'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Profile } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  isVolunteer: boolean;
  isApproved: boolean;
  loading: boolean;
  fetchProfile: (userId?: string) => Promise<Profile | null>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any; data: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isDemoUser: boolean;
}

const SUPER_ADMIN_EMAILS = [
  'rodrigocsantos1@gmail.com',
  'lucianort@gmail.com',
];

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isAdmin: false,
  isVolunteer: false,
  isApproved: false,
  loading: true,
  fetchProfile: async () => null,
  signInWithPassword: async () => ({ error: null }),
  signUp: async () => ({ error: null, data: null }),
  signInWithGoogle: async () => ({ error: null }),
  signOut: async () => {},
  isDemoUser: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);

  // Busca perfil do usuário no Supabase
  const fetchProfile = useCallback(async (userId?: string): Promise<Profile | null> => {
    const targetId = userId || user?.id;
    if (!targetId) return null;

    if (!isSupabaseConfigured) {
      const demoProfile: Profile = {
        id: targetId,
        name: user?.user_metadata?.name || 'Administrador',
        email: user?.email || null,
        role: 'admin',
        approved: true,
      };
      setProfile(demoProfile);
      return demoProfile;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetId)
        .maybeSingle();

      if (data) {
        setProfile(data as Profile);
        return data as Profile;
      }

      // Se não encontrou linha em profiles mas é Rodrigo ou Luciano, auto-promove
      const userEmail = (user?.email || '').toLowerCase().trim();
      if (SUPER_ADMIN_EMAILS.includes(userEmail)) {
        const adminProfile: Profile = {
          id: targetId,
          name: user?.user_metadata?.name || (userEmail.startsWith('luciano') ? 'Luciano Tomaz' : 'Rodrigo Correa'),
          email: userEmail,
          role: 'admin',
          approved: true,
        };
        // Tenta salvar no banco em background
        supabase.from('profiles').upsert([adminProfile]).then(() => {});
        setProfile(adminProfile);
        return adminProfile;
      }

      // Se for novo usuário sem perfil
      const newProfile: Profile = {
        id: targetId,
        name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'Voluntário',
        email: user?.email || null,
        role: 'volunteer',
        approved: false,
      };
      setProfile(newProfile);
      return newProfile;
    } catch (err) {
      console.warn('Aviso ao carregar perfil (usando fallback seguro):', err);
      const userEmail = (user?.email || '').toLowerCase().trim();
      const fallbackProfile: Profile = {
        id: targetId,
        name: user?.user_metadata?.name || 'Voluntário',
        email: user?.email || null,
        role: SUPER_ADMIN_EMAILS.includes(userEmail) ? 'admin' : 'volunteer',
        approved: SUPER_ADMIN_EMAILS.includes(userEmail),
      };
      setProfile(fallbackProfile);
      return fallbackProfile;
    }
  }, [user]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const savedDemo = localStorage.getItem('tnb_demo_user');
      if (savedDemo) {
        try {
          const parsed = JSON.parse(savedDemo);
          setUser(parsed);
          setProfile({
            id: parsed.id,
            name: parsed.user_metadata?.name || 'Administrador',
            email: parsed.email || null,
            role: 'admin',
            approved: true,
          });
          setIsDemoUser(true);
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
      return;
    }

    // Busca sessão ativa inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    // Escuta mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signInWithPassword = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      const demoUser = {
        id: 'demo-admin-id',
        email,
        user_metadata: { name: email.split('@')[0] },
      } as unknown as User;
      setUser(demoUser);
      setProfile({
        id: demoUser.id,
        name: email.split('@')[0],
        email,
        role: 'admin',
        approved: true,
      });
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
      setProfile({
        id: demoUser.id,
        name: name || email.split('@')[0],
        email,
        role: 'admin',
        approved: true,
      });
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
      setProfile({
        id: demoUser.id,
        name: 'Líder TNB',
        email: demoUser.email || null,
        role: 'admin',
        approved: true,
      });
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
      setProfile(null);
      setIsDemoUser(false);
      localStorage.removeItem('tnb_demo_user');
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  // Cálculo das permissões
  const isApproved = Boolean(profile?.approved);
  const isAdmin = Boolean(isApproved && profile?.role === 'admin');
  const isVolunteer = Boolean(isApproved && profile?.role === 'volunteer');

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isAdmin,
        isVolunteer,
        isApproved,
        loading,
        fetchProfile,
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
