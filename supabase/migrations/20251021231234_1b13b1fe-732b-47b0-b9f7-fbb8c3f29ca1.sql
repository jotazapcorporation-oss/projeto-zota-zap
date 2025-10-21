-- Remover política permissiva atual que permite atualização livre
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Política que permite usuários atualizarem seus dados, EXCETO o campo admin
CREATE POLICY "Users can update own profile except admin"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  (admin IS NULL OR admin = (SELECT admin FROM profiles WHERE id = auth.uid()))
);

-- Política que permite admins gerenciarem qualquer usuário
CREATE POLICY "Admins can manage all users"
ON profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND admin = true
  )
);