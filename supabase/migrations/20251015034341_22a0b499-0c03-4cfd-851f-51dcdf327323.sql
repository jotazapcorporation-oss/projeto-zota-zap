-- Adicionar novos campos para personalização e controle de caixinhas
ALTER TABLE public.caixinhas_poupanca
ADD COLUMN IF NOT EXISTS goal_icon TEXT DEFAULT 'piggy-bank',
ADD COLUMN IF NOT EXISTS card_color TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS deadline_date DATE,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Criar índice para ordenação
CREATE INDEX IF NOT EXISTS idx_caixinhas_display_order ON public.caixinhas_poupanca(user_id, display_order);

-- Atualizar a ordem existente baseada na data de criação
UPDATE public.caixinhas_poupanca
SET display_order = sub.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY data_criacao) - 1 as row_num
  FROM public.caixinhas_poupanca
) sub
WHERE caixinhas_poupanca.id = sub.id;