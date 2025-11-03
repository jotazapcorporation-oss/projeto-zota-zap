-- Criar bucket público para avatares
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- RLS Policy: Qualquer um pode ver avatares
CREATE POLICY "Avatares são públicos"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- RLS Policy: Usuários podem fazer upload de seus avatares
CREATE POLICY "Usuários podem fazer upload de seus avatares"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policy: Usuários podem atualizar seus avatares
CREATE POLICY "Usuários podem atualizar seus avatares"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policy: Usuários podem deletar seus avatares
CREATE POLICY "Usuários podem deletar seus avatares"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Adicionar coluna arquivo na tabela profiles
ALTER TABLE profiles
ADD COLUMN arquivo TEXT;

-- Adicionar comentário explicativo
COMMENT ON COLUMN profiles.arquivo IS 'Path relativo do avatar no storage (ex: user-id/avatar.jpg)';