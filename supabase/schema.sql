-- ==============================================================================
-- APP ACAMPA TNB - ESQUEMA DE BANCO DE DADOS (SUPABASE / POSTGRESQL)
-- Ministério Infantil Tô na Bênção (IBP)
-- ==============================================================================

-- 0. Habilita extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE EQUIPES (TEAMS)
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#78c8fb',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABELA DE PROVAS E ATIVIDADES (ACTIVITIES)
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  max_points INTEGER,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELA DE PONTUAÇÕES (SCORES)
CREATE TABLE IF NOT EXISTS public.scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES public.activities(id) ON DELETE SET NULL,
  points NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABELA OPCIONAL DE PERFIS (PROFILES DOS ADMINISTRADORES)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Gatilho para criar perfil automaticamente no cadastro de usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'admin'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Índices para melhor performance em consultas e agregações
CREATE INDEX IF NOT EXISTS idx_scores_team_id ON public.scores(team_id);
CREATE INDEX IF NOT EXISTS idx_scores_activity_id ON public.scores(activity_id);
CREATE INDEX IF NOT EXISTS idx_scores_created_at ON public.scores(created_at DESC);

-- ==============================================================================
-- SEGURANÇA E ACESSO (ROW LEVEL SECURITY - RLS)
-- Leitura pública para Telão e Placar, Escrita protegida para usuários autenticados
-- ==============================================================================
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para tabela teams
DROP POLICY IF EXISTS "Leitura publica teams" ON public.teams;
DROP POLICY IF EXISTS "Gerenciamento autenticado teams" ON public.teams;
DROP POLICY IF EXISTS "Anon fallback teams" ON public.teams;

CREATE POLICY "Leitura publica teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Gerenciamento autenticado teams" ON public.teams FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Anon fallback teams" ON public.teams FOR ALL TO anon USING (true) WITH CHECK (true);

-- Políticas para tabela activities
DROP POLICY IF EXISTS "Leitura publica activities" ON public.activities;
DROP POLICY IF EXISTS "Gerenciamento autenticado activities" ON public.activities;
DROP POLICY IF EXISTS "Anon fallback activities" ON public.activities;

CREATE POLICY "Leitura publica activities" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Gerenciamento autenticado activities" ON public.activities FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Anon fallback activities" ON public.activities FOR ALL TO anon USING (true) WITH CHECK (true);

-- Políticas para tabela scores
DROP POLICY IF EXISTS "Leitura publica scores" ON public.scores;
DROP POLICY IF EXISTS "Gerenciamento autenticado scores" ON public.scores;
DROP POLICY IF EXISTS "Anon fallback scores" ON public.scores;

CREATE POLICY "Leitura publica scores" ON public.scores FOR SELECT USING (true);
CREATE POLICY "Gerenciamento autenticado scores" ON public.scores FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Anon fallback scores" ON public.scores FOR ALL TO anon USING (true) WITH CHECK (true);

-- Políticas para tabela profiles
DROP POLICY IF EXISTS "Leitura publica profiles" ON public.profiles;
DROP POLICY IF EXISTS "Proprio usuario gerencia seu perfil" ON public.profiles;

CREATE POLICY "Leitura publica profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Proprio usuario gerencia seu perfil" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ==============================================================================
-- HABILITAÇÃO DO SUPABASE REALTIME
-- ==============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'teams'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'activities'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'scores'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.scores;
  END IF;
END $$;
