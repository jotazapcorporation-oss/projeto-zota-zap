-- Adicionar coluna master_id na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN master_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Criar tabela master_users para gerenciar planos família
CREATE TABLE public.master_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  limite_de_slots integer NOT NULL DEFAULT 0,
  slots_utilizados integer NOT NULL DEFAULT 0,
  status_plano text NOT NULL DEFAULT 'ativo',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(master_id)
);

-- Enable RLS on master_users
ALTER TABLE public.master_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies para master_users
CREATE POLICY "Users can view their own master plan"
ON public.master_users
FOR SELECT
USING (auth.uid() = master_id);

CREATE POLICY "Users can update their own master plan"
ON public.master_users
FOR UPDATE
USING (auth.uid() = master_id);

-- Atualizar política de SELECT em profiles para permitir que Master veja dependentes
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile and dependents"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id OR 
  auth.uid() = master_id
);

-- Trigger para atualizar updated_at em master_users
CREATE TRIGGER update_master_users_updated_at
BEFORE UPDATE ON public.master_users
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();

-- Criar índices para melhor performance
CREATE INDEX idx_profiles_master_id ON public.profiles(master_id);
CREATE INDEX idx_master_users_master_id ON public.master_users(master_id);