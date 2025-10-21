-- Remover políticas problemáticas que causam recursão
DROP POLICY IF EXISTS "Users can update own profile except admin" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all users" ON profiles;

-- Criar função security definer para verificar se usuário é admin
-- Esta função bypassa RLS, evitando recursão
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(admin, false)
  FROM public.profiles
  WHERE id = _user_id
$$;

-- Política que permite usuários atualizarem seus dados, EXCETO o campo admin
CREATE POLICY "Users can update own profile except admin"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  -- Impedir que usuários alterem seu próprio status admin
  (admin IS NULL OR admin = public.is_admin(auth.uid()))
);

-- Política que permite admins visualizarem todos os usuários
CREATE POLICY "Admins can view all users"
ON profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR public.is_admin(auth.uid())
);

-- Política que permite admins atualizarem qualquer usuário
CREATE POLICY "Admins can update all users"
ON profiles
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Política que permite admins excluírem usuários
CREATE POLICY "Admins can delete users"
ON profiles
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));