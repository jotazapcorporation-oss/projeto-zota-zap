-- 1. Tornar userid NOT NULL na tabela lembretes
ALTER TABLE public.lembretes ALTER COLUMN userid SET NOT NULL;

-- 2. Tornar userid NOT NULL na tabela transacoes e remover default desnecessário
ALTER TABLE public.transacoes ALTER COLUMN userid SET NOT NULL;
ALTER TABLE public.transacoes ALTER COLUMN userid DROP DEFAULT;

-- 3. Criar política de INSERT para profiles (necessária para o trigger handle_new_user)
CREATE POLICY "System can insert new profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 4. Criar função de validação para userid
CREATE OR REPLACE FUNCTION public.validate_userid()
RETURNS TRIGGER AS $$
BEGIN
  -- Garantir que userid seja sempre auth.uid() em inserções e atualizações
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.userid != auth.uid() THEN
      RAISE EXCEPTION 'userid must match authenticated user id';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Criar triggers de validação para lembretes
CREATE TRIGGER validate_lembretes_userid
  BEFORE INSERT OR UPDATE ON public.lembretes
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_userid();

-- 6. Criar triggers de validação para transacoes
CREATE TRIGGER validate_transacoes_userid
  BEFORE INSERT OR UPDATE ON public.transacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_userid();

-- 7. Criar triggers de validação para categorias
CREATE TRIGGER validate_categorias_userid
  BEFORE INSERT OR UPDATE ON public.categorias
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_userid();

-- 8. Adicionar comentários de documentação
COMMENT ON FUNCTION public.validate_userid() IS 'Validates that userid always matches auth.uid() for security';
COMMENT ON TRIGGER validate_lembretes_userid ON public.lembretes IS 'Ensures lembretes.userid always matches authenticated user';
COMMENT ON TRIGGER validate_transacoes_userid ON public.transacoes IS 'Ensures transacoes.userid always matches authenticated user';
COMMENT ON TRIGGER validate_categorias_userid ON public.categorias IS 'Ensures categorias.userid always matches authenticated user';