-- Corrigir problema do search_path na função validate_userid
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;