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

export const SUPER_ADMIN_EMAILS = [
  'rodrigocsantos1@gmail.com',
  'lucianort@gmail.com',
];

export const isSuperAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase().trim());
};

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

  // Carrega ou inicializa perfil do usuário de forma segura e resiliente
  const loadProfile = useCallback(async (targetUser: User): Promise<Profile> => {
    const targetEmail = (targetUser.email || '').toLowerCase().trim();
    const isSuper = isSuperAdminEmail(targetEmail);

    // Se for Super Admin (Rodrigo ou Luciano), constrói perfil de admin imediatamente
    const adminFallback: Profile = {
      id: targetUser.id,
      name: targetUser.user_metadata?.name || (targetEmail.startsWith('luciano') ? 'Luciano Tomaz' : 'Rodrigo Correa'),
      email: targetUser.email || null,
      role: 'admin',
      approved: true,
    };

    if (isSuper) {
      setProfile(adminFallback);
    }

    if (!isSupabaseConfigured) {
      const demoProfile: Profile = isSuper
        ? adminFallback
        : {
            id: targetUser.id,
            name: targetUser.user_metadata?.name || targetEmail.split('@')[0] || 'Voluntário',
            email: targetUser.email || null,
            role: 'volunteer',
            approved: true,
          };
      setProfile(demoProfile);
      setLoading(false);
      return demoProfile;
    }

    try {
      // Query com timeout de 2.5s para NUNCA travar a tela
      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUser.id)
        .maybeSingle();

      const timeoutPromise = new Promise<{ data: any; error: any }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: new Error('Timeout ao buscar perfil') }), 2500)
      );

      const { data } = await Promise.race([queryPromise, timeoutPromise]);

      if (data) {
        const userProfile = data as Profile;
        // Se for Super Admin, garante que está aprovado como admin
        if (isSuper && (!userProfile.approved || userProfile.role !== 'admin')) {
          userProfile.approved = true;
          userProfile.role = 'admin';
          supabase.from('profiles').update({ role: 'admin', approved: true }).eq('id', targetUser.id).then(() => {});
        }
        setProfile(userProfile);
        setLoading(false);
        return userProfile;
      }

      // Se não encontrou no banco ou deu timeout
      if (isSuper) {
        supabase.from('profiles').upsert([adminFallback]).then(() => {});
        setProfile(adminFallback);
        setLoading(false);
        return adminFallback;
      }

      // Voluntário novo sem registro no banco
      const defaultVolunteer: Profile = {
        id: targetUser.id,
        name: targetUser.user_metadata?.name || targetEmail.split('@')[0] || 'Voluntário',
        email: targetUser.email || null,
        role: 'volunteer',
        approved: false,
      };
      setProfile(defaultVolunteer);
      setLoading(false);
      return defaultVolunteer;
    } catch (err) {
      console.warn('Fallback ativado no perfil:', err);
      const fallback = isSuper
        ? adminFallback
        : {
            id: targetUser.id,
            name: targetUser.user_metadata?.name || targetEmail.split('@')[0] || 'Voluntário',
            email: targetUser.email || null,
            role: 'volunteer' as const,
            approved: false,
          };
      setProfile(fallback);
      setLoading(false);
      return fallback;
    }
  }, []);

  const fetchProfile = useCallback(async (userId?: string): Promise<Profile | null> => {
    if (!user) return null;
    return await loadProfile(user);
  }, [user, loadProfile]);

  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured) {
      const savedDemo = localStorage.getItem('tnb_demo_user');
      if (savedDemo) {
        try {
          const parsed = JSON.parse(savedDemo);
          if (isMounted) {
            setUser(parsed);
            setProfile({
              id: parsed.id,
              name: parsed.user_metadata?.name || 'Administrador',
              email: parsed.email || null,
              role: 'admin',
              approved: true,
            });
            setIsDemoUser(true);
          }
        } catch {
          if (isMounted) setUser(null);
        }
      }
      if (isMounted) setLoading(false);
      return;
    }

    // Busca sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        // Se for Super Admin, define imediatamente profile e encerra loading para feedback instantâneo
        if (isSuperAdminEmail(currentUser.email)) {
          const quickAdmin: Profile = {
            id: currentUser.id,
            name: currentUser.user_metadata?.name || (currentUser.email?.toLowerCase().startsWith('luciano') ? 'Luciano Tomaz' : 'Rodrigo Correa'),
            email: currentUser.email || null,
            role: 'admin',
            approved: true,
          };
          setProfile(quickAdmin);
          setLoading(false);
        }
        loadProfile(currentUser);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // Escuta mudanças no estado de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        if (isSuperAdminEmail(currentUser.email)) {
          const quickAdmin: Profile = {
            id: currentUser.id,
            name: currentUser.user_metadata?.name || (currentUser.email?.toLowerCase().startsWith('luciano') ? 'Luciano Tomaz' : 'Rodrigo Correa'),
            email: currentUser.email || null,
            role: 'admin',
            approved: true,
          };
          setProfile(quickAdmin);
          setLoading(false);
        }
        loadProfile(currentUser);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

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
        email: 'rodrigocsantos1@gmail.com',
        user_metadata: { name: 'Rodrigo Correa' },
      } as unknown as User;
      setUser(demoUser);
      setProfile({
        id: demoUser.id,
        name: 'Rodrigo Correa',
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

  // Cálculo robusto das permissões (Super Admins NUNCA ficam bloqueados)
  const isSuper = isSuperAdminEmail(user?.email);
  const isApproved = isSuper || Boolean(profile?.approved);
  const isAdmin = isSuper || Boolean(isApproved && profile?.role === 'admin');
  const isVolunteer = !isSuper && Boolean(isApproved && profile?.role === 'volunteer');

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
