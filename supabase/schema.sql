-- ==============================================================================
-- APP ACAMPA TNB - ESQUEMA DE BANCO DE DADOS (SUPABASE / POSTGRESQL)
-- Ministério Infantil Tô na Bênção (IBP)
-- ==============================================================================

-- 0. Habilita extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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

-- 4. TABELA DE PERFIS DE USUÁRIO (PROFILES)
-- Vinculada ao auth.users do Supabase com papéis: 'admin' e 'volunteer'
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT CHECK (role IN ('admin', 'volunteer')) DEFAULT 'volunteer',
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Garantir colunas caso a tabela já tenha sido criada anteriormente
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'volunteer';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- ------------------------------------------------------------------------------
-- FUNÇÕES AUXILIARES DE PERMISSÃO (RLS HELPERS)
-- ------------------------------------------------------------------------------

-- Verifica se o usuário atual é Administrador Aprovado
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND approved = TRUE
  );
END;
$$;

-- Verifica se o usuário atual é Aprovado (Administrador ou Voluntário)
CREATE OR REPLACE FUNCTION public.is_approved()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND approved = TRUE
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- TRIGGER: CRIAÇÃO AUTOMÁTICA DE PERFIL NO CADASTRO (GOOGLE OU E-MAIL)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  is_first BOOLEAN;
  is_super_admin BOOLEAN;
  initial_name TEXT;
