-- Criar bucket para imagens de capa dos cards
INSERT INTO storage.buckets (id, name, public)
VALUES ('card-covers', 'card-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Criar políticas para o bucket de card-covers
CREATE POLICY "Public access to card covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'card-covers');

CREATE POLICY "Users can upload card covers"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'card-covers' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their card covers"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'card-covers' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their card covers"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'card-covers' AND
  auth.uid() IS NOT NULL
);