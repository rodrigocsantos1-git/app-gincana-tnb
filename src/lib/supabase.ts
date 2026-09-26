import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('seu-projeto') &&
  supabaseUrl.startsWith('https://')
);

if (!isSupabaseConfigured && typeof window !== 'undefined') {
  console.info(
    'ℹ️ App Acampa: Rodando em modo de demonstração local. Para persistência com Supabase e Realtime, configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local.'
  );
}

// Inicializa o cliente Supabase se as variáveis existirem, senão cria cliente dummy para não quebrar a compilação
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder-project.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key',
  {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);
