-- Renomear tabela master_users para family_plan
ALTER TABLE public.master_users RENAME TO family_plan;

-- Renomear índice
ALTER INDEX IF EXISTS idx_master_users_master_id RENAME TO idx_family_plan_master_id;

-- Renomear trigger
DROP TRIGGER IF EXISTS update_master_users_updated_at ON public.family_plan;
CREATE TRIGGER update_family_plan_updated_at
  BEFORE UPDATE ON public.family_plan
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Recriar políticas RLS com novos nomes
DROP POLICY IF EXISTS "Users can view their own master plan" ON public.family_plan;
DROP POLICY IF EXISTS "Users can update their own master plan" ON public.family_plan;

CREATE POLICY "Users can view their own family plan" 
  ON public.family_plan
  FOR SELECT
  USING (auth.uid() = master_id);

CREATE POLICY "Users can update their own family plan" 
  ON public.family_plan
  FOR UPDATE
  USING (auth.uid() = master_id);