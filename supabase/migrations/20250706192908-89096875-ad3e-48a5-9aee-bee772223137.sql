-- Criar tabela subscriptions para armazenar informações completas da assinatura
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'inactive',
  plan_name TEXT,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'BRL',
  cycle TEXT,
  start_date TIMESTAMPTZ,
  next_payment_date TIMESTAMPTZ,
  payment_method TEXT,
  card_last_four TEXT,
  card_brand TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, subscription_id)
);

-- Ativar Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Criar política para que usuários só vejam suas próprias assinaturas
CREATE POLICY "Users can view own subscriptions" 
  ON public.subscriptions 
  FOR SELECT 
  USING (user_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));

-- Criar política para permitir inserção/atualização (será usado pelas edge functions)
CREATE POLICY "Enable insert for service role" 
  ON public.subscriptions 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Enable update for service role" 
  ON public.subscriptions 
  FOR UPDATE 
  USING (true);

-- Criar função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para automatic timestamp updates
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();