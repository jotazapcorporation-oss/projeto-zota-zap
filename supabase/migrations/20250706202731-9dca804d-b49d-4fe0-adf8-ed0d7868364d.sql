-- Etapa 1: Ativar RLS em todas as tabelas que não têm
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lembretes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;

-- Etapa 2: Configurar políticas para tabela profiles
-- Limpar políticas existentes primeiro
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;

-- Criar políticas seguras para profiles
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Etapa 3: Configurar políticas para categorias
CREATE POLICY "Users can view own categories" 
  ON public.categorias 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = userid);

CREATE POLICY "Users can insert own categories" 
  ON public.categorias 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = userid);

CREATE POLICY "Users can update own categories" 
  ON public.categorias 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = userid);

CREATE POLICY "Users can delete own categories" 
  ON public.categorias 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = userid);

-- Etapa 3: Configurar políticas para lembretes
CREATE POLICY "Users can view own reminders" 
  ON public.lembretes 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = userid);

CREATE POLICY "Users can insert own reminders" 
  ON public.lembretes 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = userid);

CREATE POLICY "Users can update own reminders" 
  ON public.lembretes 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = userid);

CREATE POLICY "Users can delete own reminders" 
  ON public.lembretes 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = userid);

-- Etapa 3: Configurar políticas para transacoes
CREATE POLICY "Users can view own transactions" 
  ON public.transacoes 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = userid);

CREATE POLICY "Users can insert own transactions" 
  ON public.transacoes 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = userid);

CREATE POLICY "Users can update own transactions" 
  ON public.transacoes 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = userid);

CREATE POLICY "Users can delete own transactions" 
  ON public.transacoes 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = userid);

-- Etapa 4: Revisar e corrigir políticas da tabela subscriptions
-- Limpar políticas existentes
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;

-- Criar política mais simples e segura para subscriptions
CREATE POLICY "Users can view own subscriptions" 
  ON public.subscriptions 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

-- Adicionar política DELETE para usuários
CREATE POLICY "Users can delete own subscriptions" 
  ON public.subscriptions 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);