BEGIN
  -- Se for o primeiríssimo usuário cadastrado, torna Admin automaticamente
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles) INTO is_first;
  
  -- Verifica se é um dos e-mails de administração fixa (Rodrigo ou Luciano)
  is_super_admin := lower(new.email) IN ('rodrigocsantos1@gmail.com', 'lucianort@gmail.com');

  initial_name := COALESCE(
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'full_name',
    split_part(new.email, '@', 1)
  );

  INSERT INTO public.profiles (id, name, email, role, approved, updated_at)
  VALUES (
    new.id,
    initial_name,
    new.email,
    CASE WHEN is_first OR is_super_admin THEN 'admin' ELSE 'volunteer' END,
    CASE WHEN is_first OR is_super_admin THEN TRUE ELSE FALSE END,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = CASE WHEN is_super_admin THEN 'admin' ELSE public.profiles.role END,
    approved = CASE WHEN is_super_admin THEN TRUE ELSE public.profiles.approved END,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Auto-promove Rodrigo e Luciano caso seus registros já existam no banco
UPDATE public.profiles
SET role = 'admin', approved = TRUE
WHERE lower(email) IN ('rodrigocsantos1@gmail.com', 'lucianort@gmail.com');

-- ------------------------------------------------------------------------------
-- FUNÇÕES RPC SEGURAS PARA ADMINISTRAÇÃO DE USUÁRIOS
-- ------------------------------------------------------------------------------

-- Cadastrar novo usuário pelo Administrador (sem precisar esperar login Google)
CREATE OR REPLACE FUNCTION public.admin_create_user(
  new_email TEXT,
  new_password TEXT DEFAULT '',
  new_name TEXT DEFAULT '',
  new_role TEXT DEFAULT 'volunteer'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  existing_user_id UUID;
  new_user_id UUID := gen_random_uuid();
  formatted_email TEXT := lower(trim(new_email));
  v_password TEXT := trim(COALESCE(new_password, ''));
  is_gmail BOOLEAN := (formatted_email LIKE '%@gmail.com' OR formatted_email LIKE '%@googlemail.com');
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem cadastrar usuários.';
  END IF;

  -- Se o usuário já existir no auth.users
  SELECT id INTO existing_user_id FROM auth.users WHERE email = formatted_email;
  IF existing_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, name, email, role, approved, updated_at)
    VALUES (
      existing_user_id,
      trim(new_name),
      formatted_email,
      new_role,
      TRUE,
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      name = COALESCE(NULLIF(trim(new_name), ''), public.profiles.name),
      email = EXCLUDED.email,
      role = EXCLUDED.role,
      approved = TRUE,
      updated_at = NOW();

    IF v_password <> '' AND LENGTH(v_password) >= 6 THEN
      UPDATE auth.users
      SET encrypted_password = extensions.crypt(v_password, extensions.gen_salt('bf')),
          updated_at = NOW()
      WHERE id = existing_user_id;
    END IF;

    RETURN existing_user_id;
  END IF;

  -- Se for conta Gmail e não forneceu senha, gera senha aleatória segura
  IF v_password = '' THEN
    IF is_gmail THEN
      v_password := encode(extensions.gen_random_bytes(16), 'hex');
    ELSE
      v_password := 'Tnb' || substring(encode(extensions.gen_random_bytes(4), 'hex') from 1 for 6) || '!';
    END IF;
  END IF;

  -- Cria usuário no auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud
  )
  VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    formatted_email,
    extensions.crypt(v_password, extensions.gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    json_build_object('name', trim(new_name))::jsonb,
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  );

  -- Cria perfil aprovado no public.profiles
  INSERT INTO public.profiles (id, name, email, role, approved, updated_at)
  VALUES (
    new_user_id,
    trim(new_name),
    formatted_email,
    new_role,
    TRUE,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    approved = TRUE,
    updated_at = NOW();

  RETURN new_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_create_user(TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- Excluir usuário completamente por um Administrador
CREATE OR REPLACE FUNCTION public.delete_user_by_admin(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem excluir usuários.';
  END IF;

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Você não pode excluir o seu próprio usuário.';
  END IF;

  -- Exclui perfil e usuário de autenticação
  DELETE FROM public.profiles WHERE id = target_user_id;
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_user_by_admin(UUID) TO authenticated;

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_scores_team_id ON public.scores(team_id);
CREATE INDEX IF NOT EXISTS idx_scores_activity_id ON public.scores(activity_id);
CREATE INDEX IF NOT EXISTS idx_scores_created_at ON public.scores(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ==============================================================================
-- SEGURANÇA E ACESSO (ROW LEVEL SECURITY - RLS)
-- ==============================================================================
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- TEAMS
DROP POLICY IF EXISTS "Leitura publica teams" ON public.teams;
DROP POLICY IF EXISTS "Gerenciamento autenticado teams" ON public.teams;
DROP POLICY IF EXISTS "Anon fallback teams" ON public.teams;

CREATE POLICY "Leitura publica teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Gerenciamento autenticado teams" ON public.teams FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Anon fallback teams" ON public.teams FOR ALL TO anon USING (true) WITH CHECK (true);

-- ACTIVITIES
DROP POLICY IF EXISTS "Leitura publica activities" ON public.activities;
DROP POLICY IF EXISTS "Gerenciamento autenticado activities" ON public.activities;
DROP POLICY IF EXISTS "Anon fallback activities" ON public.activities;

CREATE POLICY "Leitura publica activities" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Gerenciamento autenticado activities" ON public.activities FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Anon fallback activities" ON public.activities FOR ALL TO anon USING (true) WITH CHECK (true);

-- SCORES
DROP POLICY IF EXISTS "Leitura publica scores" ON public.scores;
DROP POLICY IF EXISTS "Gerenciamento autenticado scores" ON public.scores;
DROP POLICY IF EXISTS "Anon fallback scores" ON public.scores;

CREATE POLICY "Leitura publica scores" ON public.scores FOR SELECT USING (true);
CREATE POLICY "Gerenciamento autenticado scores" ON public.scores FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Anon fallback scores" ON public.scores FOR ALL TO anon USING (true) WITH CHECK (true);

-- PROFILES
DROP POLICY IF EXISTS "Leitura publica profiles" ON public.profiles;
DROP POLICY IF EXISTS "Proprio usuario gerencia seu perfil" ON public.profiles;
DROP POLICY IF EXISTS "Administradores gerenciam perfis" ON public.profiles;
DROP POLICY IF EXISTS "Qualquer autenticado le perfis" ON public.profiles;

CREATE POLICY "Qualquer autenticado le perfis" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura publica anon perfis" ON public.profiles FOR SELECT TO anon USING (true);
CREATE POLICY "Proprio usuario gerencia seu perfil" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Administradores gerenciam perfis" ON public.profiles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

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

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END $$;
