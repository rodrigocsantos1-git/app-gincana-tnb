-- ==============================================================================
-- SCRIPT DE LIBERAÇÃO DE ADMINISTRADORES (GINCANA ACAMPA TNB)
-- Ministério Infantil Tô na Bênção (IBP)
-- ==============================================================================

-- 1. Cria tabela de Administradores Autorizados
CREATE TABLE IF NOT EXISTS public.allowed_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilita RLS na tabela de allowed_admins para permitir leitura
ALTER TABLE public.allowed_admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura publica allowed_admins" ON public.allowed_admins;
CREATE POLICY "Leitura publica allowed_admins" ON public.allowed_admins FOR SELECT USING (true);

-- 2. Insere / Atualiza os Administradores Autorizados
INSERT INTO public.allowed_admins (email, name, role)
VALUES 
  ('rodrigocsantos1@gmail.com', 'Rodrigo Correa', 'admin'),
  ('lucianort@gmail.com', 'Luciano Tomaz', 'admin')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- 3. Atualiza os perfis já existentes no banco (se o usuário já fez login anteriormente)
UPDATE public.profiles
SET role = 'admin'
WHERE lower(email) IN ('rodrigocsantos1@gmail.com', 'lucianort@gmail.com');

-- 4. Atualiza o gatilho automático para que, quando Luciano ou Rodrigo fizerem login, 
-- já recebam o perfil de 'admin' imediatamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT := 'unauthorized';
  v_name TEXT;
BEGIN
  -- Checa se o e-mail está na lista de administradores autorizados
  SELECT role, name INTO v_role, v_name 
  FROM public.allowed_admins 
  WHERE lower(email) = lower(new.email);

  -- Se não for administrador autorizado, marca como não autorizado
  IF v_role IS NULL THEN
    v_role := 'unauthorized';
  END IF;

  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(v_name, new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    v_role
  )
  ON CONFLICT (id) DO UPDATE SET
    role = v_role,
    email = EXCLUDED.email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Consulta de confirmação para você visualizar no SQL Editor:
SELECT * FROM public.allowed_admins;
