-- Limpeza completa do banco de dados

-- Fase 1: Remover todas as políticas RLS
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Enable insert for service role" ON public.subscriptions;
DROP POLICY IF EXISTS "Enable update for service role" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can delete own subscriptions" ON public.subscriptions;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.transacoes;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transacoes;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transacoes;
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transacoes;

DROP POLICY IF EXISTS "Users can view own categories" ON public.categorias;
DROP POLICY IF EXISTS "Users can insert own categories" ON public.categorias;
DROP POLICY IF EXISTS "Users can update own categories" ON public.categorias;
DROP POLICY IF EXISTS "Users can delete own categories" ON public.categorias;

DROP POLICY IF EXISTS "Users can view own reminders" ON public.lembretes;
DROP POLICY IF EXISTS "Users can insert own reminders" ON public.lembretes;
DROP POLICY IF EXISTS "Users can update own reminders" ON public.lembretes;
DROP POLICY IF EXISTS "Users can delete own reminders" ON public.lembretes;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Fase 2: Desativar RLS em todas as tabelas
ALTER TABLE public.subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lembretes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Fase 3: Remover triggers
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
DROP TRIGGER IF EXISTS on_subscription_id_changed ON public.profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Fase 4: Dropar tabelas na ordem correta (considerando dependências)
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.transacoes CASCADE;
DROP TABLE IF EXISTS public.categorias CASCADE;
DROP TABLE IF EXISTS public.lembretes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Fase 5: Remover funções
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.sync_subscription_data() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;