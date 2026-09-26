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

-- Índices para melhor performance em consultas e agregações
CREATE INDEX IF NOT EXISTS idx_scores_team_id ON public.scores(team_id);
CREATE INDEX IF NOT EXISTS idx_scores_activity_id ON public.scores(activity_id);
CREATE INDEX IF NOT EXISTS idx_scores_created_at ON public.scores(created_at DESC);

-- ==============================================================================
-- SEGURANÇA E ACESSO (ROW LEVEL SECURITY - RLS)
-- Configuração para uso direto por administradores/liderança sem barreira de login
-- ==============================================================================
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- Políticas para tabela teams
DROP POLICY IF EXISTS "Anon leitura total teams" ON public.teams;
DROP POLICY IF EXISTS "Anon insercao teams" ON public.teams;
DROP POLICY IF EXISTS "Anon atualizacao teams" ON public.teams;
DROP POLICY IF EXISTS "Anon delecao teams" ON public.teams;

CREATE POLICY "Anon leitura total teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Anon insercao teams" ON public.teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon atualizacao teams" ON public.teams FOR UPDATE USING (true);
CREATE POLICY "Anon delecao teams" ON public.teams FOR DELETE USING (true);

-- Políticas para tabela activities
DROP POLICY IF EXISTS "Anon leitura total activities" ON public.activities;
DROP POLICY IF EXISTS "Anon insercao activities" ON public.activities;
DROP POLICY IF EXISTS "Anon atualizacao activities" ON public.activities;
DROP POLICY IF EXISTS "Anon delecao activities" ON public.activities;

CREATE POLICY "Anon leitura total activities" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Anon insercao activities" ON public.activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon atualizacao activities" ON public.activities FOR UPDATE USING (true);
CREATE POLICY "Anon delecao activities" ON public.activities FOR DELETE USING (true);

-- Políticas para tabela scores
DROP POLICY IF EXISTS "Anon leitura total scores" ON public.scores;
DROP POLICY IF EXISTS "Anon insercao scores" ON public.scores;
DROP POLICY IF EXISTS "Anon atualizacao scores" ON public.scores;
DROP POLICY IF EXISTS "Anon delecao scores" ON public.scores;

CREATE POLICY "Anon leitura total scores" ON public.scores FOR SELECT USING (true);
CREATE POLICY "Anon insercao scores" ON public.scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon atualizacao scores" ON public.scores FOR UPDATE USING (true);
CREATE POLICY "Anon delecao scores" ON public.scores FOR DELETE USING (true);

-- ==============================================================================
-- HABILITAÇÃO DO SUPABASE REALTIME
-- ==============================================================================
-- Adiciona tabelas na publicação do Realtime para atualização instantânea
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

-- ==============================================================================
-- DADOS INICIAIS OPCIONAIS (SEED DATA)
-- Descomente as linhas abaixo caso deseje carregar equipes e provas de exemplo:
-- ==============================================================================
/*
INSERT INTO public.teams (id, name, color) VALUES
  ('d1b11111-1111-1111-1111-111111111111', 'Leão de Judá', '#ef4444'),
  ('d1b22222-2222-2222-2222-222222222222', 'Guerreiros da Fé', '#3b82f6'),
  ('d1b33333-3333-3333-3333-333333333333', 'Águias do Reino', '#f59e0b'),
  ('d1b44444-4444-4444-4444-444444444444', 'Tocha Viva', '#10b981')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.activities (id, title, description, max_points) VALUES
  ('a1b11111-1111-1111-1111-111111111111', 'Circuito Radical do Acampa', 'Corrida de obstáculos com cooperação de toda a equipe', 100),
  ('a1b22222-2222-2222-2222-222222222222', 'Grito de Guerra & Animação', 'Apresentação coreografada com entusiasmo e respeito', 50),
  ('a1b33333-3333-3333-3333-333333333333', 'Quiz Bíblico & Versículos', 'Perguntas rápidas sobre a Palavra de Deus', 80),
  ('a1b44444-4444-4444-4444-444444444444', 'Caça ao Tesouro', 'Desvendar enigmas pelo acampamento', 120)
ON CONFLICT (id) DO NOTHING;
*/
